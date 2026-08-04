using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AqarCare.Migrations
{
    /// <inheritdoc />
    public partial class AddPropertyUnitFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "FinishingPackageId",
                table: "PropertyUnits",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FinishingStatus",
                table: "PropertyUnits",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "InstallmentAvailable",
                table: "PropertyUnits",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateIndex(
                name: "IX_PropertyUnits_FinishingPackageId",
                table: "PropertyUnits",
                column: "FinishingPackageId");

            migrationBuilder.AddForeignKey(
                name: "FK_PropertyUnits_FinishingPackages_FinishingPackageId",
                table: "PropertyUnits",
                column: "FinishingPackageId",
                principalTable: "FinishingPackages",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PropertyUnits_FinishingPackages_FinishingPackageId",
                table: "PropertyUnits");

            migrationBuilder.DropIndex(
                name: "IX_PropertyUnits_FinishingPackageId",
                table: "PropertyUnits");

            migrationBuilder.DropColumn(
                name: "FinishingPackageId",
                table: "PropertyUnits");

            migrationBuilder.DropColumn(
                name: "FinishingStatus",
                table: "PropertyUnits");

            migrationBuilder.DropColumn(
                name: "InstallmentAvailable",
                table: "PropertyUnits");
        }
    }
}
