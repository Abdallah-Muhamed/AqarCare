using AqarCare.Data.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AqarCare.Data.Configurations;

public class PropertyUnitConfiguration : IEntityTypeConfiguration<PropertyUnit>
{
    public void Configure(EntityTypeBuilder<PropertyUnit> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Title).HasMaxLength(200).IsRequired();
        builder.Property(x => x.PropertyType).HasMaxLength(50).IsRequired();
        builder.Property(x => x.ListingType).HasMaxLength(20).IsRequired();
        builder.Property(x => x.City).HasMaxLength(100).IsRequired();
        builder.Property(x => x.District).HasMaxLength(100);
        builder.Property(x => x.Address).HasMaxLength(300);
        builder.Property(x => x.Status).HasMaxLength(20).IsRequired();
        builder.Property(x => x.Price).HasPrecision(18, 2);
        builder.Property(x => x.InstallmentPrice).HasPrecision(18, 2);
        builder.Property(x => x.SoldPrice).HasPrecision(18, 2);
        builder.Property(x => x.AreaSqm).HasPrecision(18, 2);
        builder.Property(x => x.IsUnderConstruction).HasDefaultValue(false);
        builder.Property(x => x.RowVersion).IsRowVersion();
        builder.HasIndex(x => x.IsPublished);
        builder.HasIndex(x => x.City);
        builder.HasIndex(x => x.PropertyType);
        builder.HasIndex(x => x.IsUnderConstruction);
        builder.HasIndex(x => x.AgentId);

        builder.HasOne(x => x.Agent)
            .WithMany()
            .HasForeignKey(x => x.AgentId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}

public class PropertyFloorConfiguration : IEntityTypeConfiguration<PropertyFloor>
{
    public void Configure(EntityTypeBuilder<PropertyFloor> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.FloorName).HasMaxLength(100);
        builder.Property(x => x.Price).HasPrecision(18, 2);
        builder.Property(x => x.PricePerMeter).HasPrecision(18, 2);
        builder.Property(x => x.InstallmentPrice).HasPrecision(18, 2);
        builder.Property(x => x.AreaSqm).HasPrecision(18, 2);
        builder.Property(x => x.FinishingStatus).HasMaxLength(50);
        builder.HasIndex(x => x.PropertyUnitId);
        builder.HasOne(x => x.PropertyUnit)
            .WithMany(x => x.Floors)
            .HasForeignKey(x => x.PropertyUnitId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class PropertyMediaConfiguration : IEntityTypeConfiguration<PropertyMedia>
{
    public void Configure(EntityTypeBuilder<PropertyMedia> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.MediaType).HasMaxLength(20).IsRequired();
        builder.Property(x => x.CloudinaryPublicId).HasMaxLength(300);
        builder.Property(x => x.Url).HasMaxLength(500).IsRequired();
        builder.HasOne(x => x.PropertyUnit)
            .WithMany(x => x.Media)
            .HasForeignKey(x => x.PropertyUnitId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class MapCityConfiguration : IEntityTypeConfiguration<MapCity>
{
    public void Configure(EntityTypeBuilder<MapCity> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Name).HasMaxLength(100).IsRequired();
        builder.Property(x => x.Slug).HasMaxLength(100).IsRequired();
        builder.HasIndex(x => x.Slug).IsUnique();
        builder.HasIndex(x => x.IsActive);
    }
}

public class MapStreetConfiguration : IEntityTypeConfiguration<MapStreet>
{
    public void Configure(EntityTypeBuilder<MapStreet> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Name).HasMaxLength(200).IsRequired();
        builder.Property(x => x.WidthMeters).HasPrecision(8, 2);
        builder.Property(x => x.LengthMeters).HasPrecision(10, 2);
        builder.Property(x => x.StreetType).HasMaxLength(50);
        builder.Property(x => x.TrafficDirection).HasMaxLength(50);
        builder.Property(x => x.SurfaceType).HasMaxLength(50);
        builder.Property(x => x.GeometryJson).HasMaxLength(20000);
        builder.Property(x => x.AttributesJson).HasMaxLength(10000);
        builder.HasIndex(x => new { x.MapCityId, x.Name }).IsUnique();
        builder.HasOne(x => x.MapCity)
            .WithMany(x => x.Streets)
            .HasForeignKey(x => x.MapCityId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class MapStreetAliasConfiguration : IEntityTypeConfiguration<MapStreetAlias>
{
    public void Configure(EntityTypeBuilder<MapStreetAlias> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Name).HasMaxLength(200).IsRequired();
        builder.HasIndex(x => new { x.MapStreetId, x.Name }).IsUnique();
        builder.HasIndex(x => x.Name);
        builder.HasOne(x => x.MapStreet)
            .WithMany(x => x.Aliases)
            .HasForeignKey(x => x.MapStreetId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class PropertyMapLocationConfiguration : IEntityTypeConfiguration<PropertyMapLocation>
{
    public void Configure(EntityTypeBuilder<PropertyMapLocation> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.X).HasPrecision(9, 8);
        builder.Property(x => x.Y).HasPrecision(9, 8);
        builder.HasIndex(x => x.PropertyUnitId).IsUnique();
        builder.HasIndex(x => x.MapStreetId);
        builder.HasOne(x => x.PropertyUnit)
            .WithOne(x => x.MapLocation)
            .HasForeignKey<PropertyMapLocation>(x => x.PropertyUnitId)
            .OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(x => x.MapStreet)
            .WithMany(x => x.PropertyLocations)
            .HasForeignKey(x => x.MapStreetId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

public class FinishingPackageConfiguration : IEntityTypeConfiguration<FinishingPackage>
{
    public void Configure(EntityTypeBuilder<FinishingPackage> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Name).HasMaxLength(100).IsRequired();
        builder.Property(x => x.Slug).HasMaxLength(100).IsRequired();
        builder.Property(x => x.ShortDescription).HasMaxLength(500).IsRequired();
        builder.Property(x => x.Description).HasMaxLength(4000).IsRequired();
        builder.Property(x => x.PricePerSqm).HasPrecision(18, 2);
        builder.Property(x => x.SupervisionPercent).HasPrecision(5, 2);
        builder.HasIndex(x => x.Slug).IsUnique();
        builder.HasIndex(x => x.IsActive);
    }
}

public class PackagePaymentPhaseConfiguration : IEntityTypeConfiguration<PackagePaymentPhase>
{
    public void Configure(EntityTypeBuilder<PackagePaymentPhase> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.PhaseDescription).HasMaxLength(500).IsRequired();
        builder.HasOne(x => x.FinishingPackage)
            .WithMany(x => x.PaymentPhases)
            .HasForeignKey(x => x.FinishingPackageId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class PackageSectionConfiguration : IEntityTypeConfiguration<PackageSection>
{
    public void Configure(EntityTypeBuilder<PackageSection> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Title).HasMaxLength(200).IsRequired();
        builder.HasOne(x => x.FinishingPackage)
            .WithMany(x => x.Sections)
            .HasForeignKey(x => x.FinishingPackageId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class PackageFeatureItemConfiguration : IEntityTypeConfiguration<PackageFeatureItem>
{
    public void Configure(EntityTypeBuilder<PackageFeatureItem> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Text).HasMaxLength(1000).IsRequired();
        builder.HasOne(x => x.PackageSection)
            .WithMany(x => x.FeatureItems)
            .HasForeignKey(x => x.PackageSectionId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class PackageNoteConfiguration : IEntityTypeConfiguration<PackageNote>
{
    public void Configure(EntityTypeBuilder<PackageNote> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Text).HasMaxLength(1000).IsRequired();
        builder.HasOne(x => x.FinishingPackage)
            .WithMany(x => x.Notes)
            .HasForeignKey(x => x.FinishingPackageId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class PackageMediaConfiguration : IEntityTypeConfiguration<PackageMedia>
{
    public void Configure(EntityTypeBuilder<PackageMedia> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.MediaType).HasMaxLength(20).IsRequired();
        builder.Property(x => x.CloudinaryPublicId).HasMaxLength(300);
        builder.Property(x => x.Url).HasMaxLength(500).IsRequired();
        builder.HasOne(x => x.FinishingPackage)
            .WithMany(x => x.Media)
            .HasForeignKey(x => x.FinishingPackageId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Username).HasMaxLength(100).IsRequired();
        builder.Property(x => x.Email).HasMaxLength(200).IsRequired();
        builder.Property(x => x.PasswordHash).HasMaxLength(500).IsRequired();
        builder.Property(x => x.FullName).HasMaxLength(150).IsRequired();
        builder.Property(x => x.PhoneNumber).HasMaxLength(50);
        builder.Property(x => x.Role).HasMaxLength(50).IsRequired();
        builder.HasIndex(x => x.Username).IsUnique();
        builder.HasIndex(x => x.Email).IsUnique();
        builder.HasIndex(x => x.Role);
    }
}

public class PropertyInquiryConfiguration : IEntityTypeConfiguration<PropertyInquiry>
{
    public void Configure(EntityTypeBuilder<PropertyInquiry> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.CustomerName).HasMaxLength(150).IsRequired();
        builder.Property(x => x.CustomerPhone).HasMaxLength(50).IsRequired();
        builder.Property(x => x.CustomerEmail).HasMaxLength(200);
        builder.Property(x => x.Message).HasMaxLength(2000).IsRequired();
        builder.Property(x => x.Status).HasMaxLength(50).IsRequired();

        builder.HasIndex(x => x.PropertyUnitId);
        builder.HasIndex(x => x.CustomerId);
        builder.HasIndex(x => x.Status);

        builder.HasOne(x => x.PropertyUnit)
            .WithMany()
            .HasForeignKey(x => x.PropertyUnitId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.Customer)
            .WithMany()
            .HasForeignKey(x => x.CustomerId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
