using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AqarCare.Migrations
{
    /// <inheritdoc />
    public partial class FixGoldDescription : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "FinishingPackages",
                keyColumn: "Id",
                keyValue: 4,
                column: "Description",
                value: "تشطيب متكامل بخامات ألمانية وتقنيات متقدمة. تشمل أنتركم مرئي، ساوند سيستم، شاتر، رخام مستورد، وأبواب تركي 11 سم.");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "FinishingPackages",
                keyColumn: "Id",
                keyValue: 4,
                column: "Description",
                value: "تشطيب متكامل بخامات ألمانية وتوريدات متقدمة. تشمل أنتركم مرئي، ساوند سيستم، شاتر، رخام مستورد، وأبواب تركي 11 سم.");
        }
    }
}
