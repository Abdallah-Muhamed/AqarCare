
using AqarCare.Data;
using AqarCare.Middleware;
using AqarCare.Services;
using Microsoft.EntityFrameworkCore;

namespace AqarCare
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            builder.Services.AddControllers();
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen(options =>
            {
                options.AddSecurityDefinition("ApiKey", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
                {
                    Description = "Admin API Key. Header: X-Api-Key",
                    Name = "X-Api-Key",
                    In = Microsoft.OpenApi.Models.ParameterLocation.Header,
                    Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey
                });
                options.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
                {
                    {
                        new Microsoft.OpenApi.Models.OpenApiSecurityScheme
                        {
                            Reference = new Microsoft.OpenApi.Models.OpenApiReference
                            {
                                Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                                Id = "ApiKey"
                            }
                        },
                        Array.Empty<string>()
                    }
                });
            });

            builder.Services.AddDbContext<AqarCareDbContext>(options =>
                options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

            var cloudinarySettings = builder.Configuration.GetSection(CloudinarySettings.SectionName)
                .Get<CloudinarySettings>() ?? new CloudinarySettings();
            builder.Services.AddSingleton(cloudinarySettings);
            builder.Services.AddSingleton<CloudinaryService>();
            builder.Services.AddScoped<PropertyService>();
            builder.Services.AddScoped<MapService>();
            builder.Services.AddHttpClient<MansheyatElBakryOsmImportService>(client =>
            {
                client.DefaultRequestHeaders.UserAgent.ParseAdd("AqarCare-MapImporter/1.0");
                client.Timeout = TimeSpan.FromSeconds(120);
            });
            builder.Services.AddScoped<FinishingPackageService>();
            builder.Services.AddHttpClient<AIBrokerService>(client =>
            {
                client.Timeout = TimeSpan.FromSeconds(60);
            });

            builder.Services.Configure<ForwardedHeadersOptions>(options =>
            {
                options.ForwardedHeaders = Microsoft.AspNetCore.HttpOverrides.ForwardedHeaders.XForwardedFor |
                                           Microsoft.AspNetCore.HttpOverrides.ForwardedHeaders.XForwardedProto;
                options.KnownNetworks.Clear();
                options.KnownProxies.Clear();
            });

            builder.Services.AddCors(options =>
            {
                options.AddPolicy("DevelopmentCors", policy =>
                    policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());

                options.AddPolicy("ProductionCors", policy =>
                {
                    policy.SetIsOriginAllowed(origin => true)
                          .AllowAnyHeader()
                          .AllowAnyMethod();
                });
            });

            var app = builder.Build();

            using (var scope = app.Services.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<AqarCareDbContext>();
                db.Database.Migrate();
            }

            if (args.Contains("--fix-house-properties", StringComparer.OrdinalIgnoreCase))
            {
                using var scope = app.Services.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<AqarCareDbContext>();
                var houseIds = db.PropertyUnits
                    .Where(p => p.PropertyType == "House" || p.PropertyType == "Villa")
                    .Select(p => p.Id)
                    .ToList();
                Console.WriteLine($"Found {houseIds.Count} house/villa properties: {string.Join(", ", houseIds)}");
                var houseFloors = db.PropertyFloors
                    .Where(f => houseIds.Contains(f.PropertyUnitId))
                    .ToList();
                foreach (var f in houseFloors)
                {
                    f.Price = null;
                    f.PricePerMeter = null;
                    f.InstallmentPrice = null;
                    f.IsAvailable = true;
                }
                var rows = db.SaveChanges();
                Console.WriteLine($"Fixed house properties: Cleared prices on {rows} floor records.");
                return;
            }

            if (args.Contains("--sync-local-map-to-prod", StringComparer.OrdinalIgnoreCase))
            {
                var prodConn = builder.Configuration.GetConnectionString("DefaultConnection");
                if (string.IsNullOrEmpty(prodConn))
                {
                    Console.WriteLine("Connection string 'DefaultConnection' is missing.");
                    return;
                }

                var localConn = builder.Configuration.GetConnectionString("LocalConnection")
                    ?? "Server=(localdb)\\mssqllocaldb;Database=AqarCareDb;Trusted_Connection=True;TrustServerCertificate=True;";

                var localOptions = new DbContextOptionsBuilder<AqarCareDbContext>()
                    .UseSqlServer(localConn)
                    .Options;
                var prodOptions = new DbContextOptionsBuilder<AqarCareDbContext>()
                    .UseSqlServer(prodConn)
                    .Options;

                using var localDb = new AqarCareDbContext(localOptions);
                using var prodDb = new AqarCareDbContext(prodOptions);

                var localCity = localDb.MapCities
                    .Include(c => c.Streets)
                    .ThenInclude(s => s.Aliases)
                    .FirstOrDefault(c => c.Slug == "mansheyat-el-bakry");

                if (localCity != null)
                {
                    var prodCity = prodDb.MapCities.FirstOrDefault(c => c.Slug == "mansheyat-el-bakry");
                    if (prodCity == null)
                    {
                        prodCity = new AqarCare.Data.Entities.MapCity
                        {
                            Name = localCity.Name,
                            Slug = localCity.Slug,
                            IsActive = localCity.IsActive,
                            CreatedAt = localCity.CreatedAt,
                            UpdatedAt = localCity.UpdatedAt
                        };
                        prodDb.MapCities.Add(prodCity);
                        prodDb.SaveChanges();
                    }

                    var existingNames = prodDb.MapStreets.Where(s => s.MapCityId == prodCity.Id).Select(s => s.Name).ToHashSet();
                    foreach (var s in localCity.Streets)
                    {
                        if (existingNames.Contains(s.Name)) continue;
                        var newStreet = new AqarCare.Data.Entities.MapStreet
                        {
                            MapCityId = prodCity.Id,
                            Name = s.Name,
                            WidthMeters = s.WidthMeters,
                            LengthMeters = s.LengthMeters,
                            StreetType = s.StreetType,
                            TrafficDirection = s.TrafficDirection,
                            SurfaceType = s.SurfaceType,
                            Importance = s.Importance,
                            GeometryJson = s.GeometryJson,
                            AttributesJson = s.AttributesJson,
                            SortOrder = s.SortOrder,
                            IsActive = s.IsActive,
                            CreatedAt = s.CreatedAt,
                            UpdatedAt = s.UpdatedAt
                        };
                        foreach (var a in s.Aliases)
                        {
                            newStreet.Aliases.Add(new AqarCare.Data.Entities.MapStreetAlias { Name = a.Name });
                        }
                        prodDb.MapStreets.Add(newStreet);
                    }
                    prodDb.SaveChanges();
                    Console.WriteLine("SYNC SUCCESS! Imported streets to production DB.");
                }
                return;
            }

            if (args.Contains("--import-mansheyat-el-bakry-roads", StringComparer.OrdinalIgnoreCase))
            {
                using var scope = app.Services.CreateScope();
                var importer = scope.ServiceProvider.GetRequiredService<MansheyatElBakryOsmImportService>();
                var result = importer.ImportAsync().GetAwaiter().GetResult();
                Console.WriteLine($"Imported {result.StreetsImported} streets and {result.RoadSegmentsImported} road segments for {result.MapName}.");
                return;
            }

            app.UseForwardedHeaders();
            app.UseSwagger();
            app.UseSwaggerUI();

            if (app.Environment.IsDevelopment())
            {
                app.UseCors("DevelopmentCors");
            }
            else
            {
                app.UseCors("ProductionCors");
            }

            app.UseHttpsRedirection();
            app.UseMiddleware<ApiKeyAuthMiddleware>();
            app.UseAuthorization();
            app.MapControllers();

            app.Run();
        }
    }
}
