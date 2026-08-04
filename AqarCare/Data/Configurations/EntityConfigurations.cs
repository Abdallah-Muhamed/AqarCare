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
        builder.Property(x => x.SoldPrice).HasPrecision(18, 2);
        builder.Property(x => x.AreaSqm).HasPrecision(18, 2);
        builder.HasIndex(x => x.IsPublished);
        builder.HasIndex(x => x.City);
        builder.HasIndex(x => x.PropertyType);
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
