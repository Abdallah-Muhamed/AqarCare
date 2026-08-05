using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AqarCare.Migrations
{
    /// <inheritdoc />
    public partial class AddPropertyMeterAndFloorFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ElectricityMeterNumber",
                table: "PropertyUnits",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "FloorNumber",
                table: "PropertyUnits",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "GasMeterNumber",
                table: "PropertyUnits",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WaterMeterNumber",
                table: "PropertyUnits",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ElectricityMeterNumber",
                table: "PropertyUnits");

            migrationBuilder.DropColumn(
                name: "FloorNumber",
                table: "PropertyUnits");

            migrationBuilder.DropColumn(
                name: "GasMeterNumber",
                table: "PropertyUnits");

            migrationBuilder.DropColumn(
                name: "WaterMeterNumber",
                table: "PropertyUnits");
        }
    }
}
