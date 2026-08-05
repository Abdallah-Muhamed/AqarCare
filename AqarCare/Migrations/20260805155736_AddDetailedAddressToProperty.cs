using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AqarCare.Migrations
{
    /// <inheritdoc />
    public partial class AddDetailedAddressToProperty : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "DetailedAddress",
                table: "PropertyUnits",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DetailedAddress",
                table: "PropertyUnits");
        }
    }
}
