using AqarCare.Data;
using AqarCare.Data.Entities;
using AqarCare.DTOs;
using AqarCare.Services;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Xunit;

namespace AqarCare.Tests;

public class PropertyServiceTests : IDisposable
{
    private readonly AqarCareDbContext _context;
    private readonly IMemoryCache _cache;
    private readonly PropertyService _sut; // System Under Test

    public PropertyServiceTests()
    {
        var dbOptions = new DbContextOptionsBuilder<AqarCareDbContext>()
            .UseInMemoryDatabase(databaseName: $"AqarCareTestDb_{Guid.NewGuid()}")
            .Options;

        _context = new AqarCareDbContext(dbOptions);
        _cache = new MemoryCache(new MemoryCacheOptions());
        _sut = new PropertyService(_context, _cache);
    }

    public void Dispose()
    {
        _context.Database.EnsureDeleted();
        _context.Dispose();
        _cache.Dispose();
    }

    [Fact]
    public async Task GetPublishedAsync_ShouldReturnOnlyPublishedProperties()
    {
        // Arrange
        _context.PropertyUnits.AddRange(
            new PropertyUnit
            {
                Id = 1,
                Title = "Published Apartment",
                City = "المحلة الكبرى",
                PropertyType = "Apartment",
                ListingType = "Sale",
                Status = "Available",
                IsPublished = true,
                Price = 1_000_000
            },
            new PropertyUnit
            {
                Id = 2,
                Title = "Draft Apartment",
                City = "المحلة الكبرى",
                PropertyType = "Apartment",
                ListingType = "Sale",
                Status = "Available",
                IsPublished = false,
                Price = 1_500_000
            }
        );
        await _context.SaveChangesAsync();

        // Act
        var result = await _sut.GetPublishedAsync(new PropertyQuery());

        // Assert
        result.TotalCount.Should().Be(1);
        result.Items.Should().ContainSingle();
        result.Items.First().Title.Should().Be("Published Apartment");
    }

    [Fact]
    public async Task GetPublishedAsync_ShouldFilterByCityAndPropertyType()
    {
        // Arrange
        _context.PropertyUnits.AddRange(
            new PropertyUnit
            {
                Id = 10,
                Title = "Apartment in Mehalla",
                City = "المحلة الكبرى",
                PropertyType = "Apartment",
                ListingType = "Sale",
                Status = "Available",
                IsPublished = true
            },
            new PropertyUnit
            {
                Id = 11,
                Title = "House in Mehalla",
                City = "المحلة الكبرى",
                PropertyType = "House",
                ListingType = "Sale",
                Status = "Available",
                IsPublished = true
            },
            new PropertyUnit
            {
                Id = 12,
                Title = "Apartment in Mansoura",
                City = "المنصورة",
                PropertyType = "Apartment",
                ListingType = "Sale",
                Status = "Available",
                IsPublished = true
            }
        );
        await _context.SaveChangesAsync();

        // Act
        var result = await _sut.GetPublishedAsync(new PropertyQuery
        {
            City = "المحلة الكبرى",
            PropertyType = "Apartment"
        });

        // Assert
        result.TotalCount.Should().Be(1);
        result.Items.First().Id.Should().Be(10);
    }

    [Fact]
    public async Task GetPublishedAsync_ShouldCalculatePaginationCorrectly()
    {
        // Arrange
        for (int i = 1; i <= 25; i++)
        {
            _context.PropertyUnits.Add(new PropertyUnit
            {
                Id = 100 + i,
                Title = $"Unit {i}",
                City = "المحلة الكبرى",
                PropertyType = "Apartment",
                ListingType = "Sale",
                Status = "Available",
                IsPublished = true,
                CreatedAt = DateTime.UtcNow.AddMinutes(i)
            });
        }
        await _context.SaveChangesAsync();

        // Act
        var page1 = await _sut.GetPublishedAsync(new PropertyQuery { Page = 1, PageSize = 10 });
        var page3 = await _sut.GetPublishedAsync(new PropertyQuery { Page = 3, PageSize = 10 });

        // Assert
        page1.TotalCount.Should().Be(25);
        page1.Items.Count.Should().Be(10);
        page3.Items.Count.Should().Be(5);
    }

    [Fact]
    public async Task CreateAsync_ShouldPersistProperty_AndCalculateFloorPricing()
    {
        // Arrange
        var request = new CreatePropertyRequest(
            Title: "Brand New Tower Apartment",
            Description: "High-spec residential building",
            Price: null, // Should derive from minimum floor price
            AreaSqm: 150,
            Bedrooms: 3,
            Bathrooms: 2,
            PropertyType: "Apartment",
            ListingType: "Sale",
            FinishingStatus: "Super-Lux",
            FinishingPackageId: null,
            InstallmentAvailable: true,
            FloorNumber: 4,
            City: "المحلة الكبرى",
            District: "منشية البكري",
            Address: "شارع الجيش",
            DetailedAddress: "برج الفردوس",
            Status: "Available",
            IsFeatured: true,
            IsPublished: true,
            NumberOfFloors: null,
            FloorsFinishing: null,
            Floors: new List<PropertyFloorInput>
            {
                new(null, 1, "الدور الأول", 800_000, null, 1_000_000, AreaSqm: 150),
                new(null, 2, "الدور الثاني", 900_000, null, 1_100_000, AreaSqm: 150)
            }
        );

        // Act
        var created = await _sut.CreateAsync(request);

        // Assert
        created.Should().NotBeNull();
        created.Title.Should().Be("Brand New Tower Apartment");
        created.Price.Should().Be(800_000); // Derived from first/min floor price
        created.Floors.Should().HaveCount(2);

        var inDb = await _context.PropertyUnits.Include(p => p.Floors).FirstOrDefaultAsync(p => p.Id == created.Id);
        inDb.Should().NotBeNull();
        inDb!.Floors.Should().HaveCount(2);
    }

    [Fact]
    public async Task DeleteAsync_ShouldRemovePropertyFromDatabase()
    {
        // Arrange
        var entity = new PropertyUnit
        {
            Id = 50,
            Title = "Unit To Delete",
            City = "المحلة الكبرى",
            PropertyType = "Apartment",
            ListingType = "Sale",
            Status = "Available",
            IsPublished = true
        };
        _context.PropertyUnits.Add(entity);
        await _context.SaveChangesAsync();

        // Act
        var deleted = await _sut.DeleteAsync(50);

        // Assert
        deleted.Should().BeTrue();
        var exists = await _context.PropertyUnits.AnyAsync(p => p.Id == 50);
        exists.Should().BeFalse();
    }

    [Fact]
    public async Task UpdateAsync_ShouldUpdatePropertyFieldsSuccessfully()
    {
        // Arrange
        var entity = new PropertyUnit
        {
            Id = 60,
            Title = "Original Title",
            Price = 500_000,
            City = "المحلة الكبرى",
            PropertyType = "Apartment",
            ListingType = "Sale",
            Status = "Available",
            IsPublished = true
        };
        _context.PropertyUnits.Add(entity);
        await _context.SaveChangesAsync();

        var updateRequest = new UpdatePropertyRequest(
            Title: "Updated Title After Renovation",
            Description: "Updated description",
            Price: 750_000,
            SoldPrice: null,
            AreaSqm: 120,
            Bedrooms: 2,
            Bathrooms: 1,
            PropertyType: "Apartment",
            ListingType: "Sale",
            FinishingStatus: "Finished",
            FinishingPackageId: null,
            InstallmentAvailable: false,
            FloorNumber: 3,
            City: "المحلة الكبرى",
            District: "الجمهورية",
            Address: "شارع البحر",
            DetailedAddress: "عمارة النور",
            Status: "Available",
            IsFeatured: true,
            IsPublished: true,
            NumberOfFloors: null,
            FloorsFinishing: null
        );

        // Act
        var result = await _sut.UpdateAsync(60, updateRequest);

        // Assert
        result.Should().NotBeNull();
        result!.Title.Should().Be("Updated Title After Renovation");
        result.Price.Should().Be(750_000);
        result.IsFeatured.Should().BeTrue();
    }
}
