using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AqarCare.Migrations
{
    /// <inheritdoc />
    public partial class RenameTitanium : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "FinishingPackages",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "Name", "ShortDescription" },
                values: new object[] { "التيتانيوم", "مواصفات تيتانيوم بأعلى معايير الجودة والتشطيب" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "FinishingPackages",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "Name", "ShortDescription" },
                values: new object[] { "البريميوم", "مواصفات بريميوم بأعلى معايير الجودة والتشطيب" });
        }
    }
}
