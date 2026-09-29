using AqarCare.Data;
using AqarCare.Data.Entities;
using AqarCare.DTOs;
using AqarCare.Services;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace AqarCare.Tests;

public class InquiryServiceTests : IDisposable
{
    private readonly AqarCareDbContext _context;
    private readonly InquiryService _sut;
    private readonly Mock<ILogger<InquiryService>> _loggerMock;

    public InquiryServiceTests()
    {
        var dbOptions = new DbContextOptionsBuilder<AqarCareDbContext>()
            .UseInMemoryDatabase(databaseName: $"InquiryTestDb_{Guid.NewGuid()}")
            .Options;

        _context = new AqarCareDbContext(dbOptions);
        _loggerMock = new Mock<ILogger<InquiryService>>();
        _sut = new InquiryService(_context, _loggerMock.Object);

        // Seed sample properties and agents
        _context.PropertyUnits.AddRange(
            new PropertyUnit
            {
                Id = 10,
                Title = "Agent 1 Luxury Villa",
                PropertyType = "Villa",
                ListingType = "Sale",
                Status = "Available",
                AgentId = 100, // Assigned to Agent 100
                IsPublished = true
            },
            new PropertyUnit
            {
                Id = 20,
                Title = "Agent 2 Commercial Shop",
                PropertyType = "Shop",
                ListingType = "Sale",
                Status = "Available",
                AgentId = 200, // Assigned to Agent 200
                IsPublished = true
            }
        );
        _context.SaveChanges();
    }

    public void Dispose()
    {
        _context.Database.EnsureDeleted();
        _context.Dispose();
    }

    [Fact]
    public async Task CreateInquiryAsync_WithValidProperty_ShouldSucceed()
    {
        // Arrange
        var request = new CreateInquiryRequest(
            CustomerName: "Mona Hassan",
            CustomerPhone: "+201099998888",
            CustomerEmail: "mona@example.com",
            Message: "I would like to inquire about the installment options.");

        // Act
        var (success, error, result) = await _sut.CreateInquiryAsync(10, request, customerId: 50);

        // Assert
        success.Should().BeTrue();
        error.Should().BeNull();
        result.Should().NotBeNull();
        result!.PropertyUnitId.Should().Be(10);
        result.CustomerName.Should().Be("Mona Hassan");
        result.CustomerId.Should().Be(50);
        result.Status.Should().Be(InquiryStatus.Pending);

        var persisted = await _context.PropertyInquiries.FirstOrDefaultAsync(i => i.Id == result.Id);
        persisted.Should().NotBeNull();
        persisted!.CustomerPhone.Should().Be("+201099998888");
    }

    [Fact]
    public async Task CreateInquiryAsync_WithNonExistentProperty_ShouldFail()
    {
        // Arrange
        var request = new CreateInquiryRequest("Test", "123", null, "Hello");

        // Act
        var (success, error, result) = await _sut.CreateInquiryAsync(9999, request);

        // Assert
        success.Should().BeFalse();
        error.Should().Contain("not found");
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetAgentInquiriesAsync_ShouldReturnOnlyInquiriesForAgentListings()
    {
        // Arrange: 2 inquiries on Agent 100's property, 1 on Agent 200's property
        _context.PropertyInquiries.AddRange(
            new PropertyInquiry { PropertyUnitId = 10, CustomerName = "C1", CustomerPhone = "111", Message = "Msg1", Status = InquiryStatus.Pending },
            new PropertyInquiry { PropertyUnitId = 10, CustomerName = "C2", CustomerPhone = "222", Message = "Msg2", Status = InquiryStatus.Contacted },
            new PropertyInquiry { PropertyUnitId = 20, CustomerName = "C3", CustomerPhone = "333", Message = "Msg3", Status = InquiryStatus.Pending }
        );
        await _context.SaveChangesAsync();

        // Act
        var agent100Inquiries = await _sut.GetAgentInquiriesAsync(agentId: 100);

        // Assert
        agent100Inquiries.Should().HaveCount(2);
        agent100Inquiries.Should().OnlyContain(i => i.PropertyUnitId == 10);
    }

    [Fact]
    public async Task UpdateStatusAsync_WhenAgentAttemptsUnauthorizedUpdate_ShouldFail()
    {
        // Arrange
        var inquiry = new PropertyInquiry
        {
            PropertyUnitId = 10, // Belongs to Agent 100
            CustomerName = "John",
            CustomerPhone = "0100",
            Message = "Inquiry",
            Status = InquiryStatus.Pending
        };
        _context.PropertyInquiries.Add(inquiry);
        await _context.SaveChangesAsync();

        // Act: Agent 200 tries to update Agent 100's property inquiry
        var (success, error, _) = await _sut.UpdateStatusAsync(inquiry.Id, InquiryStatus.Contacted, userId: 200, userRole: UserRoles.Agent);

        // Assert
        success.Should().BeFalse();
        error.Should().Contain("permission");
    }

    [Fact]
    public async Task UpdateStatusAsync_WhenAdminUpdatesAnyInquiry_ShouldSucceed()
    {
        // Arrange
        var inquiry = new PropertyInquiry
        {
            PropertyUnitId = 10,
            CustomerName = "John",
            CustomerPhone = "0100",
            Message = "Inquiry",
            Status = InquiryStatus.Pending
        };
        _context.PropertyInquiries.Add(inquiry);
        await _context.SaveChangesAsync();

        // Act: Admin updates inquiry
        var (success, error, result) = await _sut.UpdateStatusAsync(inquiry.Id, InquiryStatus.Closed, userId: 1, userRole: UserRoles.Admin);

        // Assert
        success.Should().BeTrue();
        error.Should().BeNull();
        result!.Status.Should().Be(InquiryStatus.Closed);
    }
}
