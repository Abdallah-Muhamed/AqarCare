using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace AqarCare.Migrations
{
    /// <inheritdoc />
    public partial class UpdatePackagesPDF : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "FinishingPackages",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "Description", "Name", "ShortDescription" },
                values: new object[] { "باقة تشطيب أساسية تناسب من يبحث عن جودة موثوقة وتنفيذ احترافي بميزانية مدروسة. تشمل أعمال التأسيس والتشطيبات الأساسية مع إشراف هندسي بنسبة 17.5%.", "الباقة الأساسية", "تشطيب موثوق بمواد معتمدة وأسعار مناسبة للمشاريع السكنية" });

            migrationBuilder.UpdateData(
                table: "FinishingPackages",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "Description", "Name", "Slug" },
                values: new object[] { "خامات محسّنة وتشطيب متين بمستوى برونزي. تشمل تحسينات في الكهرباء والسباكة، جبسوم بورد للوحدة بالكامل، سيراميك محسّن، ونوافذ UPVC.", "باقة برونز", "bronze" });

            migrationBuilder.UpdateData(
                table: "FinishingPackages",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "Description", "Name", "ShortDescription", "Slug" },
                values: new object[] { "خامات مستوردة وتشطيبات فاخرة بمستوى سيلفر. تشمل تكييفات بالكامل، مواسير ألمانية، سيراميك مستورد، وأبواب تركي جاهزة.", "باقة سيلفر", "خامات مستوردة وتشطيبات فاخرة بمستوى سيلفر", "silver" });

            migrationBuilder.UpdateData(
                table: "FinishingPackages",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "Description", "Name", "ShortDescription", "Slug", "SupervisionPercent" },
                values: new object[] { "تشطيب متكامل بخامات ألمانية وتوريدات متقدمة. تشمل أنتركم مرئي، ساوند سيستم، شاتر، رخام مستورد، وأبواب تركي 11 سم.", "باقة جولد", "تشطيب متكامل بخامات ألمانية وتوريدات متقدمة", "gold", 15m });

            migrationBuilder.UpdateData(
                table: "FinishingPackages",
                keyColumn: "Id",
                keyValue: 5,
                columns: new[] { "Description", "Name", "ShortDescription", "Slug", "SupervisionPercent" },
                values: new object[] { "باقة متكاملة بالتوريدات الكاملة تشمل مطبخ HPL، غرفة دريسنج روم، تكييفات شارب، سخانات، ستائر، إضاءة، وشفاطات.", "باقة بلاتينيوم", "باقة متكاملة بالتوريدات الكاملة (مطبخ، تكييفات، إضاءة)", "platinum", 15m });

            migrationBuilder.UpdateData(
                table: "FinishingPackages",
                keyColumn: "Id",
                keyValue: 6,
                columns: new[] { "Description", "Name", "ShortDescription", "Slug", "SupervisionPercent" },
                values: new object[] { "باقة شاملة بالفرش الكامل والتوريدات والأثاث. تشمل كل ما في الباقة البلاتينيوم بالإضافة إلى عفش الشقة بالكامل، سجاد، ومراتب.", "باقة دايموند", "باقة شاملة بالفرش الكامل والتوريدات والأثاث", "diamond", 15m });

            migrationBuilder.UpdateData(
                table: "PackagePaymentPhases",
                keyColumn: "Id",
                keyValue: 13,
                column: "Percentage",
                value: 25);

            migrationBuilder.UpdateData(
                table: "PackagePaymentPhases",
                keyColumn: "Id",
                keyValue: 14,
                column: "Percentage",
                value: 25);

            migrationBuilder.UpdateData(
                table: "PackagePaymentPhases",
                keyColumn: "Id",
                keyValue: 16,
                column: "Percentage",
                value: 20);

            migrationBuilder.UpdateData(
                table: "PackagePaymentPhases",
                keyColumn: "Id",
                keyValue: 17,
                columns: new[] { "FinishingPackageId", "Percentage", "PhaseDescription", "SortOrder" },
                values: new object[] { 4, 5, "عند الاستلام النهائي إن شاء الله", 5 });

            migrationBuilder.UpdateData(
                table: "PackagePaymentPhases",
                keyColumn: "Id",
                keyValue: 18,
                columns: new[] { "Percentage", "PhaseDescription", "SortOrder" },
                values: new object[] { 25, "من التكلفة عند التعاقد", 1 });

            migrationBuilder.UpdateData(
                table: "PackagePaymentPhases",
                keyColumn: "Id",
                keyValue: 19,
                columns: new[] { "PhaseDescription", "SortOrder" },
                values: new object[] { "عند الانتهاء من المرحلة الاولى", 2 });

            migrationBuilder.UpdateData(
                table: "PackagePaymentPhases",
                keyColumn: "Id",
                keyValue: 20,
                columns: new[] { "Percentage", "PhaseDescription", "SortOrder" },
                values: new object[] { 25, "عند الانتهاء من المرحلة التانية", 3 });

            migrationBuilder.UpdateData(
                table: "PackagePaymentPhases",
                keyColumn: "Id",
                keyValue: 21,
                columns: new[] { "FinishingPackageId", "Percentage", "PhaseDescription", "SortOrder" },
                values: new object[] { 5, 20, "عند الانتهاء من المرحلة الثالثه", 4 });

            migrationBuilder.UpdateData(
                table: "PackagePaymentPhases",
                keyColumn: "Id",
                keyValue: 22,
                columns: new[] { "FinishingPackageId", "Percentage", "PhaseDescription", "SortOrder" },
                values: new object[] { 5, 5, "عند الاستلام النهائي إن شاء الله", 5 });

            migrationBuilder.UpdateData(
                table: "PackagePaymentPhases",
                keyColumn: "Id",
                keyValue: 23,
                columns: new[] { "PhaseDescription", "SortOrder" },
                values: new object[] { "من التكلفة عند التعاقد", 1 });

            migrationBuilder.UpdateData(
                table: "PackagePaymentPhases",
                keyColumn: "Id",
                keyValue: 24,
                columns: new[] { "Percentage", "PhaseDescription", "SortOrder" },
                values: new object[] { 25, "عند الانتهاء من المرحلة الاولى", 2 });

            migrationBuilder.InsertData(
                table: "PackagePaymentPhases",
                columns: new[] { "Id", "FinishingPackageId", "Percentage", "PhaseDescription", "SortOrder" },
                values: new object[,]
                {
                    { 25, 6, 25, "عند الانتهاء من المرحلة التانية", 3 },
                    { 26, 6, 20, "عند الانتهاء من المرحلة الثالثه", 4 },
                    { 27, 6, 5, "عند الاستلام النهائي إن شاء الله", 5 }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "PackagePaymentPhases",
                keyColumn: "Id",
                keyValue: 25);

            migrationBuilder.DeleteData(
                table: "PackagePaymentPhases",
                keyColumn: "Id",
                keyValue: 26);

            migrationBuilder.DeleteData(
                table: "PackagePaymentPhases",
                keyColumn: "Id",
                keyValue: 27);

            migrationBuilder.UpdateData(
                table: "FinishingPackages",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "Description", "Name", "ShortDescription" },
                values: new object[] { "أعدت هذه الباقة لتمكنك من الحصول على أفكار تصميمية إبداعية ( لفيلتك / قصرك / شقتك / مشروعك ) تعد خصيصا على أحدث برامج التصميم ثلاثى الأبعاد وتسلم اليك كألبوم مصور تسطيع من خلاله رؤية حلمك الذى تتطلع الية فى مسكنك أو مشروعك كما سوف ينفذ على أرض الواقع.", "الاساسية", "باقة تشطيب أساسية بجودة موثوقة وأسعار مناسبة" });

            migrationBuilder.UpdateData(
                table: "FinishingPackages",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "Description", "Name", "Slug" },
                values: new object[] { "باقة تشطيب توفر مستوى أعلى من خامات التشطيب والتشطيبات مع نفس نظام الدفع والإشراف.", "برونز", "standard" });

            migrationBuilder.UpdateData(
                table: "FinishingPackages",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "Description", "Name", "ShortDescription", "Slug" },
                values: new object[] { "باقة تشطيب للعملاء الذين يبحثون عن مستوى فاخر في التشطيبات والديكور.", "سلفر", "خامات فضية متميزة وتشطيبات بمستوى راقٍ", "premium" });

            migrationBuilder.UpdateData(
                table: "FinishingPackages",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "Description", "Name", "ShortDescription", "Slug", "SupervisionPercent" },
                values: new object[] { "باقة تشطيب بمواد وتشطيبات عالية الجودة.", "جولد", "تشطيب ذهبي بأعلى معايير الجودة والأناقة", "luxury", 17.5m });

            migrationBuilder.UpdateData(
                table: "FinishingPackages",
                keyColumn: "Id",
                keyValue: 5,
                columns: new[] { "Description", "Name", "ShortDescription", "Slug", "SupervisionPercent" },
                values: new object[] { "باقة تشطيب شاملة التوريدات بأعلى مستويات الجودة.", "بلاتينيوم", "باقة شاملة التوريدات بمستوى بلاتيني استثنائي", "royal", 17.5m });

            migrationBuilder.UpdateData(
                table: "FinishingPackages",
                keyColumn: "Id",
                keyValue: 6,
                columns: new[] { "Description", "Name", "ShortDescription", "Slug", "SupervisionPercent" },
                values: new object[] { "باقة دايموند — الخيار الأمثل لمن يريد الأفضل في كل تفصيلة، بأعلى المواصفات وأرقى الخامات.", "دايموند", "أعلى مستويات التشطيب والتوريدات بلا أي تنازل في الجودة", "ultimate", 17.5m });

            migrationBuilder.UpdateData(
                table: "PackagePaymentPhases",
                keyColumn: "Id",
                keyValue: 13,
                column: "Percentage",
                value: 35);

            migrationBuilder.UpdateData(
                table: "PackagePaymentPhases",
                keyColumn: "Id",
                keyValue: 14,
                column: "Percentage",
                value: 30);

            migrationBuilder.UpdateData(
                table: "PackagePaymentPhases",
                keyColumn: "Id",
                keyValue: 16,
                column: "Percentage",
                value: 10);

            migrationBuilder.UpdateData(
                table: "PackagePaymentPhases",
                keyColumn: "Id",
                keyValue: 17,
                columns: new[] { "FinishingPackageId", "Percentage", "PhaseDescription", "SortOrder" },
                values: new object[] { 5, 35, "من التكلفة عند التعاقد", 1 });

            migrationBuilder.UpdateData(
                table: "PackagePaymentPhases",
                keyColumn: "Id",
                keyValue: 18,
                columns: new[] { "Percentage", "PhaseDescription", "SortOrder" },
                values: new object[] { 30, "عند الانتهاء من المرحلة الاولى", 2 });

            migrationBuilder.UpdateData(
                table: "PackagePaymentPhases",
                keyColumn: "Id",
                keyValue: 19,
                columns: new[] { "PhaseDescription", "SortOrder" },
                values: new object[] { "عند الانتهاء من المرحلة التانية", 3 });

            migrationBuilder.UpdateData(
                table: "PackagePaymentPhases",
                keyColumn: "Id",
                keyValue: 20,
                columns: new[] { "Percentage", "PhaseDescription", "SortOrder" },
                values: new object[] { 10, "عند الانتهاء من المرحلة الثالثه", 4 });

            migrationBuilder.UpdateData(
                table: "PackagePaymentPhases",
                keyColumn: "Id",
                keyValue: 21,
                columns: new[] { "FinishingPackageId", "Percentage", "PhaseDescription", "SortOrder" },
                values: new object[] { 6, 35, "من التكلفة عند التعاقد", 1 });

            migrationBuilder.UpdateData(
                table: "PackagePaymentPhases",
                keyColumn: "Id",
                keyValue: 22,
                columns: new[] { "FinishingPackageId", "Percentage", "PhaseDescription", "SortOrder" },
                values: new object[] { 6, 30, "عند الانتهاء من المرحلة الاولى", 2 });

            migrationBuilder.UpdateData(
                table: "PackagePaymentPhases",
                keyColumn: "Id",
                keyValue: 23,
                columns: new[] { "PhaseDescription", "SortOrder" },
                values: new object[] { "عند الانتهاء من المرحلة التانية", 3 });

            migrationBuilder.UpdateData(
                table: "PackagePaymentPhases",
                keyColumn: "Id",
                keyValue: 24,
                columns: new[] { "Percentage", "PhaseDescription", "SortOrder" },
                values: new object[] { 10, "عند الانتهاء من المرحلة الثالثه", 4 });
        }
    }
}
