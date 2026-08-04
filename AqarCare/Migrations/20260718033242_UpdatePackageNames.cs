using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AqarCare.Migrations
{
    /// <inheritdoc />
    public partial class UpdatePackageNames : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "FinishingPackages",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "Name", "ShortDescription", "Slug" },
                values: new object[] { "الباقة الأولى", "باقة تشطيب اقتصادية بأسعار مناسبة", "package-1" });

            migrationBuilder.UpdateData(
                table: "FinishingPackages",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "Description", "Name", "ShortDescription", "Slug" },
                values: new object[] { "باقة تشطيب توفر مستوى أعلى من خامات التشطيب والتشطيبات مع نفس نظام الدفع والإشراف.", "الباقة الثانية", "باقة تشطيب بمواد وتشطيبات محسّنة", "package-2" });

            migrationBuilder.UpdateData(
                table: "FinishingPackages",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "Description", "Name", "ShortDescription", "Slug" },
                values: new object[] { "باقة تشطيب للعملاء الذين يبحثون عن مستوى فاخر في التشطيبات والديكور.", "الباقة الثالثة", "باقة تشطيب بمواد فاخرة", "package-3" });

            migrationBuilder.UpdateData(
                table: "FinishingPackages",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "Description", "Name", "ShortDescription", "Slug" },
                values: new object[] { "باقة تشطيب بمواد وتشطيبات عالية الجودة.", "الباقة الرابعة", "باقة تشطيب بمواصفات متميزة", "package-4" });

            migrationBuilder.UpdateData(
                table: "FinishingPackages",
                keyColumn: "Id",
                keyValue: 5,
                columns: new[] { "Description", "Name", "ShortDescription", "Slug" },
                values: new object[] { "باقة تشطيب شاملة التوريدات بأعلى مستويات الجودة.", "الباقة الخامسة", "باقة تشطيب شاملة التوريدات", "package-5" });

            migrationBuilder.UpdateData(
                table: "FinishingPackages",
                keyColumn: "Id",
                keyValue: 6,
                columns: new[] { "Description", "Name", "Slug" },
                values: new object[] { "الباقة السادسة بأعلى المواصفات والتوريدات.", "الباقة السادسة", "package-6" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "FinishingPackages",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "Name", "ShortDescription", "Slug" },
                values: new object[] { "الباقة الكلاسيك", "باقة تشطيب كلاسيكية بأسعار مناسبة", "classic" });

            migrationBuilder.UpdateData(
                table: "FinishingPackages",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "Description", "Name", "ShortDescription", "Slug" },
                values: new object[] { "باقة سيلفر توفر مستوى أعلى من خامات التشطيب والتشطيبات مع نفس نظام الدفع والإشراف.", "باقة سيلفر", "باقة سيلفر بمواد وتشطيبات محسّنة", "silver" });

            migrationBuilder.UpdateData(
                table: "FinishingPackages",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "Description", "Name", "ShortDescription", "Slug" },
                values: new object[] { "باقة جولد للعملاء الذين يبحثون عن مستوى فاخر في التشطيبات والديكور.", "الباقة الجولد", "باقة جولد بمواد فاخرة", "gold" });

            migrationBuilder.UpdateData(
                table: "FinishingPackages",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "Description", "Name", "ShortDescription", "Slug" },
                values: new object[] { "باقة بلاتينيوم بمواد وتشطيبات عالية الجودة.", "الباقة بلاتينيوم", "باقة بلاتينيوم بمواصفات متميزة", "platinum" });

            migrationBuilder.UpdateData(
                table: "FinishingPackages",
                keyColumn: "Id",
                keyValue: 5,
                columns: new[] { "Description", "Name", "ShortDescription", "Slug" },
                values: new object[] { "باقة VIP شاملة التوريدات بأعلى مستويات الجودة.", "الباقة السوبر VIP بالتوريدات", "باقة VIP شاملة التوريدات", "vip" });

            migrationBuilder.UpdateData(
                table: "FinishingPackages",
                keyColumn: "Id",
                keyValue: 6,
                columns: new[] { "Description", "Name", "Slug" },
                values: new object[] { "الباقة الترا سوبر VIP بأعلى المواصفات والتوريدات.", "الباقة الترا سوبر VIP", "ultra-super-vip" });
        }
    }
}
