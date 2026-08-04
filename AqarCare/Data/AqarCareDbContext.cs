using AqarCare.Data.Entities;
using AqarCare.Data.Seed;
using Microsoft.EntityFrameworkCore;

namespace AqarCare.Data;

public class AqarCareDbContext : DbContext
{
    public AqarCareDbContext(DbContextOptions<AqarCareDbContext> options) : base(options)
    {
    }

    public DbSet<PropertyUnit> PropertyUnits => Set<PropertyUnit>();
    public DbSet<PropertyMedia> PropertyMedia => Set<PropertyMedia>();
    public DbSet<FinishingPackage> FinishingPackages => Set<FinishingPackage>();
    public DbSet<PackagePaymentPhase> PackagePaymentPhases => Set<PackagePaymentPhase>();
    public DbSet<PackageSection> PackageSections => Set<PackageSection>();
    public DbSet<PackageFeatureItem> PackageFeatureItems => Set<PackageFeatureItem>();
    public DbSet<PackageNote> PackageNotes => Set<PackageNote>();
    public DbSet<PackageMedia> PackageMedia => Set<PackageMedia>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AqarCareDbContext).Assembly);
        FinishingPackageSeeder.Seed(modelBuilder);
        base.OnModelCreating(modelBuilder);
    }
}
