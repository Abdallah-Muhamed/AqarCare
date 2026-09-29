using AqarCare.Data;
using AqarCare.Data.Entities;
using AqarCare.DTOs;
using AqarCare.Services;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace AqarCare.Tests;

public class MapServiceTests : IDisposable
{
    private readonly AqarCareDbContext _context;
    private readonly MapService _sut;

    public MapServiceTests()
    {
        var dbOptions = new DbContextOptionsBuilder<AqarCareDbContext>()
            .UseInMemoryDatabase(databaseName: $"MapServiceDb_{Guid.NewGuid()}")
            .Options;

        _context = new AqarCareDbContext(dbOptions);
        _sut = new MapService(_context);
    }

    public void Dispose()
    {
        _context.Database.EnsureDeleted();
        _context.Dispose();
    }

    [Fact]
    public async Task GetActiveCitiesAsync_ShouldReturnOnlyActiveCitiesSortedByName()
    {
        // Arrange
        _context.MapCities.AddRange(
            new MapCity { Id = 1, Name = "طنطا", Slug = "tanta", IsActive = true },
            new MapCity { Id = 2, Name = "المحلة الكبرى", Slug = "mehalla", IsActive = true },
            new MapCity { Id = 3, Name = "المنصورة", Slug = "mansoura", IsActive = false } // Inactive
        );
        await _context.SaveChangesAsync();

        // Act
        var result = await _sut.GetActiveCitiesAsync();

        // Assert
        result.Should().HaveCount(2);
        result.Select(c => c.Slug).Should().NotContain("mansoura");
    }

    [Fact]
    public async Task GetPublicMapAsync_WhenCityDoesNotExist_ShouldReturnNull()
    {
        // Act
        var result = await _sut.GetPublicMapAsync("non-existent-city", new PropertyQuery());

        // Assert
        result.Should().BeNull();
    }
}
