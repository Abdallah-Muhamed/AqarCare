using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AqarCare.Migrations
{
    /// <inheritdoc />
    public partial class FixClassicPackageErrors : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 3,
                column: "Text",
                value: "تأسيس تكييفات للشقة بالكامل (كهرباء فقط)");

            migrationBuilder.UpdateData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 4,
                column: "Text",
                value: "سلك سويدي معتمد");

            migrationBuilder.UpdateData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 5,
                column: "Text",
                value: "لقم ومفاتيح فينوس ضمان مدى الحياة");

            migrationBuilder.UpdateData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 11,
                column: "Text",
                value: "توريد وتركيب اسبوتات ليد للجبسوم بورد");

            migrationBuilder.UpdateData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 12,
                column: "Text",
                value: "توريد وتركيب خامات عزل الرطوبة للحمام مع عمل طبقة لياسة أسمنتية لأرضية الحمام (رقبة زجاجة أسمنتية + عزل بارد + عزل انسومات)");

            migrationBuilder.UpdateData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 13,
                column: "Text",
                value: "تأسيس سباكة الحمام + المطبخ");

            migrationBuilder.UpdateData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 14,
                column: "Text",
                value: "المواسير المستخدمة في التأسيس الشريف أو تكنو ثيرم مع إعطاء العميل شهادة ضمان");

            migrationBuilder.UpdateData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 15,
                column: "Text",
                value: "تشطيب السباكة قاعدة وحوض بحد أقصى 4000 جنيه للحمام الواحد – تركيب خلاطات بحد أقصى 3000 جنيه للحمام الواحد");

            migrationBuilder.UpdateData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 16,
                column: "Text",
                value: "تركيب بانيو للحمام أو تأسيس كابينة شاور لحمام واحد فقط بحد أقصى 4000 جنيه للحمام");

            migrationBuilder.UpdateData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 18,
                column: "Text",
                value: "عمل جبسوم بورد للريسيبشن والطرقة فقط");

            migrationBuilder.UpdateData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 22,
                column: "Text",
                value: "تركيب أبواب للغرف والحمامات خشب موسكي بطبقة MDF");

            migrationBuilder.UpdateData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 25,
                column: "Text",
                value: "توريد وتركيب سيراميك باقي الشقة حوائط وأرضيات (150 جنيه للمتر)");

            migrationBuilder.UpdateData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 27,
                column: "Text",
                value: "وش سيلر مائي");

            migrationBuilder.UpdateData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 30,
                column: "Text",
                value: "عدد (2) وش تشطيب نهائي");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 3,
                column: "Text",
                value: "تأسيس تكيفات للشقه بالكامل ( كهرباء فقط )");

            migrationBuilder.UpdateData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 4,
                column: "Text",
                value: "سلك سويدى معتمد");

            migrationBuilder.UpdateData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 5,
                column: "Text",
                value: "لقم و مفاتيح فينوس ضمان مدى الحياه");

            migrationBuilder.UpdateData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 11,
                column: "Text",
                value: "توريد وتركيب اسبوتات وليد للجبسوم بورد");

            migrationBuilder.UpdateData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 12,
                column: "Text",
                value: "توريد وتركيب خامات عزل الرطوبة للحمام مع عمل طبقة لياسة أسمنتيه لأرضية الحمام");

            migrationBuilder.UpdateData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 13,
                column: "Text",
                value: "تأسيس سباكة الحمام + مطبخ");

            migrationBuilder.UpdateData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 14,
                column: "Text",
                value: "المواسير المستخدمة فى التأسيس الشريف أو تكنو ثيرم مع اعطاء العميل شهادة ضمان");

            migrationBuilder.UpdateData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 15,
                column: "Text",
                value: "تشطيب السباكة قاعدة و حوض بحد اقصى 4000 جنيه للحمام الواحد – تركيب خلاطات بحد اقصي 3000 للحمام الواحد");

            migrationBuilder.UpdateData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 16,
                column: "Text",
                value: "تركيب بانيو للحمام أو تأسيس كابينه شاور لحمام واحد فقط بحد اقصي 4000 للحمام");

            migrationBuilder.UpdateData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 18,
                column: "Text",
                value: "عمل جبسوم بورد للريسيشن و الطرقه فقط");

            migrationBuilder.UpdateData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 22,
                column: "Text",
                value: "تركيب أبواب للغرف والحمامات خشب موسكى بطبقة MDF");

            migrationBuilder.UpdateData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 25,
                column: "Text",
                value: "توريد وتركيب سيراميك باقى الشقة حوائط وأرضيات ( 150 ) جنيه للمتر");

            migrationBuilder.UpdateData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 27,
                column: "Text",
                value: "وش سيلر مائى");

            migrationBuilder.UpdateData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 30,
                column: "Text",
                value: "عدد ( 2 ) وش تشطيب نهائى");
        }
    }
}
