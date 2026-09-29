using AqarCare.Data.Entities;
using AqarCare.Services.Auth;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace AqarCare.Data.Seed;

public static class UserSeeder
{
    public static async Task SeedUsersAsync(
        AqarCareDbContext context,
        IPasswordHasher passwordHasher,
        IConfiguration configuration,
        ILogger logger)
    {
        // 1. Seed Admin if not exists
        var adminUsername = configuration["Admin:Username"] ?? "admin";
        var adminPassword = configuration["Admin:Password"] ?? "Admin123!Secure";
        var adminEmail = configuration["Admin:Email"] ?? "admin@aqarcare.com";

        var adminExists = await context.Users.AnyAsync(u => u.Role == UserRoles.Admin);
        if (!adminExists)
        {
            var adminUser = new User
            {
                Username = adminUsername,
                Email = adminEmail,
                FullName = "AqarCare Administrator",
                PhoneNumber = "+201000000001",
                Role = UserRoles.Admin,
                PasswordHash = passwordHasher.HashPassword(adminPassword),
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };
            context.Users.Add(adminUser);
            logger.LogInformation("Seeded default Admin user: {Username}", adminUsername);
        }

        // 2. Seed Agent if not exists
        var agentExists = await context.Users.AnyAsync(u => u.Role == UserRoles.Agent);
        if (!agentExists)
        {
            var agentUser = new User
            {
                Username = "agent_samir",
                Email = "agent.samir@aqarcare.com",
                FullName = "Samir Ibrahim (Real Estate Agent)",
                PhoneNumber = "+201000000002",
                Role = UserRoles.Agent,
                PasswordHash = passwordHasher.HashPassword("Agent123!Secure"),
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };
            context.Users.Add(agentUser);
            logger.LogInformation("Seeded default Agent user: {Username}", agentUser.Username);
        }

        // 3. Seed Customer if not exists
        var customerExists = await context.Users.AnyAsync(u => u.Role == UserRoles.Customer);
        if (!customerExists)
        {
            var customerUser = new User
            {
                Username = "customer_ahmed",
                Email = "customer.ahmed@gmail.com",
                FullName = "Ahmed Mahmoud (Customer)",
                PhoneNumber = "+201000000003",
                Role = UserRoles.Customer,
                PasswordHash = passwordHasher.HashPassword("Customer123!Secure"),
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };
            context.Users.Add(customerUser);
            logger.LogInformation("Seeded default Customer user: {Username}", customerUser.Username);
        }

        await context.SaveChangesAsync();
    }
}
