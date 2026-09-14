using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AqarCare.Migrations
{
    /// <inheritdoc />
    public partial class AddSoldPriceToPropertyFloor : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
IF NOT EXISTS (
    SELECT 1 FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'[dbo].[PropertyUnits]') 
    AND name = 'ApartmentsPerFloor'
)
BEGIN
    ALTER TABLE [PropertyUnits] ADD [ApartmentsPerFloor] int NULL;
END
");

            migrationBuilder.Sql(@"
IF NOT EXISTS (
    SELECT 1 FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'[dbo].[PropertyFloors]') 
    AND name = 'SoldPrice'
)
BEGIN
    ALTER TABLE [PropertyFloors] ADD [SoldPrice] decimal(18,2) NULL;
END
");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ApartmentsPerFloor",
                table: "PropertyUnits");

            migrationBuilder.DropColumn(
                name: "SoldPrice",
                table: "PropertyFloors");
        }
    }
}
