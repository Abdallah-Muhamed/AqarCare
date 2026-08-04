using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AqarCare.Migrations
{
    /// <inheritdoc />
    public partial class RenamePackages : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
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
                values: new object[] { "البريميوم", "مواصفات بريميوم بأعلى معايير الجودة والتشطيب" });

            migrationBuilder.UpdateData(
                table: "FinishingPackages",
                keyColumn: "Id",
                keyValue: 5,
                columns: new[] { "Name", "ShortDescription" },
                values: new object[] { "البلاتينيوم", "باقة شاملة التوريدات بمستوى بلاتيني استثنائي" });

            migrationBuilder.UpdateData(
                table: "FinishingPackages",
                keyColumn: "Id",
                keyValue: 6,
                columns: new[] { "Description", "Name", "ShortDescription" },
                values: new object[] { "باقة الدايموند — الخيار الأمثل لمن يريد الأفضل في كل تفصيلة، بأعلى المواصفات وأرقى الخامات.", "الدايموند", "أعلى مستويات التشطيب والتوريدات بلا أي تنازل في الجودة" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "FinishingPackages",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "Name", "ShortDescription" },
                values: new object[] { "الباقة الأساسية", "باقة تشطيب اقتصادية بأسعار مناسبة" });

            migrationBuilder.UpdateData(
                table: "FinishingPackages",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "Name", "ShortDescription" },
                values: new object[] { "الباقة المتوسطة", "باقة تشطيب بمواد وتشطيبات محسّنة" });

            migrationBuilder.UpdateData(
                table: "FinishingPackages",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "Name", "ShortDescription" },
                values: new object[] { "الباقة المميزة", "باقة تشطيب بمواد فاخرة" });

            migrationBuilder.UpdateData(
                table: "FinishingPackages",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "Name", "ShortDescription" },
                values: new object[] { "الباقة الفاخرة", "باقة تشطيب بمواصفات متميزة" });

            migrationBuilder.UpdateData(
                table: "FinishingPackages",
                keyColumn: "Id",
                keyValue: 5,
                columns: new[] { "Name", "ShortDescription" },
                values: new object[] { "الباقة الملكية", "باقة تشطيب شاملة التوريدات" });

            migrationBuilder.UpdateData(
                table: "FinishingPackages",
                keyColumn: "Id",
                keyValue: 6,
                columns: new[] { "Description", "Name", "ShortDescription" },
                values: new object[] { "الباقة القمة بأعلى المواصفات والتوريدات.", "الباقة القمة", "أعلى باقة تشطيب متكاملة" });
        }
    }
}
