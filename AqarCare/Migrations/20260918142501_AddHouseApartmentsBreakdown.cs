using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AqarCare.Migrations
{
    /// <inheritdoc />
    public partial class AddHouseApartmentsBreakdown : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CoreShellApartments",
                table: "PropertyUnits",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "FinishedApartments",
                table: "PropertyUnits",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SemiFinishedApartments",
                table: "PropertyUnits",
                type: "int",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CoreShellApartments",
                table: "PropertyUnits");

            migrationBuilder.DropColumn(
                name: "FinishedApartments",
                table: "PropertyUnits");

            migrationBuilder.DropColumn(
                name: "SemiFinishedApartments",
                table: "PropertyUnits");
        }
    }
}
