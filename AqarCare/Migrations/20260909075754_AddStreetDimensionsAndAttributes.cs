using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AqarCare.Migrations
{
    /// <inheritdoc />
    public partial class AddStreetDimensionsAndAttributes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AttributesJson",
                table: "MapStreets",
                type: "nvarchar(max)",
                maxLength: 10000,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Importance",
                table: "MapStreets",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<decimal>(
                name: "LengthMeters",
                table: "MapStreets",
                type: "decimal(10,2)",
                precision: 10,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "StreetType",
                table: "MapStreets",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SurfaceType",
                table: "MapStreets",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TrafficDirection",
                table: "MapStreets",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "WidthMeters",
                table: "MapStreets",
                type: "decimal(8,2)",
                precision: 8,
                scale: 2,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "MapStreetAliases",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MapStreetId = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MapStreetAliases", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MapStreetAliases_MapStreets_MapStreetId",
                        column: x => x.MapStreetId,
                        principalTable: "MapStreets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_MapStreetAliases_MapStreetId_Name",
                table: "MapStreetAliases",
                columns: new[] { "MapStreetId", "Name" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MapStreetAliases_Name",
                table: "MapStreetAliases",
                column: "Name");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MapStreetAliases");

            migrationBuilder.DropColumn(
                name: "AttributesJson",
                table: "MapStreets");

            migrationBuilder.DropColumn(
                name: "Importance",
                table: "MapStreets");

            migrationBuilder.DropColumn(
                name: "LengthMeters",
                table: "MapStreets");

            migrationBuilder.DropColumn(
                name: "StreetType",
                table: "MapStreets");

            migrationBuilder.DropColumn(
                name: "SurfaceType",
                table: "MapStreets");

            migrationBuilder.DropColumn(
                name: "TrafficDirection",
                table: "MapStreets");

            migrationBuilder.DropColumn(
                name: "WidthMeters",
                table: "MapStreets");
        }
    }
}
