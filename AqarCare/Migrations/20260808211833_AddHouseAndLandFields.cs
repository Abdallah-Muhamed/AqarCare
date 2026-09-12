using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AqarCare.Migrations
{
    /// <inheritdoc />
    public partial class AddHouseAndLandFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "FloorsFinishing",
                table: "PropertyUnits",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "FrontageLength",
                table: "PropertyUnits",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "FrontageWidth",
                table: "PropertyUnits",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "HasElectricity",
                table: "PropertyUnits",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "HasGas",
                table: "PropertyUnits",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "HasSewerage",
                table: "PropertyUnits",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "HasWater",
                table: "PropertyUnits",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "NumberOfFloors",
                table: "PropertyUnits",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "StreetWidth",
                table: "PropertyUnits",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FloorsFinishing",
                table: "PropertyUnits");

            migrationBuilder.DropColumn(
                name: "FrontageLength",
                table: "PropertyUnits");

            migrationBuilder.DropColumn(
                name: "FrontageWidth",
                table: "PropertyUnits");

            migrationBuilder.DropColumn(
                name: "HasElectricity",
                table: "PropertyUnits");

            migrationBuilder.DropColumn(
                name: "HasGas",
                table: "PropertyUnits");

            migrationBuilder.DropColumn(
                name: "HasSewerage",
                table: "PropertyUnits");

            migrationBuilder.DropColumn(
                name: "HasWater",
                table: "PropertyUnits");

            migrationBuilder.DropColumn(
                name: "NumberOfFloors",
                table: "PropertyUnits");

            migrationBuilder.DropColumn(
                name: "StreetWidth",
                table: "PropertyUnits");
        }
    }
}
