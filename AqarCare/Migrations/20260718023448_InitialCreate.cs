using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace AqarCare.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "FinishingPackages",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Slug = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    PricePerSqm = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    ShortDescription = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SupervisionPercent = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FinishingPackages", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PropertyUnits",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Price = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    AreaSqm = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Bedrooms = table.Column<int>(type: "int", nullable: false),
                    Bathrooms = table.Column<int>(type: "int", nullable: false),
                    PropertyType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ListingType = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    City = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    District = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Address = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    IsFeatured = table.Column<bool>(type: "bit", nullable: false),
                    IsPublished = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PropertyUnits", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PackageMedia",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FinishingPackageId = table.Column<int>(type: "int", nullable: false),
                    MediaType = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    CloudinaryPublicId = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    Url = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PackageMedia", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PackageMedia_FinishingPackages_FinishingPackageId",
                        column: x => x.FinishingPackageId,
                        principalTable: "FinishingPackages",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PackageNotes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FinishingPackageId = table.Column<int>(type: "int", nullable: false),
                    Text = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PackageNotes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PackageNotes_FinishingPackages_FinishingPackageId",
                        column: x => x.FinishingPackageId,
                        principalTable: "FinishingPackages",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PackagePaymentPhases",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FinishingPackageId = table.Column<int>(type: "int", nullable: false),
                    Percentage = table.Column<int>(type: "int", nullable: false),
                    PhaseDescription = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PackagePaymentPhases", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PackagePaymentPhases_FinishingPackages_FinishingPackageId",
                        column: x => x.FinishingPackageId,
                        principalTable: "FinishingPackages",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PackageSections",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FinishingPackageId = table.Column<int>(type: "int", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PackageSections", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PackageSections_FinishingPackages_FinishingPackageId",
                        column: x => x.FinishingPackageId,
                        principalTable: "FinishingPackages",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PropertyMedia",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PropertyUnitId = table.Column<int>(type: "int", nullable: false),
                    MediaType = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    CloudinaryPublicId = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    Url = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PropertyMedia", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PropertyMedia_PropertyUnits_PropertyUnitId",
                        column: x => x.PropertyUnitId,
                        principalTable: "PropertyUnits",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PackageFeatureItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PackageSectionId = table.Column<int>(type: "int", nullable: false),
                    Text = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PackageFeatureItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PackageFeatureItems_PackageSections_PackageSectionId",
                        column: x => x.PackageSectionId,
                        principalTable: "PackageSections",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "FinishingPackages",
                columns: new[] { "Id", "CreatedAt", "Description", "IsActive", "Name", "PricePerSqm", "ShortDescription", "Slug", "SortOrder", "SupervisionPercent", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "أعدت هذه الباقة لتمكنك من الحصول على أفكار تصميمية إبداعية ( لفيلتك / قصرك / شقتك / مشروعك ) تعد خصيصا على أحدث برامج التصميم ثلاثى الأبعاد وتسلم اليك كألبوم مصور تسطيع من خلاله رؤية حلمك الذى تتطلع الية فى مسكنك أو مشروعك كما سوف ينفذ على أرض الواقع.", true, "الباقة الكلاسيك", 1800m, "باقة تشطيب كلاسيكية بأسعار مناسبة", "classic", 1, 17.5m, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 2, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "باقة سيلفر توفر مستوى أعلى من خامات التشطيب والتشطيبات مع نفس نظام الدفع والإشراف.", true, "باقة سيلفر", 2500m, "باقة سيلفر بمواد وتشطيبات محسّنة", "silver", 2, 17.5m, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 3, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "باقة جولد للعملاء الذين يبحثون عن مستوى فاخر في التشطيبات والديكور.", true, "الباقة الجولد", 3500m, "باقة جولد بمواد فاخرة", "gold", 3, 17.5m, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 4, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "باقة بلاتينيوم بمواد وتشطيبات عالية الجودة.", true, "الباقة بلاتينيوم", 4500m, "باقة بلاتينيوم بمواصفات متميزة", "platinum", 4, 17.5m, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 5, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "باقة VIP شاملة التوريدات بأعلى مستويات الجودة.", true, "الباقة السوبر VIP بالتوريدات", 7000m, "باقة VIP شاملة التوريدات", "vip", 5, 17.5m, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 6, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "الباقة الترا سوبر VIP بأعلى المواصفات والتوريدات.", true, "الباقة الترا سوبر VIP", 9000m, "أعلى باقة تشطيب متكاملة", "ultra-super-vip", 6, 17.5m, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) }
                });

            migrationBuilder.InsertData(
                table: "PackageNotes",
                columns: new[] { "Id", "FinishingPackageId", "SortOrder", "Text" },
                values: new object[,]
                {
                    { 1, 1, 1, "يتم حساب تكلفه التشطيب علي اساس المساحه الفعليه بعد المعاينه و ليس المساحه المسجله بالعقد" },
                    { 2, 1, 2, "يضاف 300 جنيه علي سعر المتر إذا كانت الشقه بدون الألوميتال" },
                    { 3, 1, 3, "يضاف 200 جنيه علي سعر المتر إذا كانت الشقه بدون محاره" },
                    { 4, 1, 4, "يضاف 100 جنيه علي سعر المترإذا رغب العميل بعمل (3D MAX )" }
                });

            migrationBuilder.InsertData(
                table: "PackagePaymentPhases",
                columns: new[] { "Id", "FinishingPackageId", "Percentage", "PhaseDescription", "SortOrder" },
                values: new object[,]
                {
                    { 1, 1, 35, "من التكلفة عند التعاقد", 1 },
                    { 2, 1, 30, "عند الانتهاء من المرحلة الاولى ( اعمال تأسيس الكهرباء – السباكة – اعمال تأسيس التكيفات)", 2 },
                    { 3, 1, 25, "عند الانتهاء من المرحلة التانية ( اعمال السيراميك – اعمال الجبسمبورد)", 3 },
                    { 4, 1, 10, "عند الانتهاء من المرحلة الثالثه ( اعمال الدهانات و تركيب الأبواب الداخليه + باب الشقه)", 4 },
                    { 5, 2, 35, "من التكلفة عند التعاقد", 1 },
                    { 6, 2, 30, "عند الانتهاء من المرحلة الاولى", 2 },
                    { 7, 2, 25, "عند الانتهاء من المرحلة التانية", 3 },
                    { 8, 2, 10, "عند الانتهاء من المرحلة الثالثه", 4 },
                    { 9, 3, 35, "من التكلفة عند التعاقد", 1 },
                    { 10, 3, 30, "عند الانتهاء من المرحلة الاولى", 2 },
                    { 11, 3, 25, "عند الانتهاء من المرحلة التانية", 3 },
                    { 12, 3, 10, "عند الانتهاء من المرحلة الثالثه", 4 },
                    { 13, 4, 35, "من التكلفة عند التعاقد", 1 },
                    { 14, 4, 30, "عند الانتهاء من المرحلة الاولى", 2 },
                    { 15, 4, 25, "عند الانتهاء من المرحلة التانية", 3 },
                    { 16, 4, 10, "عند الانتهاء من المرحلة الثالثه", 4 },
                    { 17, 5, 35, "من التكلفة عند التعاقد", 1 },
                    { 18, 5, 30, "عند الانتهاء من المرحلة الاولى", 2 },
                    { 19, 5, 25, "عند الانتهاء من المرحلة التانية", 3 },
                    { 20, 5, 10, "عند الانتهاء من المرحلة الثالثه", 4 },
                    { 21, 6, 35, "من التكلفة عند التعاقد", 1 },
                    { 22, 6, 30, "عند الانتهاء من المرحلة الاولى", 2 },
                    { 23, 6, 25, "عند الانتهاء من المرحلة التانية", 3 },
                    { 24, 6, 10, "عند الانتهاء من المرحلة الثالثه", 4 }
                });

            migrationBuilder.InsertData(
                table: "PackageSections",
                columns: new[] { "Id", "FinishingPackageId", "SortOrder", "Title" },
                values: new object[,]
                {
                    { 1, 1, 1, "الكهرباء" },
                    { 2, 1, 2, "بند السباكة" },
                    { 3, 1, 3, "بند الآسقف" },
                    { 4, 1, 4, "بند الآبواب" },
                    { 5, 1, 5, "بند السيراميك و الرخام" },
                    { 6, 1, 6, "بند النقاشة" }
                });

            migrationBuilder.InsertData(
                table: "PackageFeatureItems",
                columns: new[] { "Id", "PackageSectionId", "SortOrder", "Text" },
                values: new object[,]
                {
                    { 1, 1, 1, "لوحة 18 خط فينوس" },
                    { 2, 1, 2, "علب ماجيك وخراطيم مصطفى محمود" },
                    { 3, 1, 3, "تأسيس تكيفات للشقه بالكامل ( كهرباء فقط )" },
                    { 4, 1, 4, "سلك سويدى معتمد" },
                    { 5, 1, 5, "لقم و مفاتيح فينوس ضمان مدى الحياه" },
                    { 6, 1, 6, "عمل دائرة تليفون كاملة للشقة بالكامل" },
                    { 7, 1, 7, "عمل دائرة دش كاملة للشقة بالكامل" },
                    { 8, 1, 8, "تأسيس علبة للأنتركم" },
                    { 9, 1, 9, "عمل برايز للشفاط جنب شبابيك المطابخ والحمامات" },
                    { 10, 1, 10, "عمل مفتاح فصل للسخانات والغسالات والتكييفات" },
                    { 11, 1, 11, "توريد وتركيب اسبوتات وليد للجبسوم بورد" },
                    { 12, 2, 1, "توريد وتركيب خامات عزل الرطوبة للحمام مع عمل طبقة لياسة أسمنتيه لأرضية الحمام" },
                    { 13, 2, 2, "تأسيس سباكة الحمام + مطبخ" },
                    { 14, 2, 3, "المواسير المستخدمة فى التأسيس الشريف أو تكنو ثيرم مع اعطاء العميل شهادة ضمان" },
                    { 15, 2, 4, "تشطيب السباكة قاعدة و حوض بحد اقصى 4000 جنيه للحمام الواحد – تركيب خلاطات بحد اقصي 3000 للحمام الواحد" },
                    { 16, 2, 5, "تركيب بانيو للحمام أو تأسيس كابينه شاور لحمام واحد فقط بحد اقصي 4000 للحمام" },
                    { 17, 3, 1, "عمل ضهارة للشقة بالكامل" },
                    { 18, 3, 2, "عمل جبسوم بورد للريسيشن و الطرقه فقط" },
                    { 19, 3, 3, "عمل كرانيش للغرف والطرقة" },
                    { 20, 3, 4, "عمل كرانيش فيوتك للحمام والمطبخ" },
                    { 21, 4, 1, "توريد وتركيب باب مصفح" },
                    { 22, 4, 2, "تركيب أبواب للغرف والحمامات خشب موسكى بطبقة MDF" },
                    { 23, 4, 3, "دهان الأبواب أستر أو لاكية حسب اختيار العميل" },
                    { 24, 5, 1, "توريد وتركيب سيراميك للريسيبشن والطرقة (225) جنيه للمتر" },
                    { 25, 5, 2, "توريد وتركيب سيراميك باقى الشقة حوائط وأرضيات ( 150 ) جنيه للمتر" },
                    { 26, 5, 3, "توريد وتشوين الأسمنت والرمل ومادة السقية وكل ما يخص ذلك البند" },
                    { 27, 6, 1, "وش سيلر مائى" },
                    { 28, 6, 2, "عدد ( 3 ) سكينة معجون للشقة بالكامل" },
                    { 29, 6, 3, "عدد ( 1 ) وش بطانة" },
                    { 30, 6, 4, "عدد ( 2 ) وش تشطيب نهائى" },
                    { 31, 6, 5, "الدهانات المستخدمة ماركة جي إل سي" },
                    { 32, 6, 6, "عدد (1) جانب قطيفة أو ورق حائط لكل فراغ" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_FinishingPackages_IsActive",
                table: "FinishingPackages",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_FinishingPackages_Slug",
                table: "FinishingPackages",
                column: "Slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PackageFeatureItems_PackageSectionId",
                table: "PackageFeatureItems",
                column: "PackageSectionId");

            migrationBuilder.CreateIndex(
                name: "IX_PackageMedia_FinishingPackageId",
                table: "PackageMedia",
                column: "FinishingPackageId");

            migrationBuilder.CreateIndex(
                name: "IX_PackageNotes_FinishingPackageId",
                table: "PackageNotes",
                column: "FinishingPackageId");

            migrationBuilder.CreateIndex(
                name: "IX_PackagePaymentPhases_FinishingPackageId",
                table: "PackagePaymentPhases",
                column: "FinishingPackageId");

            migrationBuilder.CreateIndex(
                name: "IX_PackageSections_FinishingPackageId",
                table: "PackageSections",
                column: "FinishingPackageId");

            migrationBuilder.CreateIndex(
                name: "IX_PropertyMedia_PropertyUnitId",
                table: "PropertyMedia",
                column: "PropertyUnitId");

            migrationBuilder.CreateIndex(
                name: "IX_PropertyUnits_City",
                table: "PropertyUnits",
                column: "City");

            migrationBuilder.CreateIndex(
                name: "IX_PropertyUnits_IsPublished",
                table: "PropertyUnits",
                column: "IsPublished");

            migrationBuilder.CreateIndex(
                name: "IX_PropertyUnits_PropertyType",
                table: "PropertyUnits",
                column: "PropertyType");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PackageFeatureItems");

            migrationBuilder.DropTable(
                name: "PackageMedia");

            migrationBuilder.DropTable(
                name: "PackageNotes");

            migrationBuilder.DropTable(
                name: "PackagePaymentPhases");

            migrationBuilder.DropTable(
                name: "PropertyMedia");

            migrationBuilder.DropTable(
                name: "PackageSections");

            migrationBuilder.DropTable(
                name: "PropertyUnits");

            migrationBuilder.DropTable(
                name: "FinishingPackages");
        }
    }
}
