using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AqarCare.Migrations
{
    /// <inheritdoc />
    public partial class AddCustomMapArchitecture : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "MapCities",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Slug = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MapCities", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "MapStreets",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MapCityId = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    GeometryJson = table.Column<string>(type: "nvarchar(max)", maxLength: 20000, nullable: true),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MapStreets", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MapStreets_MapCities_MapCityId",
                        column: x => x.MapCityId,
                        principalTable: "MapCities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PropertyMapLocations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PropertyUnitId = table.Column<int>(type: "int", nullable: false),
                    MapStreetId = table.Column<int>(type: "int", nullable: false),
                    X = table.Column<decimal>(type: "decimal(9,8)", precision: 9, scale: 8, nullable: false),
                    Y = table.Column<decimal>(type: "decimal(9,8)", precision: 9, scale: 8, nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PropertyMapLocations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PropertyMapLocations_MapStreets_MapStreetId",
                        column: x => x.MapStreetId,
                        principalTable: "MapStreets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PropertyMapLocations_PropertyUnits_PropertyUnitId",
                        column: x => x.PropertyUnitId,
                        principalTable: "PropertyUnits",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_MapCities_IsActive",
                table: "MapCities",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_MapCities_Slug",
                table: "MapCities",
                column: "Slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MapStreets_MapCityId_Name",
                table: "MapStreets",
                columns: new[] { "MapCityId", "Name" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PropertyMapLocations_MapStreetId",
                table: "PropertyMapLocations",
                column: "MapStreetId");

            migrationBuilder.CreateIndex(
                name: "IX_PropertyMapLocations_PropertyUnitId",
                table: "PropertyMapLocations",
                column: "PropertyUnitId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PropertyMapLocations");

            migrationBuilder.DropTable(
                name: "MapStreets");

            migrationBuilder.DropTable(
                name: "MapCities");
        }
    }
}
