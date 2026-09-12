
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
