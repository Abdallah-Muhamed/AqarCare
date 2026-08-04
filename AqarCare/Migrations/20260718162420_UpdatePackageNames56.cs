using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AqarCare.Migrations
{
    /// <inheritdoc />
    public partial class UpdatePackageNames56 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "FinishingPackages",
                keyColumn: "Id",
                keyValue: 5,
                columns: new[] { "Name", "Slug" },
                values: new object[] { "الباقة الملكية", "royal" });

            migrationBuilder.UpdateData(
                table: "FinishingPackages",
                keyColumn: "Id",
                keyValue: 6,
                columns: new[] { "Description", "Name", "Slug" },
                values: new object[] { "الباقة القمة بأعلى المواصفات والتوريدات.", "الباقة القمة", "ultimate" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
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
    }
}
