using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AqarCare.Migrations
{
    /// <inheritdoc />
    public partial class FinalPackageNames : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "FinishingPackages",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "Name", "ShortDescription" },
                values: new object[] { "الاساسية", "باقة تشطيب أساسية بجودة موثوقة وأسعار مناسبة" });

            migrationBuilder.UpdateData(
                table: "FinishingPackages",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "Name", "ShortDescription" },
                values: new object[] { "برونز", "خامات محسّنة وتشطيب متين بمستوى برونزي" });

            migrationBuilder.UpdateData(
                table: "FinishingPackages",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "Name", "ShortDescription" },
                values: new object[] { "سلفر", "خامات فضية متميزة وتشطيبات بمستوى راقٍ" });

            migrationBuilder.UpdateData(
                table: "FinishingPackages",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "Name", "ShortDescription" },
                values: new object[] { "جولد", "تشطيب ذهبي بأعلى معايير الجودة والأناقة" });

            migrationBuilder.UpdateData(
                table: "FinishingPackages",
                keyColumn: "Id",
                keyValue: 5,
                column: "Name",
                value: "بلاتينيوم");

            migrationBuilder.UpdateData(
                table: "FinishingPackages",
                keyColumn: "Id",
                keyValue: 6,
                columns: new[] { "Description", "Name" },
                values: new object[] { "باقة دايموند — الخيار الأمثل لمن يريد الأفضل في كل تفصيلة، بأعلى المواصفات وأرقى الخامات.", "دايموند" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "FinishingPackages",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "Name", "ShortDescription" },
                values: new object[] { "الاقتصادية", "باقة تشطيب اقتصادية بجودة موثوقة وأسعار مناسبة" });

            migrationBuilder.UpdateData(
                table: "FinishingPackages",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "Name", "ShortDescription" },
                values: new object[] { "الكلاسيك", "تشطيب كلاسيكي بخامات محسّنة ومستوى راقٍ" });

            migrationBuilder.UpdateData(
                table: "FinishingPackages",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "Name", "ShortDescription" },
                values: new object[] { "الجولد", "خامات متميزة وتشطيبات بجودة عالية" });

            migrationBuilder.UpdateData(
                table: "FinishingPackages",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "Name", "ShortDescription" },
                values: new object[] { "التيتانيوم", "مواصفات تيتانيوم بأعلى معايير الجودة والتشطيب" });

            migrationBuilder.UpdateData(
                table: "FinishingPackages",
                keyColumn: "Id",
                keyValue: 5,
                column: "Name",
                value: "البلاتينيوم");

            migrationBuilder.UpdateData(
                table: "FinishingPackages",
                keyColumn: "Id",
                keyValue: 6,
                columns: new[] { "Description", "Name" },
                values: new object[] { "باقة الدايموند — الخيار الأمثل لمن يريد الأفضل في كل تفصيلة، بأعلى المواصفات وأرقى الخامات.", "الدايموند" });
        }
    }
}
