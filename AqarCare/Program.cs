
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
            builder.Services.AddScoped<FinishingPackageService>();

            builder.Services.AddCors(options =>
            {
                options.AddPolicy("DevelopmentCors", policy =>
                    policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());

                // Read allowed origins from config (Cors:AllowedOrigins in appsettings.Production.json)
                var allowedOrigins = builder.Configuration
                    .GetSection("Cors:AllowedOrigins")
                    .Get<string[]>() ?? [];

                options.AddPolicy("ProductionCors", policy =>
                {
                    if (allowedOrigins.Length > 0)
                        policy.WithOrigins(allowedOrigins).AllowAnyHeader().AllowAnyMethod();
                    else
                        policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
                });
            });

            var app = builder.Build();

            using (var scope = app.Services.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<AqarCareDbContext>();
                db.Database.Migrate();
            }

            // Swagger only in Development — do NOT expose in Production
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
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
