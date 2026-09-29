using System.Reflection;
using System.Text;
using System.Threading.RateLimiting;
using AqarCare.Data;
using AqarCare.Data.Entities;
using AqarCare.Data.Seed;
using AqarCare.DTOs;
using AqarCare.Middleware;
using AqarCare.Services;
using AqarCare.Services.Auth;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace AqarCare
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Controllers & Standardized API Validation Response
            builder.Services.AddControllers()
                .ConfigureApiBehaviorOptions(options =>
                {
                    options.InvalidModelStateResponseFactory = context =>
                    {
                        var errors = context.ModelState
                            .Where(e => e.Value?.Errors.Count > 0)
                            .ToDictionary(
                                kvp => kvp.Key,
                                kvp => kvp.Value!.Errors.Select(er => er.ErrorMessage).ToArray()
                            );

                        var response = new ApiErrorResponse(
                            StatusCode: StatusCodes.Status400BadRequest,
                            Message: "Validation failed for one or more request fields.",
                            TraceId: context.HttpContext.TraceIdentifier,
                            Timestamp: DateTime.UtcNow,
                            ValidationErrors: errors);

                        return new BadRequestObjectResult(response);
                    };
                });

            builder.Services.AddMemoryCache();
            builder.Services.AddResponseCompression(options =>
            {
                options.EnableForHttps = true;
            });

            // JWT & Auth Configuration
            var jwtSettings = builder.Configuration.GetSection(JwtSettings.SectionName)
                .Get<JwtSettings>() ?? new JwtSettings();
            builder.Services.AddSingleton(jwtSettings);
            builder.Services.AddSingleton<IJwtTokenService, JwtTokenService>();
            builder.Services.AddSingleton<IPasswordHasher, PasswordHasher>();
            builder.Services.AddScoped<IAuthService, AuthService>();
            builder.Services.AddScoped<IInquiryService, InquiryService>();

            builder.Services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.RequireHttpsMetadata = false;
                options.SaveToken = true;
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = jwtSettings.Issuer,
                    ValidAudience = jwtSettings.Audience,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.SecretKey)),
                    ClockSkew = TimeSpan.Zero
                };
            });

            // Role-Based Authorization Policies
            builder.Services.AddAuthorization(options =>
            {
                options.AddPolicy("RequireAdmin", policy => policy.RequireRole(UserRoles.Admin));
                options.AddPolicy("RequireAgent", policy => policy.RequireRole(UserRoles.Agent));
                options.AddPolicy("RequireCustomer", policy => policy.RequireRole(UserRoles.Customer));
                options.AddPolicy("RequireAgentOrAdmin", policy => policy.RequireRole(UserRoles.Admin, UserRoles.Agent));
            });

            // Rate Limiting
            builder.Services.AddRateLimiter(options =>
            {
                options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
                options.AddFixedWindowLimiter("AuthLimiter", opt =>
                {
                    opt.PermitLimit = 10;
                    opt.Window = TimeSpan.FromMinutes(1);
                    opt.QueueLimit = 0;
                });
                options.AddFixedWindowLimiter("ApiLimiter", opt =>
                {
                    opt.PermitLimit = 120;
                    opt.Window = TimeSpan.FromMinutes(1);
                    opt.QueueLimit = 0;
                });
            });

            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen(options =>
            {
                options.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
                {
                    Title = "AqarCare Real Estate API",
                    Version = "v1",
                    Description = "RESTful API for real estate property lifecycle, customer inquiries, and GIS exploration.",
                    Contact = new Microsoft.OpenApi.Models.OpenApiContact
                    {
                        Name = "AqarCare Team",
                        Url = new Uri("https://aqar-care.vercel.app")
                    }
                });

                var xmlFilename = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
                var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFilename);
                if (File.Exists(xmlPath))
                {
                    options.IncludeXmlComments(xmlPath);
                }

                options.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
                {
                    Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
                    Name = "Authorization",
                    In = Microsoft.OpenApi.Models.ParameterLocation.Header,
                    Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
                    Scheme = "Bearer"
                });

                options.AddSecurityDefinition("ApiKey", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
                {
                    Description = "Admin API Key header for Machine-to-Machine operations. Example: \"X-Api-Key: {key}\"",
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
                                Id = "Bearer"
                            }
                        },
                        Array.Empty<string>()
                    },
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
            builder.Services.AddSingleton<ICloudinaryService, CloudinaryService>();
            builder.Services.AddSingleton<CloudinaryService>(sp => (CloudinaryService)sp.GetRequiredService<ICloudinaryService>());
            builder.Services.AddScoped<PropertyService>();
            builder.Services.AddScoped<MapService>();
            builder.Services.AddHttpClient<MansheyatElBakryOsmImportService>(client =>
            {
                client.DefaultRequestHeaders.UserAgent.ParseAdd("AqarCare-MapImporter/1.0");
                client.Timeout = TimeSpan.FromSeconds(120);
            });
            builder.Services.AddScoped<FinishingPackageService>();

            builder.Services.Configure<ForwardedHeadersOptions>(options =>
            {
                options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
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

                var passwordHasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher>();
                var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
                UserSeeder.SeedUsersAsync(db, passwordHasher, app.Configuration, logger).GetAwaiter().GetResult();
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
                        prodCity = new MapCity
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
                        var newStreet = new MapStreet
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
                            newStreet.Aliases.Add(new MapStreetAlias { Name = a.Name });
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
            app.UseMiddleware<GlobalExceptionHandlerMiddleware>();
            app.UseMiddleware<RequestLoggingMiddleware>();

            app.UseSwagger();
            app.UseSwaggerUI(c =>
            {
                c.SwaggerEndpoint("/swagger/v1/swagger.json", "AqarCare API v1");
                c.RoutePrefix = "swagger";
            });

            if (app.Environment.IsDevelopment())
            {
                app.UseCors("DevelopmentCors");
            }
            else
            {
                app.UseCors("ProductionCors");
            }

            app.UseResponseCompression();
            app.UseHttpsRedirection();
            app.UseRateLimiter();
            app.UseAuthentication();
            app.UseMiddleware<ApiKeyAuthMiddleware>();
            app.UseAuthorization();
            app.MapControllers();

            app.Run();
        }
    }
}
