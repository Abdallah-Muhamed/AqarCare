using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AqarCare.Migrations
{
    /// <inheritdoc />
    public partial class UpdatePackageDescriptions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "FinishingPackages",
                keyColumn: "Id",
                keyValue: 1,
                column: "ShortDescription",
                value: "الحل الأمثل للميزانية المدروسة مع ضمان الجودة");

            migrationBuilder.UpdateData(
                table: "FinishingPackages",
                keyColumn: "Id",
                keyValue: 2,
                column: "ShortDescription",
                value: "جودة محسّنة مع تشطيب متين ومتانة عالية");

            migrationBuilder.UpdateData(
                table: "FinishingPackages",
                keyColumn: "Id",
                keyValue: 3,
                column: "ShortDescription",
                value: "فخامة معتدلة بخامات مستوردة وتشطيبات راقية");

            migrationBuilder.UpdateData(
                table: "FinishingPackages",
                keyColumn: "Id",
                keyValue: 4,
                column: "ShortDescription",
                value: "تشطيب فاخر بخامات ألمانية وتقنيات متقدمة");

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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "FinishingPackages",
                keyColumn: "Id",
                keyValue: 1,
                column: "ShortDescription",
                value: "تشطيب موثوق بمواد معتمدة وأسعار مناسبة للمشاريع السكنية");

            migrationBuilder.UpdateData(
                table: "FinishingPackages",
                keyColumn: "Id",
                keyValue: 2,
                column: "ShortDescription",
                value: "خامات محسّنة وتشطيب متين بمستوى برونزي");

            migrationBuilder.UpdateData(
                table: "FinishingPackages",
                keyColumn: "Id",
                keyValue: 3,
                column: "ShortDescription",
                value: "خامات مستوردة وتشطيبات فاخرة بمستوى سيلفر");

            migrationBuilder.UpdateData(
                table: "FinishingPackages",
                keyColumn: "Id",
                keyValue: 4,
                column: "ShortDescription",
                value: "تشطيب متكامل بخامات ألمانية وتوريدات متقدمة");

            migrationBuilder.UpdateData(
                table: "FinishingPackages",
                keyColumn: "Id",
                keyValue: 5,
                column: "ShortDescription",
                value: "باقة متكاملة بالتوريدات الكاملة (مطبخ، تكييفات، إضاءة)");

            migrationBuilder.UpdateData(
                table: "FinishingPackages",
                keyColumn: "Id",
                keyValue: 6,
                column: "ShortDescription",
                value: "باقة شاملة بالفرش الكامل والتوريدات والأثاث");
        }
    }
}
