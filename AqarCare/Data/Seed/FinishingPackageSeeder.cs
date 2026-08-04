using AqarCare.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace AqarCare.Data.Seed;

public static class FinishingPackageSeeder
{
    public static void Seed(ModelBuilder modelBuilder)
    {
        var now = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc);

        modelBuilder.Entity<FinishingPackage>().HasData(
            new FinishingPackage
            {
                Id = 1,
                Name = "الباقة الأساسية",
                Slug = "essential",
                PricePerSqm = 1800,
                ShortDescription = "الحل الأمثل للميزانية المدروسة مع ضمان الجودة",
                Description = "باقة تشطيب أساسية تناسب من يبحث عن جودة موثوقة وتنفيذ احترافي بميزانية مدروسة. تشمل أعمال التأسيس والتشطيبات الأساسية مع إشراف هندسي بنسبة 17.5%.",
                SupervisionPercent = 17.5m,
                SortOrder = 1,
                IsActive = true,
                CreatedAt = now,
                UpdatedAt = now
            },
            new FinishingPackage
            {
                Id = 2,
                Name = "باقة برونز",
                Slug = "bronze",
                PricePerSqm = 2500,
                ShortDescription = "جودة محسّنة مع تشطيب متين ومتانة عالية",
                Description = "خامات محسّنة وتشطيب متين بمستوى برونزي. تشمل تحسينات في الكهرباء والسباكة، جبسوم بورد للوحدة بالكامل، سيراميك محسّن، ونوافذ UPVC.",
                SupervisionPercent = 17.5m,
                SortOrder = 2,
                IsActive = true,
                CreatedAt = now,
                UpdatedAt = now
            },
            new FinishingPackage
            {
                Id = 3,
                Name = "باقة سيلفر",
                Slug = "silver",
                PricePerSqm = 3500,
                ShortDescription = "فخامة معتدلة بخامات مستوردة وتشطيبات راقية",
                Description = "خامات مستوردة وتشطيبات فاخرة بمستوى سيلفر. تشمل تكييفات بالكامل، مواسير ألمانية، سيراميك مستورد، وأبواب تركي جاهزة.",
                SupervisionPercent = 17.5m,
                SortOrder = 3,
                IsActive = true,
                CreatedAt = now,
                UpdatedAt = now
            },
            new FinishingPackage
            {
                Id = 4,
                Name = "باقة جولد",
                Slug = "gold",
                PricePerSqm = 4500,
                ShortDescription = "تشطيب فاخر بخامات ألمانية وتقنيات متقدمة",
                Description = "تشطيب متكامل بخامات ألمانية وتقنيات متقدمة. تشمل أنتركم مرئي، ساوند سيستم، شاتر، رخام مستورد، وأبواب تركي 11 سم.",
                SupervisionPercent = 15m,
                SortOrder = 4,
                IsActive = true,
                CreatedAt = now,
                UpdatedAt = now
            },
            new FinishingPackage
            {
                Id = 5,
                Name = "باقة بلاتينيوم",
                Slug = "platinum",
                PricePerSqm = 7000,
                ShortDescription = "تشطيب كامل مع توريدات المطبخ والتكييفات والإضاءة",
                Description = "باقة متكاملة بالتوريدات الكاملة تشمل مطبخ HPL، غرفة دريسنج روم، تكييفات شارب، سخانات، ستائر، إضاءة، وشفاطات.",
                SupervisionPercent = 15m,
                SortOrder = 5,
                IsActive = true,
                CreatedAt = now,
                UpdatedAt = now
            },
            new FinishingPackage
            {
                Id = 6,
                Name = "باقة دايموند",
                Slug = "diamond",
                PricePerSqm = 9000,
                ShortDescription = "الحل الشامل مع الفرش الكامل والأثاث والتوريدات",
                Description = "باقة شاملة بالفرش الكامل والتوريدات والأثاث. تشمل كل ما في الباقة البلاتينيوم بالإضافة إلى عفش الشقة بالكامل، سجاد، ومراتب.",
                SupervisionPercent = 15m,
                SortOrder = 6,
                IsActive = true,
                CreatedAt = now,
                UpdatedAt = now
            });

        SeedClassicPaymentPhases(modelBuilder);
        SeedClassicSections(modelBuilder);
        SeedClassicNotes(modelBuilder);
        SeedSharedPaymentPhases(modelBuilder);
        SeedBronzeSections(modelBuilder);
        SeedSilverSections(modelBuilder);
        SeedGoldSections(modelBuilder);
        SeedPlatinumSections(modelBuilder);
        SeedDiamondSections(modelBuilder);
    }

    private static void SeedClassicPaymentPhases(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<PackagePaymentPhase>().HasData(
            new PackagePaymentPhase { Id = 1, FinishingPackageId = 1, Percentage = 35, PhaseDescription = "من التكلفة عند التعاقد", SortOrder = 1 },
            new PackagePaymentPhase { Id = 2, FinishingPackageId = 1, Percentage = 30, PhaseDescription = "عند الانتهاء من المرحلة الاولى ( اعمال تأسيس الكهرباء – السباكة – اعمال تأسيس التكيفات)", SortOrder = 2 },
            new PackagePaymentPhase { Id = 3, FinishingPackageId = 1, Percentage = 25, PhaseDescription = "عند الانتهاء من المرحلة التانية ( اعمال السيراميك – اعمال الجبسمبورد)", SortOrder = 3 },
            new PackagePaymentPhase { Id = 4, FinishingPackageId = 1, Percentage = 10, PhaseDescription = "عند الانتهاء من المرحلة الثالثه ( اعمال الدهانات و تركيب الأبواب الداخليه + باب الشقه)", SortOrder = 4 });
    }

    private static void SeedSharedPaymentPhases(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<PackagePaymentPhase>().HasData(
            new PackagePaymentPhase { Id = 5, FinishingPackageId = 2, Percentage = 35, PhaseDescription = "من التكلفة عند التعاقد", SortOrder = 1 },
            new PackagePaymentPhase { Id = 6, FinishingPackageId = 2, Percentage = 30, PhaseDescription = "عند الانتهاء من المرحلة الاولى", SortOrder = 2 },
            new PackagePaymentPhase { Id = 7, FinishingPackageId = 2, Percentage = 25, PhaseDescription = "عند الانتهاء من المرحلة التانية", SortOrder = 3 },
            new PackagePaymentPhase { Id = 8, FinishingPackageId = 2, Percentage = 10, PhaseDescription = "عند الانتهاء من المرحلة الثالثه", SortOrder = 4 },
            new PackagePaymentPhase { Id = 9, FinishingPackageId = 3, Percentage = 35, PhaseDescription = "من التكلفة عند التعاقد", SortOrder = 1 },
            new PackagePaymentPhase { Id = 10, FinishingPackageId = 3, Percentage = 30, PhaseDescription = "عند الانتهاء من المرحلة الاولى", SortOrder = 2 },
            new PackagePaymentPhase { Id = 11, FinishingPackageId = 3, Percentage = 25, PhaseDescription = "عند الانتهاء من المرحلة التانية", SortOrder = 3 },
            new PackagePaymentPhase { Id = 12, FinishingPackageId = 3, Percentage = 10, PhaseDescription = "عند الانتهاء من المرحلة الثالثه", SortOrder = 4 },
            new PackagePaymentPhase { Id = 13, FinishingPackageId = 4, Percentage = 25, PhaseDescription = "من التكلفة عند التعاقد", SortOrder = 1 },
            new PackagePaymentPhase { Id = 14, FinishingPackageId = 4, Percentage = 25, PhaseDescription = "عند الانتهاء من المرحلة الاولى", SortOrder = 2 },
            new PackagePaymentPhase { Id = 15, FinishingPackageId = 4, Percentage = 25, PhaseDescription = "عند الانتهاء من المرحلة التانية", SortOrder = 3 },
            new PackagePaymentPhase { Id = 16, FinishingPackageId = 4, Percentage = 20, PhaseDescription = "عند الانتهاء من المرحلة الثالثه", SortOrder = 4 },
            new PackagePaymentPhase { Id = 17, FinishingPackageId = 4, Percentage = 5, PhaseDescription = "عند الاستلام النهائي إن شاء الله", SortOrder = 5 },
            new PackagePaymentPhase { Id = 18, FinishingPackageId = 5, Percentage = 25, PhaseDescription = "من التكلفة عند التعاقد", SortOrder = 1 },
            new PackagePaymentPhase { Id = 19, FinishingPackageId = 5, Percentage = 25, PhaseDescription = "عند الانتهاء من المرحلة الاولى", SortOrder = 2 },
            new PackagePaymentPhase { Id = 20, FinishingPackageId = 5, Percentage = 25, PhaseDescription = "عند الانتهاء من المرحلة التانية", SortOrder = 3 },
            new PackagePaymentPhase { Id = 21, FinishingPackageId = 5, Percentage = 20, PhaseDescription = "عند الانتهاء من المرحلة الثالثه", SortOrder = 4 },
            new PackagePaymentPhase { Id = 22, FinishingPackageId = 5, Percentage = 5, PhaseDescription = "عند الاستلام النهائي إن شاء الله", SortOrder = 5 },
            new PackagePaymentPhase { Id = 23, FinishingPackageId = 6, Percentage = 25, PhaseDescription = "من التكلفة عند التعاقد", SortOrder = 1 },
            new PackagePaymentPhase { Id = 24, FinishingPackageId = 6, Percentage = 25, PhaseDescription = "عند الانتهاء من المرحلة الاولى", SortOrder = 2 },
            new PackagePaymentPhase { Id = 25, FinishingPackageId = 6, Percentage = 25, PhaseDescription = "عند الانتهاء من المرحلة التانية", SortOrder = 3 },
            new PackagePaymentPhase { Id = 26, FinishingPackageId = 6, Percentage = 20, PhaseDescription = "عند الانتهاء من المرحلة الثالثه", SortOrder = 4 },
            new PackagePaymentPhase { Id = 27, FinishingPackageId = 6, Percentage = 5, PhaseDescription = "عند الاستلام النهائي إن شاء الله", SortOrder = 5 });
    }

    private static void SeedClassicSections(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<PackageSection>().HasData(
            new PackageSection { Id = 1, FinishingPackageId = 1, Title = "الكهرباء", SortOrder = 1 },
            new PackageSection { Id = 2, FinishingPackageId = 1, Title = "بند السباكة", SortOrder = 2 },
            new PackageSection { Id = 3, FinishingPackageId = 1, Title = "بند الآسقف", SortOrder = 3 },
            new PackageSection { Id = 4, FinishingPackageId = 1, Title = "بند الآبواب", SortOrder = 4 },
            new PackageSection { Id = 5, FinishingPackageId = 1, Title = "بند السيراميك و الرخام", SortOrder = 5 },
            new PackageSection { Id = 6, FinishingPackageId = 1, Title = "بند النقاشة", SortOrder = 6 });

        modelBuilder.Entity<PackageFeatureItem>().HasData(
            new PackageFeatureItem { Id = 1, PackageSectionId = 1, Text = "لوحة 18 خط فينوس", SortOrder = 1 },
            new PackageFeatureItem { Id = 2, PackageSectionId = 1, Text = "علب ماجيك وخراطيم مصطفى محمود", SortOrder = 2 },
            new PackageFeatureItem { Id = 3, PackageSectionId = 1, Text = "تأسيس تكييفات للشقة بالكامل (كهرباء فقط)", SortOrder = 3 },
            new PackageFeatureItem { Id = 4, PackageSectionId = 1, Text = "سلك سويدي معتمد", SortOrder = 4 },
            new PackageFeatureItem { Id = 5, PackageSectionId = 1, Text = "لقم ومفاتيح فينوس ضمان مدى الحياة", SortOrder = 5 },
            new PackageFeatureItem { Id = 6, PackageSectionId = 1, Text = "عمل دائرة تليفون كاملة للشقة بالكامل", SortOrder = 6 },
            new PackageFeatureItem { Id = 7, PackageSectionId = 1, Text = "عمل دائرة دش كاملة للشقة بالكامل", SortOrder = 7 },
            new PackageFeatureItem { Id = 8, PackageSectionId = 1, Text = "تأسيس علبة للأنتركم", SortOrder = 8 },
            new PackageFeatureItem { Id = 9, PackageSectionId = 1, Text = "عمل برايز للشفاط جنب شبابيك المطابخ والحمامات", SortOrder = 9 },
            new PackageFeatureItem { Id = 10, PackageSectionId = 1, Text = "عمل مفتاح فصل للسخانات والغسالات والتكييفات", SortOrder = 10 },
            new PackageFeatureItem { Id = 11, PackageSectionId = 1, Text = "توريد وتركيب اسبوتات ليد للجبسوم بورد", SortOrder = 11 },
            new PackageFeatureItem { Id = 12, PackageSectionId = 2, Text = "توريد وتركيب خامات عزل الرطوبة للحمام مع عمل طبقة لياسة أسمنتية لأرضية الحمام (رقبة زجاجة أسمنتية + عزل بارد + عزل انسومات)", SortOrder = 1 },
            new PackageFeatureItem { Id = 13, PackageSectionId = 2, Text = "تأسيس سباكة الحمام + المطبخ", SortOrder = 2 },
            new PackageFeatureItem { Id = 14, PackageSectionId = 2, Text = "المواسير المستخدمة في التأسيس الشريف أو تكنو ثيرم مع إعطاء العميل شهادة ضمان", SortOrder = 3 },
            new PackageFeatureItem { Id = 15, PackageSectionId = 2, Text = "تشطيب السباكة قاعدة وحوض بحد أقصى 4000 جنيه للحمام الواحد – تركيب خلاطات بحد أقصى 3000 جنيه للحمام الواحد", SortOrder = 4 },
            new PackageFeatureItem { Id = 16, PackageSectionId = 2, Text = "تركيب بانيو للحمام أو تأسيس كابينة شاور لحمام واحد فقط بحد أقصى 4000 جنيه للحمام", SortOrder = 5 },
            new PackageFeatureItem { Id = 17, PackageSectionId = 3, Text = "عمل ضهارة للشقة بالكامل", SortOrder = 1 },
            new PackageFeatureItem { Id = 18, PackageSectionId = 3, Text = "عمل جبسوم بورد للريسيبشن والطرقة فقط", SortOrder = 2 },
            new PackageFeatureItem { Id = 19, PackageSectionId = 3, Text = "عمل كرانيش للغرف والطرقة", SortOrder = 3 },
            new PackageFeatureItem { Id = 20, PackageSectionId = 3, Text = "عمل كرانيش فيوتك للحمام والمطبخ", SortOrder = 4 },
            new PackageFeatureItem { Id = 21, PackageSectionId = 4, Text = "توريد وتركيب باب مصفح", SortOrder = 1 },
            new PackageFeatureItem { Id = 22, PackageSectionId = 4, Text = "تركيب أبواب للغرف والحمامات خشب موسكي بطبقة MDF", SortOrder = 2 },
            new PackageFeatureItem { Id = 23, PackageSectionId = 4, Text = "دهان الأبواب أستر أو لاكية حسب اختيار العميل", SortOrder = 3 },
            new PackageFeatureItem { Id = 24, PackageSectionId = 5, Text = "توريد وتركيب سيراميك للريسيبشن والطرقة (225) جنيه للمتر", SortOrder = 1 },
            new PackageFeatureItem { Id = 25, PackageSectionId = 5, Text = "توريد وتركيب سيراميك باقي الشقة حوائط وأرضيات (150 جنيه للمتر)", SortOrder = 2 },
            new PackageFeatureItem { Id = 26, PackageSectionId = 5, Text = "توريد وتشوين الأسمنت والرمل ومادة السقية وكل ما يخص ذلك البند", SortOrder = 3 },
            new PackageFeatureItem { Id = 27, PackageSectionId = 6, Text = "وش سيلر مائي", SortOrder = 1 },
            new PackageFeatureItem { Id = 28, PackageSectionId = 6, Text = "عدد ( 3 ) سكينة معجون للشقة بالكامل", SortOrder = 2 },
            new PackageFeatureItem { Id = 29, PackageSectionId = 6, Text = "عدد ( 1 ) وش بطانة", SortOrder = 3 },
            new PackageFeatureItem { Id = 30, PackageSectionId = 6, Text = "عدد (2) وش تشطيب نهائي", SortOrder = 4 },
            new PackageFeatureItem { Id = 31, PackageSectionId = 6, Text = "الدهانات المستخدمة ماركة جي إل سي", SortOrder = 5 },
            new PackageFeatureItem { Id = 32, PackageSectionId = 6, Text = "عدد (1) جانب قطيفة أو ورق حائط لكل فراغ", SortOrder = 6 });
    }

    private static void SeedBronzeSections(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<PackageSection>().HasData(
            new PackageSection { Id = 7, FinishingPackageId = 2, Title = "الكهرباء", SortOrder = 1 },
            new PackageSection { Id = 8, FinishingPackageId = 2, Title = "السباكة", SortOrder = 2 },
            new PackageSection { Id = 9, FinishingPackageId = 2, Title = "الأسقف والجبسوم بورد", SortOrder = 3 },
            new PackageSection { Id = 10, FinishingPackageId = 2, Title = "السيراميك والرخام", SortOrder = 4 },
            new PackageSection { Id = 11, FinishingPackageId = 2, Title = "النقاشة", SortOrder = 5 },
            new PackageSection { Id = 12, FinishingPackageId = 2, Title = "النوافذ", SortOrder = 6 });

        modelBuilder.Entity<PackageFeatureItem>().HasData(
            new PackageFeatureItem { Id = 33, PackageSectionId = 7, Text = "لوحة 18 خط فينوس", SortOrder = 1 },
            new PackageFeatureItem { Id = 34, PackageSectionId = 7, Text = "علب ماجيك وخراطيم مصطفى محمود", SortOrder = 2 },
            new PackageFeatureItem { Id = 35, PackageSectionId = 7, Text = "تأسيس تكييفات للشقة بالكامل (كهرباء فقط)", SortOrder = 3 },
            new PackageFeatureItem { Id = 36, PackageSectionId = 7, Text = "سلك سويدي أو مسك سعودي معتمد أو ما يماثله", SortOrder = 4 },
            new PackageFeatureItem { Id = 37, PackageSectionId = 7, Text = "لقم ومفاتيح خيند ضمان مدى الحياة", SortOrder = 5 },
            new PackageFeatureItem { Id = 38, PackageSectionId = 7, Text = "عمل دائرة تليفون للشقة بالكامل", SortOrder = 6 },
            new PackageFeatureItem { Id = 39, PackageSectionId = 7, Text = "عمل دائرة دش للشقة بالكامل", SortOrder = 7 },
            new PackageFeatureItem { Id = 40, PackageSectionId = 7, Text = "عمل دائرة نت للريسيبشن وغرفة النوم فقط", SortOrder = 8 },
            new PackageFeatureItem { Id = 41, PackageSectionId = 7, Text = "تأسيس علبة للأنتركم", SortOrder = 9 },
            new PackageFeatureItem { Id = 42, PackageSectionId = 7, Text = "تأسيس روتر في الطرقة", SortOrder = 10 },
            new PackageFeatureItem { Id = 43, PackageSectionId = 7, Text = "ديفتير في الطرقة وغرفة النوم الرئيسية", SortOrder = 11 },
            new PackageFeatureItem { Id = 44, PackageSectionId = 7, Text = "عمل برايز للشفاط جنب شبابيك المطابخ والحمامات", SortOrder = 12 },
            new PackageFeatureItem { Id = 45, PackageSectionId = 7, Text = "عمل مفتاح تكييفات للسخانات والغسالات والتكييفات", SortOrder = 13 },
            new PackageFeatureItem { Id = 46, PackageSectionId = 7, Text = "توريد وتركيب اسبوتات ليد للجبسوم بورد", SortOrder = 14 },
            new PackageFeatureItem { Id = 47, PackageSectionId = 7, Text = "عمل كشافات طوارئ للريسيبشن والطرقة فقط", SortOrder = 15 },
            new PackageFeatureItem { Id = 48, PackageSectionId = 8, Text = "توريد وتركيب خامات عزل الرطوبة للحمام مع عمل طبقة لياسة أسمنتية لأرضية الحمام (رقبة زجاجة أسمنتية + عزل بارد + عزل انسومات)", SortOrder = 1 },
            new PackageFeatureItem { Id = 49, PackageSectionId = 8, Text = "تأسيس سباكة الحمامات + المطبخ", SortOrder = 2 },
            new PackageFeatureItem { Id = 50, PackageSectionId = 8, Text = "المواسير المستخدمة في التأسيس الشريف أو تكنو ثيرم مع إعطاء العميل شهادة ضمان", SortOrder = 3 },
            new PackageFeatureItem { Id = 51, PackageSectionId = 8, Text = "تشطيب السباكة قاعدة وحوض بحد أقصى 6000 جنيه للحمام الواحد – تركيب خلاطات بحد أقصى 5000 جنيه للحمام الواحد", SortOrder = 4 },
            new PackageFeatureItem { Id = 52, PackageSectionId = 8, Text = "عمل صرف داخلي للتكييفات", SortOrder = 5 },
            new PackageFeatureItem { Id = 53, PackageSectionId = 8, Text = "تركيب بانيو للحمام شاسيه أو كابينة شاور زجاج سيكوريت لحمام واحد فقط بحد أقصى 6000 جنيه", SortOrder = 6 },
            new PackageFeatureItem { Id = 54, PackageSectionId = 9, Text = "عمل ضهارة للشقة بالكامل", SortOrder = 1 },
            new PackageFeatureItem { Id = 55, PackageSectionId = 9, Text = "عمل جبسوم بورد للوحدة بإجمالي مساحة الوحدة", SortOrder = 2 },
            new PackageFeatureItem { Id = 56, PackageSectionId = 9, Text = "جبسوم بورد أحمر للمطابخ، وجبسوم بورد أخضر للحمامات", SortOrder = 3 },
            new PackageFeatureItem { Id = 57, PackageSectionId = 10, Text = "توريد وتركيب سيراميك للريسيبشن والطرقة (350 جنيه للمتر)", SortOrder = 1 },
            new PackageFeatureItem { Id = 58, PackageSectionId = 10, Text = "توريد وتركيب سيراميك باقي الشقة حوائط وأرضيات (200 جنيه للمتر)", SortOrder = 2 },
            new PackageFeatureItem { Id = 59, PackageSectionId = 10, Text = "توريد وتشوين الأسمنت والرمل ومادة السقية وكل ما يخص ذلك البند", SortOrder = 3 },
            new PackageFeatureItem { Id = 60, PackageSectionId = 10, Text = "توريد وتركيب معابر الرخام بين الغرف + عتبة خارجية أمام باب الشقة", SortOrder = 4 },
            new PackageFeatureItem { Id = 61, PackageSectionId = 11, Text = "وش سيلر مائي", SortOrder = 1 },
            new PackageFeatureItem { Id = 62, PackageSectionId = 11, Text = "عدد (3) سكينة معجون للشقة بالكامل", SortOrder = 2 },
            new PackageFeatureItem { Id = 63, PackageSectionId = 11, Text = "عدد (1) وش بطانة", SortOrder = 3 },
            new PackageFeatureItem { Id = 64, PackageSectionId = 11, Text = "عدد (2) وش تشطيب نهائي", SortOrder = 4 },
            new PackageFeatureItem { Id = 65, PackageSectionId = 11, Text = "الدهانات المستخدمة ماركة جي إل سي قابل للغسيل", SortOrder = 5 },
            new PackageFeatureItem { Id = 66, PackageSectionId = 11, Text = "عدد (2) جانب قطيفة أو ورق حائط أو حجر لا يتعدى 10 متر", SortOrder = 6 },
            new PackageFeatureItem { Id = 67, PackageSectionId = 12, Text = "توريد وتركيب شبابيك المطبخ والحمامات (UPVC) مع عمل مكان للشفاط", SortOrder = 1 });
    }

    private static void SeedClassicNotes(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<PackageNote>().HasData(
            new PackageNote { Id = 1, FinishingPackageId = 1, Text = "يتم حساب تكلفه التشطيب علي اساس المساحه الفعليه بعد المعاينه و ليس المساحه المسجله بالعقد", SortOrder = 1 },
            new PackageNote { Id = 2, FinishingPackageId = 1, Text = "يضاف 300 جنيه علي سعر المتر إذا كانت الشقه بدون الألوميتال", SortOrder = 2 },
            new PackageNote { Id = 3, FinishingPackageId = 1, Text = "يضاف 200 جنيه علي سعر المتر إذا كانت الشقه بدون محاره", SortOrder = 3 },
            new PackageNote { Id = 4, FinishingPackageId = 1, Text = "يضاف 100 جنيه علي سعر المترإذا رغب العميل بعمل (3D MAX )", SortOrder = 4 });
    }

    private static void SeedSilverSections(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<PackageSection>().HasData(
            new PackageSection { Id = 13, FinishingPackageId = 3, Title = "الكهرباء", SortOrder = 1 },
            new PackageSection { Id = 14, FinishingPackageId = 3, Title = "السباكة", SortOrder = 2 },
            new PackageSection { Id = 15, FinishingPackageId = 3, Title = "الأسقف والجبسوم بورد", SortOrder = 3 },
            new PackageSection { Id = 16, FinishingPackageId = 3, Title = "الأبواب", SortOrder = 4 },
            new PackageSection { Id = 17, FinishingPackageId = 3, Title = "السيراميك والرخام", SortOrder = 5 },
            new PackageSection { Id = 18, FinishingPackageId = 3, Title = "النقاشة والديكور", SortOrder = 6 },
            new PackageSection { Id = 19, FinishingPackageId = 3, Title = "النوافذ", SortOrder = 7 });

        modelBuilder.Entity<PackageFeatureItem>().HasData(
            new PackageFeatureItem { Id = 68, PackageSectionId = 13, Text = "لوحة 24 خط فينوس", SortOrder = 1 },
            new PackageFeatureItem { Id = 69, PackageSectionId = 13, Text = "علب ماجيك وخراطيم مصطفى محمود", SortOrder = 2 },
            new PackageFeatureItem { Id = 70, PackageSectionId = 13, Text = "تكييفات للشقة بالكامل كهرباء وتأسيس فريون", SortOrder = 3 },
            new PackageFeatureItem { Id = 71, PackageSectionId = 13, Text = "سلك سويدي أو مسك سعودي معتمد أو ما يماثله", SortOrder = 4 },
            new PackageFeatureItem { Id = 72, PackageSectionId = 13, Text = "لقم ومفاتيح فينوس أو شانسي ضمان مدى الحياة", SortOrder = 5 },
            new PackageFeatureItem { Id = 73, PackageSectionId = 13, Text = "عمل دائرة تليفون للشقة بالكامل", SortOrder = 6 },
            new PackageFeatureItem { Id = 74, PackageSectionId = 13, Text = "عمل دائرة دش للشقة بالكامل", SortOrder = 7 },
            new PackageFeatureItem { Id = 75, PackageSectionId = 13, Text = "عمل دائرة نت للشقة بالكامل", SortOrder = 8 },
            new PackageFeatureItem { Id = 76, PackageSectionId = 13, Text = "عمل كابل HD من مكتبية التلفزيون إلى أقرب مكان جلوس بالريسيبشن وغرفة المعيشة", SortOrder = 9 },
            new PackageFeatureItem { Id = 77, PackageSectionId = 13, Text = "تأسيس علبة للأنتركم", SortOrder = 10 },
            new PackageFeatureItem { Id = 78, PackageSectionId = 13, Text = "تأسيس روتر في الطرقة", SortOrder = 11 },
            new PackageFeatureItem { Id = 79, PackageSectionId = 13, Text = "ديفتير في الطرقة وغرفة النوم الرئيسية والريسيبشن", SortOrder = 12 },
            new PackageFeatureItem { Id = 80, PackageSectionId = 13, Text = "عمل برايز للشفاط جنب شبابيك المطابخ والحمامات", SortOrder = 13 },
            new PackageFeatureItem { Id = 81, PackageSectionId = 13, Text = "عمل مفتاح تكييفات للسخانات والغسالات والتكييفات", SortOrder = 14 },
            new PackageFeatureItem { Id = 82, PackageSectionId = 13, Text = "توريد وتركيب اسبوتات ليد للجبسوم بورد", SortOrder = 15 },
            new PackageFeatureItem { Id = 83, PackageSectionId = 13, Text = "عمل كشافات طوارئ للشقة بالكامل", SortOrder = 16 },
            new PackageFeatureItem { Id = 84, PackageSectionId = 13, Text = "تأسيس ساوند سيستم", SortOrder = 17 },
            new PackageFeatureItem { Id = 85, PackageSectionId = 14, Text = "توريد وتركيب خامات عزل الرطوبة للحمام مع عمل طبقة لياسة أسمنتية (رقبة زجاجة أسمنتية + عزل بارد + عزل انسومات + سيكا 107)", SortOrder = 1 },
            new PackageFeatureItem { Id = 86, PackageSectionId = 14, Text = "تأسيس سباكة الحمامات + المطبخ", SortOrder = 2 },
            new PackageFeatureItem { Id = 87, PackageSectionId = 14, Text = "المواسير المستخدمة في التأسيس بي إر وسمارت هوم ألماني أو تكنو ثيرم مع شهادة ضمان", SortOrder = 3 },
            new PackageFeatureItem { Id = 88, PackageSectionId = 14, Text = "تشطيب السباكة خزان دفن وقاعدة معلقة وحوض بحد أقصى 8000 جنيه للحمام الواحد، تركيب خلاطات بحد أقصى 7000 جنيه، + تركيب شلال للشاور", SortOrder = 4 },
            new PackageFeatureItem { Id = 89, PackageSectionId = 14, Text = "عمل صرف داخلي للتكييفات", SortOrder = 5 },
            new PackageFeatureItem { Id = 90, PackageSectionId = 14, Text = "تركيب بانيو شاسيه للحمام أو توريد وتركيب كابينة زجاج سيكوريت لحمام واحد فقط بحد أقصى 8000 جنيه", SortOrder = 6 },
            new PackageFeatureItem { Id = 91, PackageSectionId = 15, Text = "عمل ضهارة للشقة بالكامل", SortOrder = 1 },
            new PackageFeatureItem { Id = 92, PackageSectionId = 15, Text = "عمل جبسوم بورد للوحدة بالكامل + مكتبة جبسوم بورد", SortOrder = 2 },
            new PackageFeatureItem { Id = 93, PackageSectionId = 15, Text = "جبسوم بورد أحمر للمطابخ، وجبسوم بورد أخضر للحمامات", SortOrder = 3 },
            new PackageFeatureItem { Id = 94, PackageSectionId = 16, Text = "توريد وتركيب باب مصفح تركي تصفيح كامل للشقة", SortOrder = 1 },
            new PackageFeatureItem { Id = 95, PackageSectionId = 16, Text = "تركيب أبواب للغرف والحمامات خشب موسكي بطبقة MDF", SortOrder = 2 },
            new PackageFeatureItem { Id = 96, PackageSectionId = 16, Text = "دهان الأبواب أستر أو لاكية حسب اختيار العميل", SortOrder = 3 },
            new PackageFeatureItem { Id = 97, PackageSectionId = 16, Text = "تركيب الكوالين للأبواب (يتم شراء الأوكر من قبل العميل)", SortOrder = 4 },
            new PackageFeatureItem { Id = 98, PackageSectionId = 17, Text = "توريد وتركيب سيراميك أو بورسلين للريسيبشن والطرقة (625 جنيه للمتر)", SortOrder = 1 },
            new PackageFeatureItem { Id = 99, PackageSectionId = 17, Text = "توريد وتركيب سيراميك باقي الشقة حوائط وأرضيات (300 جنيه للمتر)", SortOrder = 2 },
            new PackageFeatureItem { Id = 100, PackageSectionId = 17, Text = "توريد وتشوين الأسمنت والرمل ومادة السقية وكل ما يخص ذلك البند", SortOrder = 3 },
            new PackageFeatureItem { Id = 101, PackageSectionId = 17, Text = "توريد وتركيب معابر الرخام بين الغرف + عتبة خارجية أمام باب الشقة", SortOrder = 4 },
            new PackageFeatureItem { Id = 102, PackageSectionId = 18, Text = "وش سيلر مائي", SortOrder = 1 },
            new PackageFeatureItem { Id = 103, PackageSectionId = 18, Text = "عدد (3) سكينة معجون للشقة بالكامل", SortOrder = 2 },
            new PackageFeatureItem { Id = 104, PackageSectionId = 18, Text = "عدد (1) وش بطانة", SortOrder = 3 },
            new PackageFeatureItem { Id = 105, PackageSectionId = 18, Text = "عدد (2) وش تشطيب نهائي", SortOrder = 4 },
            new PackageFeatureItem { Id = 106, PackageSectionId = 18, Text = "الدهانات المستخدمة جوتين قابلة للغسيل", SortOrder = 5 },
            new PackageFeatureItem { Id = 107, PackageSectionId = 18, Text = "عدد (2) جانب قطيفة أو ورق حائط من ضمنهم غرفة 3D", SortOrder = 6 },
            new PackageFeatureItem { Id = 108, PackageSectionId = 18, Text = "حجر لا يتعدى 10 متر أو بلاطات 3D", SortOrder = 7 },
            new PackageFeatureItem { Id = 109, PackageSectionId = 18, Text = "تجليد خشب أمام باب الشقة + تجليد خشب لديكور جانب واحد أو بديل الرخام أو بروفايل ليد بحد أقصى 15 متر", SortOrder = 8 },
            new PackageFeatureItem { Id = 110, PackageSectionId = 18, Text = "توريد وتركيب CNC في الطرقة والريسيبشن لا يتعدى 15 متر", SortOrder = 9 },
            new PackageFeatureItem { Id = 111, PackageSectionId = 19, Text = "توريد وتركيب شبابيك المطبخ والحمامات (UPVC) مع عمل مكان للشفاط", SortOrder = 1 });
    }

    private static void SeedGoldSections(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<PackageSection>().HasData(
            new PackageSection { Id = 20, FinishingPackageId = 4, Title = "الكهرباء", SortOrder = 1 },
            new PackageSection { Id = 21, FinishingPackageId = 4, Title = "السباكة", SortOrder = 2 },
            new PackageSection { Id = 22, FinishingPackageId = 4, Title = "الأسقف والجبسوم بورد", SortOrder = 3 },
            new PackageSection { Id = 23, FinishingPackageId = 4, Title = "الأبواب", SortOrder = 4 },
            new PackageSection { Id = 24, FinishingPackageId = 4, Title = "النوافذ", SortOrder = 5 },
            new PackageSection { Id = 25, FinishingPackageId = 4, Title = "السيراميك والرخام", SortOrder = 6 },
            new PackageSection { Id = 26, FinishingPackageId = 4, Title = "النقاشة والديكور", SortOrder = 7 });

        modelBuilder.Entity<PackageFeatureItem>().HasData(
            new PackageFeatureItem { Id = 112, PackageSectionId = 20, Text = "لوحة 24 خط فينوس", SortOrder = 1 },
            new PackageFeatureItem { Id = 113, PackageSectionId = 20, Text = "علب ماجيك وخراطيم مصطفى محمود", SortOrder = 2 },
            new PackageFeatureItem { Id = 114, PackageSectionId = 20, Text = "تكييفات للشقة بالكامل كهرباء وتأسيس فريون", SortOrder = 3 },
            new PackageFeatureItem { Id = 115, PackageSectionId = 20, Text = "سلك سويدي معتمد أو مسك سعودي أو ما يماثله", SortOrder = 4 },
            new PackageFeatureItem { Id = 116, PackageSectionId = 20, Text = "لقم ومفاتيح فينوس أو شانسي ضمان مدى الحياة", SortOrder = 5 },
            new PackageFeatureItem { Id = 117, PackageSectionId = 20, Text = "عمل دائرة تليفون للشقة بالكامل", SortOrder = 6 },
            new PackageFeatureItem { Id = 118, PackageSectionId = 20, Text = "عمل دائرة دش للشقة بالكامل", SortOrder = 7 },
            new PackageFeatureItem { Id = 119, PackageSectionId = 20, Text = "عمل دائرة نت للشقة بالكامل", SortOrder = 8 },
            new PackageFeatureItem { Id = 120, PackageSectionId = 20, Text = "عمل كابل HD من مكتبية التلفزيون إلى أقرب مكان جلوس بالريسيبشن وغرفة المعيشة", SortOrder = 9 },
            new PackageFeatureItem { Id = 121, PackageSectionId = 20, Text = "تأسيس وتوريد وتركيب أنتركم مرئي", SortOrder = 10 },
            new PackageFeatureItem { Id = 122, PackageSectionId = 20, Text = "تأسيس روتر في الطرقة", SortOrder = 11 },
            new PackageFeatureItem { Id = 123, PackageSectionId = 20, Text = "ديفتير في الطرقة وغرفة النوم الرئيسية", SortOrder = 12 },
            new PackageFeatureItem { Id = 124, PackageSectionId = 20, Text = "عمل برايز للشفاط جنب شبابيك المطابخ والحمامات", SortOrder = 13 },
            new PackageFeatureItem { Id = 125, PackageSectionId = 20, Text = "عمل مفتاح تكييفات للسخانات والغسالات والتكييفات", SortOrder = 14 },
            new PackageFeatureItem { Id = 126, PackageSectionId = 20, Text = "توريد وتركيب اسبوتات ليد للجبسوم بورد", SortOrder = 15 },
            new PackageFeatureItem { Id = 127, PackageSectionId = 20, Text = "عمل كشافات طوارئ للشقة بالكامل", SortOrder = 16 },
            new PackageFeatureItem { Id = 128, PackageSectionId = 20, Text = "توريد وتركيب ساوند سيستم", SortOrder = 17 },
            new PackageFeatureItem { Id = 129, PackageSectionId = 20, Text = "تأسيس شاتر للشقة بالكامل", SortOrder = 18 },
            new PackageFeatureItem { Id = 130, PackageSectionId = 20, Text = "تأسيس وتركيب مخارج كهرباء للدريسنج روم وليد المطابخ", SortOrder = 19 },
            new PackageFeatureItem { Id = 131, PackageSectionId = 20, Text = "عمل بروفايل ليد على حسب اختيار العميل", SortOrder = 20 },
            new PackageFeatureItem { Id = 132, PackageSectionId = 20, Text = "تأسيس مواسير فريون للشقة بالكامل عدا الوجهات back to back", SortOrder = 21 },
            new PackageFeatureItem { Id = 133, PackageSectionId = 21, Text = "توريد وتركيب خامات عزل الرطوبة للحمام مع عمل طبقة لياسة أسمنتية (رقبة زجاجة أسمنتية + عزل بارد + عزل انسومات + سيكا 107)، وتأسيس سباكة الحمامات + المطبخ", SortOrder = 1 },
            new PackageFeatureItem { Id = 134, PackageSectionId = 21, Text = "المواسير المستخدمة في التأسيس بي إر وسمارت هوم ألماني مع إعطاء العميل شهادة ضمان", SortOrder = 2 },
            new PackageFeatureItem { Id = 135, PackageSectionId = 21, Text = "تشطيب السباكة: (2) خزان دفن جروهي أو ايديال، وقاعدة معلقة وحوض ديوافيت بحد أقصى 6000 جنيه للطقم الواحد، تركيب خلاطات ايديال استاندرد 4000 جنيه + تركيب وحدة شاور", SortOrder = 3 },
            new PackageFeatureItem { Id = 136, PackageSectionId = 21, Text = "عمل صرف داخلي للتكييفات", SortOrder = 4 },
            new PackageFeatureItem { Id = 137, PackageSectionId = 21, Text = "تركيب بانيو شاسيه وتركيب كابينة شاور اكسسوار فرنساوي بحد أقصى 7000 جنيه", SortOrder = 5 },
            new PackageFeatureItem { Id = 138, PackageSectionId = 22, Text = "عمل جبسوم بورد للوحدة بالكامل + مكتبة جبسوم بورد", SortOrder = 1 },
            new PackageFeatureItem { Id = 139, PackageSectionId = 22, Text = "جبسوم بورد أحمر للمطابخ، وجبسوم بورد أخضر للحمامات", SortOrder = 2 },
            new PackageFeatureItem { Id = 140, PackageSectionId = 23, Text = "توريد وتركيب باب مصفح تركي تصفيح كامل 11 سم للشقة", SortOrder = 1 },
            new PackageFeatureItem { Id = 141, PackageSectionId = 23, Text = "توريد وتركيب أبواب جاهزة تركي", SortOrder = 2 },
            new PackageFeatureItem { Id = 142, PackageSectionId = 24, Text = "توريد وتركيب شبابيك المطبخ والحمامات (UPVC) مع عمل مكان للشفاط", SortOrder = 1 },
            new PackageFeatureItem { Id = 143, PackageSectionId = 25, Text = "توريد وتركيب سيراميك أو بورسلين مستورد أو رخام (بريشيا – امبرادور – كراره – بتشينو كلاسيك) للريسيبشن والطرقة (600 جنيه للمتر)", SortOrder = 1 },
            new PackageFeatureItem { Id = 144, PackageSectionId = 25, Text = "توريد وتركيب سيراميك باقي الشقة حوائط وأرضيات أو توريد HDF للغرف (200 جنيه للمتر)", SortOrder = 2 },
            new PackageFeatureItem { Id = 145, PackageSectionId = 25, Text = "توريد وتشوين الأسمنت والرمل ومادة السقية وكل ما يخص ذلك البند", SortOrder = 3 },
            new PackageFeatureItem { Id = 146, PackageSectionId = 25, Text = "توريد وتركيب معابر الرخام بين الغرف + عتبة خارجية أمام باب الشقة", SortOrder = 4 },
            new PackageFeatureItem { Id = 147, PackageSectionId = 26, Text = "وش سيلر مائي", SortOrder = 1 },
            new PackageFeatureItem { Id = 148, PackageSectionId = 26, Text = "عدد (4) سكينة معجون للشقة بالكامل", SortOrder = 2 },
            new PackageFeatureItem { Id = 149, PackageSectionId = 26, Text = "عدد (1) وش بطانة", SortOrder = 3 },
            new PackageFeatureItem { Id = 150, PackageSectionId = 26, Text = "عدد (2) وش تشطيب نهائي", SortOrder = 4 },
            new PackageFeatureItem { Id = 151, PackageSectionId = 26, Text = "الدهانات المستخدمة جوتين قابلة للغسيل", SortOrder = 5 },
            new PackageFeatureItem { Id = 152, PackageSectionId = 26, Text = "عدد (3) جانب قطيفة أو ورق حائط من ضمنهم غرفة 3D", SortOrder = 6 },
            new PackageFeatureItem { Id = 153, PackageSectionId = 26, Text = "حجر لا يتعدى 15 متر أو بلاطات 3D", SortOrder = 7 },
            new PackageFeatureItem { Id = 154, PackageSectionId = 26, Text = "ديكور إضافي على حسب اختيار العميل (بروفايل ليد – تجليد خشب – بديل الرخام – بديل الخشب) بحد أقصى 30 متر", SortOrder = 8 });
    }

    private static void SeedPlatinumSections(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<PackageSection>().HasData(
            new PackageSection { Id = 27, FinishingPackageId = 5, Title = "الكهرباء", SortOrder = 1 },
            new PackageSection { Id = 28, FinishingPackageId = 5, Title = "السباكة", SortOrder = 2 },
            new PackageSection { Id = 29, FinishingPackageId = 5, Title = "الأبواب والأسقف", SortOrder = 3 },
            new PackageSection { Id = 30, FinishingPackageId = 5, Title = "السيراميك والرخام والنوافذ", SortOrder = 4 },
            new PackageSection { Id = 31, FinishingPackageId = 5, Title = "النقاشة والديكور", SortOrder = 5 },
            new PackageSection { Id = 32, FinishingPackageId = 5, Title = "بند التوريدات (خاص بهذه الباقة)", SortOrder = 6 });

        modelBuilder.Entity<PackageFeatureItem>().HasData(
            new PackageFeatureItem { Id = 155, PackageSectionId = 27, Text = "لوحة 24 خط فينوس", SortOrder = 1 },
            new PackageFeatureItem { Id = 156, PackageSectionId = 27, Text = "علب ماجيك وخراطيم مصطفى محمود", SortOrder = 2 },
            new PackageFeatureItem { Id = 157, PackageSectionId = 27, Text = "تكييفات للشقة بالكامل كهرباء وتأسيس فريون", SortOrder = 3 },
            new PackageFeatureItem { Id = 158, PackageSectionId = 27, Text = "سلك سويدي معتمد أو مسك سعودي أو ما يماثله", SortOrder = 4 },
            new PackageFeatureItem { Id = 159, PackageSectionId = 27, Text = "لقم ومفاتيح فينوس أو شانسي ضمان مدى الحياة", SortOrder = 5 },
            new PackageFeatureItem { Id = 160, PackageSectionId = 27, Text = "عمل دائرة تليفون، دش، ونت للشقة بالكامل", SortOrder = 6 },
            new PackageFeatureItem { Id = 161, PackageSectionId = 27, Text = "عمل كابل HD من مكتبية التلفزيون إلى أقرب مكان جلوس بالريسيبشن وغرفة المعيشة", SortOrder = 7 },
            new PackageFeatureItem { Id = 162, PackageSectionId = 27, Text = "تأسيس وتوريد وتركيب أنتركم مرئي", SortOrder = 8 },
            new PackageFeatureItem { Id = 163, PackageSectionId = 27, Text = "تأسيس روتر في الطرقة، وديفتير في الطرقة وغرفة النوم الرئيسية", SortOrder = 9 },
            new PackageFeatureItem { Id = 164, PackageSectionId = 27, Text = "عمل برايز للشفاط جنب شبابيك المطابخ والحمامات", SortOrder = 10 },
            new PackageFeatureItem { Id = 165, PackageSectionId = 27, Text = "عمل مفتاح تكييفات للسخانات والغسالات والتكييفات", SortOrder = 11 },
            new PackageFeatureItem { Id = 166, PackageSectionId = 27, Text = "توريد وتركيب اسبوتات ليد للجبسوم بورد", SortOrder = 12 },
            new PackageFeatureItem { Id = 167, PackageSectionId = 27, Text = "عمل كشافات طوارئ للشقة بالكامل", SortOrder = 13 },
            new PackageFeatureItem { Id = 168, PackageSectionId = 27, Text = "توريد وتركيب ساوند سيستم", SortOrder = 14 },
            new PackageFeatureItem { Id = 169, PackageSectionId = 27, Text = "تأسيس شاتر للشقة بالكامل", SortOrder = 15 },
            new PackageFeatureItem { Id = 170, PackageSectionId = 27, Text = "تأسيس وتركيب مخارج كهرباء للدريسنج روم وليد المطابخ", SortOrder = 16 },
            new PackageFeatureItem { Id = 171, PackageSectionId = 27, Text = "عمل بروفايل ليد على حسب اختيار العميل", SortOrder = 17 },
            new PackageFeatureItem { Id = 172, PackageSectionId = 27, Text = "تأسيس مواسير فريون للشقة بالكامل عدا الوجهات back to back", SortOrder = 18 },
            new PackageFeatureItem { Id = 173, PackageSectionId = 28, Text = "توريد وتركيب خامات عزل الرطوبة للحمام (رقبة زجاجة أسمنتية + عزل بارد + عزل انسومات + سيكا 107)، وتأسيس سباكة الحمامات + المطبخ", SortOrder = 1 },
            new PackageFeatureItem { Id = 174, PackageSectionId = 28, Text = "المواسير المستخدمة في التأسيس بي إر وسمارت هوم ألماني مع شهادة ضمان", SortOrder = 2 },
            new PackageFeatureItem { Id = 175, PackageSectionId = 28, Text = "تشطيب السباكة: (2) خزان دفن جروهي أو ايديال، وقاعدة معلقة وحوض ديوافيت بحد أقصى 6000 جنيه للطقم الواحد، تركيب خلاطات ايديال استاندرد 4000 جنيه + تركيب وحدة شاور", SortOrder = 3 },
            new PackageFeatureItem { Id = 176, PackageSectionId = 28, Text = "عمل صرف داخلي للتكييفات", SortOrder = 4 },
            new PackageFeatureItem { Id = 177, PackageSectionId = 28, Text = "تركيب بانيو شاسيه وتركيب كابينة شاور اكسسوار فرنساوي بحد أقصى 7000 جنيه", SortOrder = 5 },
            new PackageFeatureItem { Id = 178, PackageSectionId = 29, Text = "توريد وتركيب باب مصفح تركي تصفيح كامل 11 سم للشقة", SortOrder = 1 },
            new PackageFeatureItem { Id = 179, PackageSectionId = 29, Text = "توريد وتركيب أبواب جاهزة تركي", SortOrder = 2 },
            new PackageFeatureItem { Id = 180, PackageSectionId = 29, Text = "عمل جبسوم بورد للوحدة بالكامل + مكتبة جبسوم بورد", SortOrder = 3 },
            new PackageFeatureItem { Id = 181, PackageSectionId = 29, Text = "جبسوم بورد أحمر للمطابخ، وجبسوم بورد أخضر للحمامات", SortOrder = 4 },
            new PackageFeatureItem { Id = 182, PackageSectionId = 30, Text = "توريد وتركيب سيراميك أو بورسلين مستورد أو رخام (بريشيا – امبرادور – كراره – بتشينو كلاسيك) للريسيبشن والطرقة (600 جنيه للمتر)", SortOrder = 1 },
            new PackageFeatureItem { Id = 183, PackageSectionId = 30, Text = "توريد وتركيب سيراميك باقي الشقة حوائط وأرضيات أو توريد HDF للغرف (200 جنيه للمتر)", SortOrder = 2 },
            new PackageFeatureItem { Id = 184, PackageSectionId = 30, Text = "توريد وتشوين الأسمنت والرمل ومادة السقية وكل ما يخص ذلك البند", SortOrder = 3 },
            new PackageFeatureItem { Id = 185, PackageSectionId = 30, Text = "توريد وتركيب معابر الرخام بين الغرف + عتبة خارجية أمام باب الشقة", SortOrder = 4 },
            new PackageFeatureItem { Id = 186, PackageSectionId = 30, Text = "توريد وتركيب شبابيك الشقة بالكامل + شبابيك المطبخ والحمامات (UPVC) مع عمل مكان للشفاط", SortOrder = 5 },
            new PackageFeatureItem { Id = 187, PackageSectionId = 31, Text = "وش سيلر مائي، عدد (4) سكينة معجون، وش بطانة، وعدد (2) وش تشطيب نهائي", SortOrder = 1 },
            new PackageFeatureItem { Id = 188, PackageSectionId = 31, Text = "الدهانات المستخدمة جوتين قابلة للغسيل", SortOrder = 2 },
            new PackageFeatureItem { Id = 189, PackageSectionId = 31, Text = "عدد (3) جانب قطيفة أو ورق حائط من ضمنهم غرفة 3D", SortOrder = 3 },
            new PackageFeatureItem { Id = 190, PackageSectionId = 31, Text = "حجر لا يتعدى 15 متر أو بلاطات 3D", SortOrder = 4 },
            new PackageFeatureItem { Id = 191, PackageSectionId = 31, Text = "ديكور إضافي على حسب اختيار العميل (بروفايل ليد – تجليد خشب – بديل الرخام – بديل الخشب) بحد أقصى 30 متر", SortOrder = 5 },
            new PackageFeatureItem { Id = 192, PackageSectionId = 32, Text = "توريد وتركيب أعمال وحدات المطبخ (HPL أو ما يماثلها حسب اختيار العميل) بمفصلات مستوردة + الخلاطات وحلة الغسيل وعمل رخامة المطبخ", SortOrder = 1 },
            new PackageFeatureItem { Id = 193, PackageSectionId = 32, Text = "توريد وتركيب غرفة الدريسينج روم بالكامل", SortOrder = 2 },
            new PackageFeatureItem { Id = 194, PackageSectionId = 32, Text = "توريد وتركيب التكييفات الخاصة بالوحدة بالكامل ماركة شارب أو ما يماثلها، قدرات 1.5 أو 3 حصان", SortOrder = 3 },
            new PackageFeatureItem { Id = 195, PackageSectionId = 32, Text = "توريد وتركيب سخانات للوحدة بعدد الحمامات والمطابخ", SortOrder = 4 },
            new PackageFeatureItem { Id = 196, PackageSectionId = 32, Text = "توريد وتركيب الستائر الخاصة بالوحدة بالكامل", SortOrder = 5 },
            new PackageFeatureItem { Id = 197, PackageSectionId = 32, Text = "توريد وتركيب وحدات الإضاءة (نجف – أباليك) مع عمل مقايسة بالتكلفة وتقديمها للعميل", SortOrder = 6 },
            new PackageFeatureItem { Id = 198, PackageSectionId = 32, Text = "توريد وتركيب الشفاطات الخاصة بالحمامات والمطبخ حسب اختيار العميل ماركة شارب أو ما يماثلها", SortOrder = 7 },
            new PackageFeatureItem { Id = 199, PackageSectionId = 32, Text = "توريد وتركيب المرايات الخاصة بالحمامات حسب اختيار العميل", SortOrder = 8 });
    }

    private static void SeedDiamondSections(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<PackageSection>().HasData(
            new PackageSection { Id = 33, FinishingPackageId = 6, Title = "الكهرباء", SortOrder = 1 },
            new PackageSection { Id = 34, FinishingPackageId = 6, Title = "السباكة", SortOrder = 2 },
            new PackageSection { Id = 35, FinishingPackageId = 6, Title = "الأبواب والأسقف", SortOrder = 3 },
            new PackageSection { Id = 36, FinishingPackageId = 6, Title = "السيراميك والرخام والنوافذ", SortOrder = 4 },
            new PackageSection { Id = 37, FinishingPackageId = 6, Title = "النقاشة والديكور", SortOrder = 5 },
            new PackageSection { Id = 38, FinishingPackageId = 6, Title = "بند التوريدات والفرش (خاص بهذه الباقة)", SortOrder = 6 });

        modelBuilder.Entity<PackageFeatureItem>().HasData(
            new PackageFeatureItem { Id = 200, PackageSectionId = 33, Text = "لوحة 24 خط فينوس", SortOrder = 1 },
            new PackageFeatureItem { Id = 201, PackageSectionId = 33, Text = "علب ماجيك وخراطيم مصطفى محمود", SortOrder = 2 },
            new PackageFeatureItem { Id = 202, PackageSectionId = 33, Text = "تكييفات للشقة بالكامل كهرباء وتأسيس فريون", SortOrder = 3 },
            new PackageFeatureItem { Id = 203, PackageSectionId = 33, Text = "سلك سويدي معتمد أو مسك سعودي أو ما يماثله", SortOrder = 4 },
            new PackageFeatureItem { Id = 204, PackageSectionId = 33, Text = "لقم ومفاتيح فينوس أو شانسي ضمان مدى الحياة", SortOrder = 5 },
            new PackageFeatureItem { Id = 205, PackageSectionId = 33, Text = "عمل دائرة تليفون، دش، ونت للشقة بالكامل", SortOrder = 6 },
            new PackageFeatureItem { Id = 206, PackageSectionId = 33, Text = "عمل كابل HD من مكتبية التلفزيون إلى أقرب مكان جلوس بالريسيبشن وغرفة المعيشة", SortOrder = 7 },
            new PackageFeatureItem { Id = 207, PackageSectionId = 33, Text = "تأسيس وتوريد وتركيب أنتركم مرئي", SortOrder = 8 },
            new PackageFeatureItem { Id = 208, PackageSectionId = 33, Text = "تأسيس روتر في الطرقة، وديفتير في الطرقة وغرفة النوم الرئيسية", SortOrder = 9 },
            new PackageFeatureItem { Id = 209, PackageSectionId = 33, Text = "عمل برايز للشفاط جنب شبابيك المطابخ والحمامات", SortOrder = 10 },
            new PackageFeatureItem { Id = 210, PackageSectionId = 33, Text = "عمل مفتاح تكييفات للسخانات والغسالات والتكييفات", SortOrder = 11 },
            new PackageFeatureItem { Id = 211, PackageSectionId = 33, Text = "توريد وتركيب اسبوتات ليد للجبسوم بورد", SortOrder = 12 },
            new PackageFeatureItem { Id = 212, PackageSectionId = 33, Text = "عمل كشافات طوارئ للشقة بالكامل", SortOrder = 13 },
            new PackageFeatureItem { Id = 213, PackageSectionId = 33, Text = "توريد وتركيب ساوند سيستم", SortOrder = 14 },
            new PackageFeatureItem { Id = 214, PackageSectionId = 33, Text = "تأسيس شاتر للشقة بالكامل", SortOrder = 15 },
            new PackageFeatureItem { Id = 215, PackageSectionId = 33, Text = "تأسيس وتركيب مخارج كهرباء للدريسنج روم وليد المطابخ", SortOrder = 16 },
            new PackageFeatureItem { Id = 216, PackageSectionId = 33, Text = "عمل بروفايل ليد على حسب اختيار العميل", SortOrder = 17 },
            new PackageFeatureItem { Id = 217, PackageSectionId = 33, Text = "تأسيس مواسير فريون للشقة بالكامل عدا الوجهات back to back", SortOrder = 18 },
            new PackageFeatureItem { Id = 218, PackageSectionId = 34, Text = "توريد وتركيب خامات عزل الرطوبة للحمام (رقبة زجاجة أسمنتية + عزل بارد + عزل انسومات + سيكا 107)، وتأسيس سباكة الحمامات + المطبخ", SortOrder = 1 },
            new PackageFeatureItem { Id = 219, PackageSectionId = 34, Text = "المواسير المستخدمة في التأسيس بي إر وسمارت هوم ألماني مع شهادة ضمان", SortOrder = 2 },
            new PackageFeatureItem { Id = 220, PackageSectionId = 34, Text = "تشطيب السباكة: (2) خزان دفن جروهي أو ايديال، وقاعدة معلقة وحوض ديوافيت بحد أقصى 6000 جنيه للطقم الواحد، تركيب خلاطات ايديال استاندرد 4000 جنيه + تركيب وحدة شاور", SortOrder = 3 },
            new PackageFeatureItem { Id = 221, PackageSectionId = 34, Text = "عمل صرف داخلي للتكييفات", SortOrder = 4 },
            new PackageFeatureItem { Id = 222, PackageSectionId = 34, Text = "تركيب بانيو شاسيه وتركيب كابينة شاور اكسسوار فرنساوي بحد أقصى 7000 جنيه", SortOrder = 5 },
            new PackageFeatureItem { Id = 223, PackageSectionId = 35, Text = "توريد وتركيب باب مصفح تركي تصفيح كامل 11 سم للشقة", SortOrder = 1 },
            new PackageFeatureItem { Id = 224, PackageSectionId = 35, Text = "توريد وتركيب أبواب جاهزة تركي", SortOrder = 2 },
            new PackageFeatureItem { Id = 225, PackageSectionId = 35, Text = "عمل جبسوم بورد للوحدة بالكامل + مكتبة جبسوم بورد", SortOrder = 3 },
            new PackageFeatureItem { Id = 226, PackageSectionId = 35, Text = "جبسوم بورد أحمر للمطابخ، وجبسوم بورد أخضر للحمامات", SortOrder = 4 },
            new PackageFeatureItem { Id = 227, PackageSectionId = 36, Text = "توريد وتركيب سيراميك أو بورسلين مستورد أو رخام (بريشيا – امبرادور – كراره – بتشينو كلاسيك) للريسيبشن والطرقة (600 جنيه للمتر)", SortOrder = 1 },
            new PackageFeatureItem { Id = 228, PackageSectionId = 36, Text = "توريد وتركيب سيراميك باقي الشقة حوائط وأرضيات أو توريد HDF للغرف (200 جنيه للمتر)", SortOrder = 2 },
            new PackageFeatureItem { Id = 229, PackageSectionId = 36, Text = "توريد وتشوين الأسمنت والرمل ومادة السقية وكل ما يخص ذلك البند", SortOrder = 3 },
            new PackageFeatureItem { Id = 230, PackageSectionId = 36, Text = "توريد وتركيب معابر الرخام بين الغرف + عتبة خارجية أمام باب الشقة", SortOrder = 4 },
            new PackageFeatureItem { Id = 231, PackageSectionId = 36, Text = "توريد وتركيب شبابيك الشقة بالكامل + شبابيك المطبخ والحمامات (UPVC) مع عمل مكان للشفاط", SortOrder = 5 },
            new PackageFeatureItem { Id = 232, PackageSectionId = 37, Text = "وش سيلر مائي، عدد (4) سكينة معجون، وش بطانة، وعدد (2) وش تشطيب نهائي", SortOrder = 1 },
            new PackageFeatureItem { Id = 233, PackageSectionId = 37, Text = "الدهانات المستخدمة جوتين قابلة للغسيل", SortOrder = 2 },
            new PackageFeatureItem { Id = 234, PackageSectionId = 37, Text = "عدد (3) جانب قطيفة أو ورق حائط من ضمنهم غرفة 3D", SortOrder = 3 },
            new PackageFeatureItem { Id = 235, PackageSectionId = 37, Text = "حجر لا يتعدى 15 متر أو بلاطات 3D", SortOrder = 4 },
            new PackageFeatureItem { Id = 236, PackageSectionId = 37, Text = "ديكور إضافي على حسب اختيار العميل (بروفايل ليد – تجليد خشب – بديل الرخام – بديل الخشب) بحد أقصى 30 متر", SortOrder = 5 },
            new PackageFeatureItem { Id = 237, PackageSectionId = 38, Text = "توريد وتركيب أعمال وحدات المطبخ (HPL أو ما يماثلها حسب اختيار العميل) بمفصلات مستوردة + الخلاطات وحلة الغسيل وعمل رخامة المطبخ", SortOrder = 1 },
            new PackageFeatureItem { Id = 238, PackageSectionId = 38, Text = "توريد وتركيب غرفة الدريسينج روم بالكامل", SortOrder = 2 },
            new PackageFeatureItem { Id = 239, PackageSectionId = 38, Text = "توريد وتركيب عفش الشقة بالكامل حسب اختيار العميل من المصنع الخاص بالشركة، وفقاً للرسم المتفق عليه وعدد الغرف", SortOrder = 3 },
            new PackageFeatureItem { Id = 240, PackageSectionId = 38, Text = "توريد وتركيب التكييفات الخاصة بالوحدة بالكامل ماركة شارب أو ما يماثلها، قدرات 1.5 أو 3 حصان", SortOrder = 4 },
            new PackageFeatureItem { Id = 241, PackageSectionId = 38, Text = "توريد وتركيب سخانات للوحدة بعدد الحمامات والمطابخ", SortOrder = 5 },
            new PackageFeatureItem { Id = 242, PackageSectionId = 38, Text = "توريد وتركيب الستائر الخاصة بالوحدة بالكامل", SortOrder = 6 },
            new PackageFeatureItem { Id = 243, PackageSectionId = 38, Text = "توريد وتركيب وحدات الإضاءة (نجف – أباليك) مع عمل مقايسة بالتكلفة وتقديمها للعميل", SortOrder = 7 },
            new PackageFeatureItem { Id = 244, PackageSectionId = 38, Text = "توريد وتركيب السجاد الخاص بالوحدة من قبل معارض الشركة", SortOrder = 8 },
            new PackageFeatureItem { Id = 245, PackageSectionId = 38, Text = "توريد وتركيب المراتب: عدد 2 سرير أطفال، وعدد 1 مرتبة كينج", SortOrder = 9 },
            new PackageFeatureItem { Id = 246, PackageSectionId = 38, Text = "توريد وتركيب الشفاطات الخاصة بالحمامات والمطبخ حسب اختيار العميل ماركة شارب أو ما يماثلها", SortOrder = 10 },
            new PackageFeatureItem { Id = 247, PackageSectionId = 38, Text = "توريد وتركيب المرايات الخاصة بالحمامات حسب اختيار العميل", SortOrder = 11 });
    }
}
