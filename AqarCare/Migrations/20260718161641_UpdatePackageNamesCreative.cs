using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AqarCare.Migrations
{
    /// <inheritdoc />
    public partial class UpdatePackageNamesCreative : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "FinishingPackages",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "Name", "Slug" },
                values: new object[] { "الباقة الأساسية", "essential" });

            migrationBuilder.UpdateData(
                table: "FinishingPackages",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "Name", "Slug" },
                values: new object[] { "الباقة المتوسطة", "standard" });

            migrationBuilder.UpdateData(
                table: "FinishingPackages",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "Name", "Slug" },
                values: new object[] { "الباقة المميزة", "premium" });

            migrationBuilder.UpdateData(
                table: "FinishingPackages",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "Name", "Slug" },
                values: new object[] { "الباقة الفاخرة", "luxury" });

            migrationBuilder.UpdateData(
                table: "FinishingPackages",
                keyColumn: "Id",
                keyValue: 5,
                columns: new[] { "Name", "Slug" },
                values: new object[] { "الباقة الراقية", "elite" });

            migrationBuilder.UpdateData(
                table: "FinishingPackages",
                keyColumn: "Id",
                keyValue: 6,
                columns: new[] { "Description", "Name", "Slug" },
                values: new object[] { "الباقة الاستثنائية بأعلى المواصفات والتوريدات.", "الباقة الاستثنائية", "exceptional" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "FinishingPackages",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "Name", "Slug" },
                values: new object[] { "الباقة الأولى", "package-1" });

            migrationBuilder.UpdateData(
                table: "FinishingPackages",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "Name", "Slug" },
                values: new object[] { "الباقة الثانية", "package-2" });

            migrationBuilder.UpdateData(
                table: "FinishingPackages",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "Name", "Slug" },
                values: new object[] { "الباقة الثالثة", "package-3" });

            migrationBuilder.UpdateData(
                table: "FinishingPackages",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "Name", "Slug" },
                values: new object[] { "الباقة الرابعة", "package-4" });

            migrationBuilder.UpdateData(
                table: "FinishingPackages",
                keyColumn: "Id",
                keyValue: 5,
                columns: new[] { "Name", "Slug" },
                values: new object[] { "الباقة الخامسة", "package-5" });

            migrationBuilder.UpdateData(
                table: "FinishingPackages",
                keyColumn: "Id",
                keyValue: 6,
                columns: new[] { "Description", "Name", "Slug" },
                values: new object[] { "الباقة السادسة بأعلى المواصفات والتوريدات.", "الباقة السادسة", "package-6" });
        }
    }
}
