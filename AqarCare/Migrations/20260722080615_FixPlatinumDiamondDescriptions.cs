using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AqarCare.Migrations
{
    /// <inheritdoc />
    public partial class FixPlatinumDiamondDescriptions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "FinishingPackages",
                keyColumn: "Id",
                keyValue: 5,
                column: "ShortDescription",
                value: "تشطيب كامل مع توريدات المطبخ والتكييفات والإضاءة");

            migrationBuilder.UpdateData(
                table: "FinishingPackages",
                keyColumn: "Id",
                keyValue: 6,
                column: "ShortDescription",
                value: "الحل الشامل مع الفرش الكامل والأثاث والتوريدات");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "FinishingPackages",
                keyColumn: "Id",
                keyValue: 5,
                column: "ShortDescription",
                value: "الحل الشامل مع توريدات كاملة ومطبخ فاخر");

            migrationBuilder.UpdateData(
                table: "FinishingPackages",
                keyColumn: "Id",
                keyValue: 6,
                column: "ShortDescription",
                value: "القمة المطلقة مع فرش كامل وتوريدات شاملة");
        }
    }
}
