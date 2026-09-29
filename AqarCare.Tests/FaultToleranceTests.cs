using AqarCare.Data;
using AqarCare.Data.Entities;
using AqarCare.DTOs;
using AqarCare.Services;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Moq;
using Xunit;

namespace AqarCare.Tests;

public class FailingDbContext : AqarCareDbContext
{
    public FailingDbContext(DbContextOptions<AqarCareDbContext> options) : base(options) { }

    public bool ShouldFail { get; set; }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        if (ShouldFail)
        {
            throw new DbUpdateException("Simulated transient database failure during media entity persistence.");
        }
        return base.SaveChangesAsync(cancellationToken);
    }
}

public class FaultToleranceTests : IDisposable
{
    private readonly FailingDbContext _context;
    private readonly IMemoryCache _cache;
    private readonly PropertyService _sut;
    private readonly Mock<ICloudinaryService> _cloudinaryMock;

    public FaultToleranceTests()
    {
        var dbOptions = new DbContextOptionsBuilder<AqarCareDbContext>()
            .UseInMemoryDatabase(databaseName: $"FaultToleranceDb_{Guid.NewGuid()}")
            .Options;

        _context = new FailingDbContext(dbOptions);
        _cache = new MemoryCache(new MemoryCacheOptions());
        _sut = new PropertyService(_context, _cache);
        _cloudinaryMock = new Mock<ICloudinaryService>();
    }

    public void Dispose()
    {
        _context.Database.EnsureDeleted();
        _context.Dispose();
        _cache.Dispose();
    }

    [Fact]
    public async Task UploadAndAttachMedia_WhenDatabaseSaveFails_ShouldInvokeCompensatingCloudinaryDeletion()
    {
        // Arrange
        const int propertyId = 777;
        _context.PropertyUnits.Add(new PropertyUnit
        {
            Id = propertyId,
            Title = "Test Property for Fault Tolerance",
            City = "المحلة الكبرى",
            PropertyType = "Apartment",
            ListingType = "Sale",
            Status = "Available",
            IsPublished = true
        });
        await _context.SaveChangesAsync();

        var formFileMock = new Mock<IFormFile>();
        formFileMock.Setup(f => f.FileName).Returns("test_image.jpg");
        formFileMock.Setup(f => f.Length).Returns(1024);

        const string uploadedPublicId = "aqarcare/fault_tolerance_test_id";
        _cloudinaryMock
            .Setup(c => c.UploadAsync(It.IsAny<IFormFile>(), It.IsAny<string?>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new MediaUploadResult(uploadedPublicId, "https://res.cloudinary.com/test.jpg", "Image"));

        _cloudinaryMock
            .Setup(c => c.DeleteAsync(uploadedPublicId, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Instruct the DbContext to throw during SaveChangesAsync (after upload has succeeded)
        _context.ShouldFail = true;

        // Act & Assert
        var act = async () => await _sut.UploadAndAttachMediaAsync(
            propertyId,
            formFileMock.Object,
            folder: "test",
            cloudinaryService: _cloudinaryMock.Object);

        await act.Should().ThrowAsync<DbUpdateException>();

        // Verify that the compensating deletion was dispatched to Cloudinary
        _cloudinaryMock.Verify(
            c => c.DeleteAsync(uploadedPublicId, It.IsAny<CancellationToken>()),
            Times.Once,
            "Compensating action must be executed to prevent orphaned assets in external cloud storage.");
    }

    [Fact]
    public async Task UploadAndAttachMedia_WhenPropertyDoesNotExist_ShouldThrowKeyNotFound_WithoutCallingUpload()
    {
        // Arrange
        var formFileMock = new Mock<IFormFile>();

        // Act
        var act = async () => await _sut.UploadAndAttachMediaAsync(
            propertyId: 99999, // Non-existent
            formFileMock.Object,
            folder: "test",
            cloudinaryService: _cloudinaryMock.Object);

        // Assert
        await act.Should().ThrowAsync<KeyNotFoundException>();
        _cloudinaryMock.Verify(c => c.UploadAsync(It.IsAny<IFormFile>(), It.IsAny<string?>(), It.IsAny<CancellationToken>()), Times.Never);
    }
}
