using System.Text.Json;
using AqarCare.Data;
using AqarCare.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace AqarCare.Services;

/// <summary>
/// One-time, repeatable import of road geometry for the user-defined
/// Mansheyat El Bakry scope. It imports roads only: no buildings or POIs.
/// The stored geometry is normalized to AqarCare's own 0..1 coordinate space.
/// </summary>
public class MansheyatElBakryOsmImportService
{
    private const string CitySlug = "mansheyat-el-bakry";
    private const string OverpassEndpoint = "https://overpass-api.de/api/interpreter";

    // North, west, south, east reference points supplied by the owner.
    private static readonly (decimal Latitude, decimal Longitude)[] Boundary =
    [
        (30.946748m, 31.147839m),
        (30.939711m, 31.144212m),
        (30.937698m, 31.151583m),
        (30.952062m, 31.153085m)
    ];

    private readonly AqarCareDbContext _db;
    private readonly HttpClient _httpClient;

    public MansheyatElBakryOsmImportService(AqarCareDbContext db, HttpClient httpClient)
    {
        _db = db;
        _httpClient = httpClient;
    }

    public async Task<OsmRoadImportResult> ImportAsync(CancellationToken ct = default)
    {
        var city = await _db.MapCities.FirstOrDefaultAsync(x => x.Slug == CitySlug, ct);
        if (city is null)
        {
            city = new MapCity { Name = "منشية البكري", Slug = CitySlug, IsActive = true };
            _db.MapCities.Add(city);
            await _db.SaveChangesAsync(ct);
        }

        var query = BuildOverpassQuery();
        using var content = new FormUrlEncodedContent([new KeyValuePair<string, string>("data", query)]);
        using var response = await _httpClient.PostAsync(OverpassEndpoint, content, ct);
        response.EnsureSuccessStatusCode();

        await using var stream = await response.Content.ReadAsStreamAsync(ct);
        using var document = await JsonDocument.ParseAsync(stream, cancellationToken: ct);

        var roads = ParseRoads(document.RootElement);
        var existing = await _db.MapStreets
            .Where(x => x.MapCityId == city.Id && x.AttributesJson != null && x.AttributesJson.Contains("OpenStreetMap"))
            .Include(x => x.Aliases)
            .ToDictionaryAsync(x => x.Name, StringComparer.Ordinal, ct);

        foreach (var road in roads)
        {
            var geometry = JsonSerializer.Serialize(new { type = "MultiLineString", coordinates = road.Segments });
            var attributes = JsonSerializer.Serialize(new { source = "OpenStreetMap", osmWayIds = road.OsmWayIds });
            if (!existing.TryGetValue(road.Name, out var street))
            {
                street = new MapStreet { MapCityId = city.Id, Name = road.Name };
                _db.MapStreets.Add(street);
            }

            street.WidthMeters = GetWidthMeters(road.Name);
            street.StreetType = road.HighwayType;
            street.TrafficDirection = road.IsOneWay ? "OneWay" : null;
            street.Importance = GetImportance(road.HighwayType);
            street.GeometryJson = geometry;
            street.AttributesJson = attributes;
            street.IsActive = true;
            street.UpdatedAt = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync(ct);
        return new OsmRoadImportResult(city.Id, city.Name, roads.Count, roads.Sum(x => x.OsmWayIds.Count));
    }

    private static string BuildOverpassQuery()
    {
        var polygon = string.Join(" ", Boundary.Select(x => $"{x.Latitude.ToString(System.Globalization.CultureInfo.InvariantCulture)} {x.Longitude.ToString(System.Globalization.CultureInfo.InvariantCulture)}"));
        return $"[out:json][timeout:90];way(poly:\"{polygon}\")[highway][highway!~\"footway|path|steps|cycleway|bridleway|track\"];out tags geom;";
    }

    private static List<ImportedRoad> ParseRoads(JsonElement root)
    {
        var grouped = new Dictionary<string, ImportedRoad>(StringComparer.Ordinal);
        foreach (var element in root.GetProperty("elements").EnumerateArray())
        {
            if (!element.TryGetProperty("geometry", out var geometry) || geometry.GetArrayLength() < 2) continue;
            var id = element.GetProperty("id").GetInt64();
            var tags = element.TryGetProperty("tags", out var tagElement) ? tagElement : default;
            var name = GetTag(tags, "name:ar") ?? GetTag(tags, "name") ?? $"طريق غير مسمى {id}";
            var highwayType = GetTag(tags, "highway") ?? "residential";
            var isOneWay = string.Equals(GetTag(tags, "oneway"), "yes", StringComparison.OrdinalIgnoreCase);
            var segment = geometry.EnumerateArray()
                .Select(point => Normalize(point.GetProperty("lat").GetDecimal(), point.GetProperty("lon").GetDecimal()))
                .ToList();

            if (!grouped.TryGetValue(name, out var road))
            {
                road = new ImportedRoad(name, highwayType, isOneWay);
                grouped.Add(name, road);
            }
            road.OsmWayIds.Add(id);
            road.Segments.Add(segment);
        }
        return grouped.Values.ToList();
    }

    private static List<decimal> Normalize(decimal latitude, decimal longitude)
    {
        var minLatitude = Boundary.Min(x => x.Latitude);
        var maxLatitude = Boundary.Max(x => x.Latitude);
        var minLongitude = Boundary.Min(x => x.Longitude);
        var maxLongitude = Boundary.Max(x => x.Longitude);
        var x = Math.Round(Math.Clamp((longitude - minLongitude) / (maxLongitude - minLongitude), 0m, 1m), 6);
        var y = Math.Round(Math.Clamp(1 - ((latitude - minLatitude) / (maxLatitude - minLatitude)), 0m, 1m), 6);
        return [x, y];
    }

    private static string? GetTag(JsonElement tags, string name) =>
        tags.ValueKind == JsonValueKind.Object && tags.TryGetProperty(name, out var value) ? value.GetString() : null;

    private static decimal GetWidthMeters(string name) =>
        name.Contains("جمال عبد الناصر", StringComparison.Ordinal) ? 25m :
        name.Contains("المأمون", StringComparison.Ordinal) ? 12.5m :
        name.Contains("فاطمة الزهراء", StringComparison.Ordinal) ? 12.5m :
        name.Contains("عمار بن ياسر", StringComparison.Ordinal) ? 55m :
        name.Contains("101", StringComparison.Ordinal) ? 101m :
        name.Contains("عشرة", StringComparison.Ordinal) ? 10m : 8m;

    private static int GetImportance(string type) => type switch
    {
        "primary" => 90,
        "secondary" => 80,
        "tertiary" => 70,
        "unclassified" => 50,
        "residential" => 40,
        _ => 25
    };

    private sealed class ImportedRoad
    {
        public ImportedRoad(string name, string highwayType, bool isOneWay)
        {
            Name = name;
            HighwayType = highwayType;
            IsOneWay = isOneWay;
        }

        public string Name { get; }
        public string HighwayType { get; }
        public bool IsOneWay { get; }
        public List<long> OsmWayIds { get; } = [];
        public List<List<List<decimal>>> Segments { get; } = [];
    }
}

public record OsmRoadImportResult(int MapCityId, string MapName, int StreetsImported, int RoadSegmentsImported);
