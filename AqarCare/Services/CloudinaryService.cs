using AqarCare.DTOs;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;

namespace AqarCare.Services;

public class CloudinarySettings
{
    public const string SectionName = "Cloudinary";
    public string CloudName { get; set; } = string.Empty;
    public string ApiKey { get; set; } = string.Empty;
    public string ApiSecret { get; set; } = string.Empty;
    public string Folder { get; set; } = "aqarcare";
}

public class CloudinaryService
{
    private readonly Cloudinary _cloudinary;
    private readonly CloudinarySettings _settings;

    public CloudinaryService(CloudinarySettings settings)
    {
        _settings = settings;
        var account = new Account(settings.CloudName, settings.ApiKey, settings.ApiSecret);
        _cloudinary = new Cloudinary(account);
    }

    public bool IsConfigured =>
        !string.IsNullOrWhiteSpace(_settings.CloudName) &&
        !string.IsNullOrWhiteSpace(_settings.ApiKey) &&
        !string.IsNullOrWhiteSpace(_settings.ApiSecret);

    public async Task<MediaUploadResult> UploadAsync(IFormFile file, string? subFolder = null, CancellationToken ct = default)
    {
        if (!IsConfigured)
            throw new InvalidOperationException("Cloudinary is not configured. Set Cloudinary:CloudName, ApiKey, and ApiSecret in appsettings.");

        await using var stream = file.OpenReadStream();
        var folder = string.IsNullOrWhiteSpace(subFolder)
            ? _settings.Folder
            : $"{_settings.Folder}/{subFolder}";

        var isVideo = file.ContentType.StartsWith("video/", StringComparison.OrdinalIgnoreCase);
        if (isVideo)
        {
            var videoParams = new VideoUploadParams
            {
                File = new FileDescription(file.FileName, stream),
                Folder = folder,
                UseFilename = true,
                UniqueFilename = true,
                Overwrite = false
            };

            var result = await _cloudinary.UploadAsync(videoParams);
            if (result.Error is not null)
                throw new InvalidOperationException(result.Error.Message);

            return new MediaUploadResult(result.PublicId, result.SecureUrl.ToString(), "Video");
        }

        var imageParams = new ImageUploadParams
        {
            File = new FileDescription(file.FileName, stream),
            Folder = folder,
            UseFilename = true,
            UniqueFilename = true,
            Overwrite = false
        };

        var imageResult = await _cloudinary.UploadAsync(imageParams);
        if (imageResult.Error is not null)
            throw new InvalidOperationException(imageResult.Error.Message);

        return new MediaUploadResult(imageResult.PublicId, imageResult.SecureUrl.ToString(), "Image");
    }

    public async Task DeleteAsync(string publicId, CancellationToken ct = default)
    {
        if (!IsConfigured)
            throw new InvalidOperationException("Cloudinary is not configured.");

        await _cloudinary.DeleteResourcesAsync(new DelResParams { PublicIds = new List<string> { publicId } });
    }
}
