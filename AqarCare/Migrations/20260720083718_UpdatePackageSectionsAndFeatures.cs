using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace AqarCare.Migrations
{
    /// <inheritdoc />
    public partial class UpdatePackageSectionsAndFeatures : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "PackageSections",
                columns: new[] { "Id", "FinishingPackageId", "SortOrder", "Title" },
                values: new object[,]
                {
                    { 7, 2, 1, "الكهرباء" },
                    { 8, 2, 2, "السباكة" },
                    { 9, 2, 3, "الأسقف والجبسوم بورد" },
                    { 10, 2, 4, "السيراميك والرخام" },
                    { 11, 2, 5, "النقاشة" },
                    { 12, 2, 6, "النوافذ" },
                    { 13, 3, 1, "الكهرباء" },
                    { 14, 3, 2, "السباكة" },
                    { 15, 3, 3, "الأسقف والجبسوم بورد" },
                    { 16, 3, 4, "الأبواب" },
                    { 17, 3, 5, "السيراميك والرخام" },
                    { 18, 3, 6, "النقاشة والديكور" },
                    { 19, 3, 7, "النوافذ" },
                    { 20, 4, 1, "الكهرباء" },
                    { 21, 4, 2, "السباكة" },
                    { 22, 4, 3, "الأسقف والجبسوم بورد" },
                    { 23, 4, 4, "الأبواب" },
                    { 24, 4, 5, "النوافذ" },
                    { 25, 4, 6, "السيراميك والرخام" },
                    { 26, 4, 7, "النقاشة والديكور" },
                    { 27, 5, 1, "الكهرباء" },
                    { 28, 5, 2, "السباكة" },
                    { 29, 5, 3, "الأبواب والأسقف" },
                    { 30, 5, 4, "السيراميك والرخام والنوافذ" },
                    { 31, 5, 5, "النقاشة والديكور" },
                    { 32, 5, 6, "بند التوريدات (خاص بهذه الباقة)" },
                    { 33, 6, 1, "الكهرباء" },
                    { 34, 6, 2, "السباكة" },
                    { 35, 6, 3, "الأبواب والأسقف" },
                    { 36, 6, 4, "السيراميك والرخام والنوافذ" },
                    { 37, 6, 5, "النقاشة والديكور" },
                    { 38, 6, 6, "بند التوريدات والفرش (خاص بهذه الباقة)" }
                });

            migrationBuilder.InsertData(
                table: "PackageFeatureItems",
                columns: new[] { "Id", "PackageSectionId", "SortOrder", "Text" },
                values: new object[,]
                {
                    { 33, 7, 1, "لوحة 18 خط فينوس" },
                    { 34, 7, 2, "علب ماجيك وخراطيم مصطفى محمود" },
                    { 35, 7, 3, "تأسيس تكييفات للشقة بالكامل (كهرباء فقط)" },
                    { 36, 7, 4, "سلك سويدي أو مسك سعودي معتمد أو ما يماثله" },
                    { 37, 7, 5, "لقم ومفاتيح خيند ضمان مدى الحياة" },
                    { 38, 7, 6, "عمل دائرة تليفون للشقة بالكامل" },
                    { 39, 7, 7, "عمل دائرة دش للشقة بالكامل" },
                    { 40, 7, 8, "عمل دائرة نت للريسيبشن وغرفة النوم فقط" },
                    { 41, 7, 9, "تأسيس علبة للأنتركم" },
                    { 42, 7, 10, "تأسيس روتر في الطرقة" },
                    { 43, 7, 11, "ديفتير في الطرقة وغرفة النوم الرئيسية" },
                    { 44, 7, 12, "عمل برايز للشفاط جنب شبابيك المطابخ والحمامات" },
                    { 45, 7, 13, "عمل مفتاح تكييفات للسخانات والغسالات والتكييفات" },
                    { 46, 7, 14, "توريد وتركيب اسبوتات ليد للجبسوم بورد" },
                    { 47, 7, 15, "عمل كشافات طوارئ للريسيبشن والطرقة فقط" },
                    { 48, 8, 1, "توريد وتركيب خامات عزل الرطوبة للحمام مع عمل طبقة لياسة أسمنتية لأرضية الحمام (رقبة زجاجة أسمنتية + عزل بارد + عزل انسومات)" },
                    { 49, 8, 2, "تأسيس سباكة الحمامات + المطبخ" },
                    { 50, 8, 3, "المواسير المستخدمة في التأسيس الشريف أو تكنو ثيرم مع إعطاء العميل شهادة ضمان" },
                    { 51, 8, 4, "تشطيب السباكة قاعدة وحوض بحد أقصى 6000 جنيه للحمام الواحد – تركيب خلاطات بحد أقصى 5000 جنيه للحمام الواحد" },
                    { 52, 8, 5, "عمل صرف داخلي للتكييفات" },
                    { 53, 8, 6, "تركيب بانيو للحمام شاسيه أو كابينة شاور زجاج سيكوريت لحمام واحد فقط بحد أقصى 6000 جنيه" },
                    { 54, 9, 1, "عمل ضهارة للشقة بالكامل" },
                    { 55, 9, 2, "عمل جبسوم بورد للوحدة بإجمالي مساحة الوحدة" },
                    { 56, 9, 3, "جبسوم بورد أحمر للمطابخ، وجبسوم بورد أخضر للحمامات" },
                    { 57, 10, 1, "توريد وتركيب سيراميك للريسيبشن والطرقة (350 جنيه للمتر)" },
                    { 58, 10, 2, "توريد وتركيب سيراميك باقي الشقة حوائط وأرضيات (200 جنيه للمتر)" },
                    { 59, 10, 3, "توريد وتشوين الأسمنت والرمل ومادة السقية وكل ما يخص ذلك البند" },
                    { 60, 10, 4, "توريد وتركيب معابر الرخام بين الغرف + عتبة خارجية أمام باب الشقة" },
                    { 61, 11, 1, "وش سيلر مائي" },
                    { 62, 11, 2, "عدد (3) سكينة معجون للشقة بالكامل" },
                    { 63, 11, 3, "عدد (1) وش بطانة" },
                    { 64, 11, 4, "عدد (2) وش تشطيب نهائي" },
                    { 65, 11, 5, "الدهانات المستخدمة ماركة جي إل سي قابل للغسيل" },
                    { 66, 11, 6, "عدد (2) جانب قطيفة أو ورق حائط أو حجر لا يتعدى 10 متر" },
                    { 67, 12, 1, "توريد وتركيب شبابيك المطبخ والحمامات (UPVC) مع عمل مكان للشفاط" },
                    { 68, 13, 1, "لوحة 24 خط فينوس" },
                    { 69, 13, 2, "علب ماجيك وخراطيم مصطفى محمود" },
                    { 70, 13, 3, "تكييفات للشقة بالكامل كهرباء وتأسيس فريون" },
                    { 71, 13, 4, "سلك سويدي أو مسك سعودي معتمد أو ما يماثله" },
                    { 72, 13, 5, "لقم ومفاتيح فينوس أو شانسي ضمان مدى الحياة" },
                    { 73, 13, 6, "عمل دائرة تليفون للشقة بالكامل" },
                    { 74, 13, 7, "عمل دائرة دش للشقة بالكامل" },
                    { 75, 13, 8, "عمل دائرة نت للشقة بالكامل" },
                    { 76, 13, 9, "عمل كابل HD من مكتبية التلفزيون إلى أقرب مكان جلوس بالريسيبشن وغرفة المعيشة" },
                    { 77, 13, 10, "تأسيس علبة للأنتركم" },
                    { 78, 13, 11, "تأسيس روتر في الطرقة" },
                    { 79, 13, 12, "ديفتير في الطرقة وغرفة النوم الرئيسية والريسيبشن" },
                    { 80, 13, 13, "عمل برايز للشفاط جنب شبابيك المطابخ والحمامات" },
                    { 81, 13, 14, "عمل مفتاح تكييفات للسخانات والغسالات والتكييفات" },
                    { 82, 13, 15, "توريد وتركيب اسبوتات ليد للجبسوم بورد" },
                    { 83, 13, 16, "عمل كشافات طوارئ للشقة بالكامل" },
                    { 84, 13, 17, "تأسيس ساوند سيستم" },
                    { 85, 14, 1, "توريد وتركيب خامات عزل الرطوبة للحمام مع عمل طبقة لياسة أسمنتية (رقبة زجاجة أسمنتية + عزل بارد + عزل انسومات + سيكا 107)" },
                    { 86, 14, 2, "تأسيس سباكة الحمامات + المطبخ" },
                    { 87, 14, 3, "المواسير المستخدمة في التأسيس بي إر وسمارت هوم ألماني أو تكنو ثيرم مع شهادة ضمان" },
                    { 88, 14, 4, "تشطيب السباكة خزان دفن وقاعدة معلقة وحوض بحد أقصى 8000 جنيه للحمام الواحد، تركيب خلاطات بحد أقصى 7000 جنيه، + تركيب شلال للشاور" },
                    { 89, 14, 5, "عمل صرف داخلي للتكييفات" },
                    { 90, 14, 6, "تركيب بانيو شاسيه للحمام أو توريد وتركيب كابينة زجاج سيكوريت لحمام واحد فقط بحد أقصى 8000 جنيه" },
                    { 91, 15, 1, "عمل ضهارة للشقة بالكامل" },
                    { 92, 15, 2, "عمل جبسوم بورد للوحدة بالكامل + مكتبة جبسوم بورد" },
                    { 93, 15, 3, "جبسوم بورد أحمر للمطابخ، وجبسوم بورد أخضر للحمامات" },
                    { 94, 16, 1, "توريد وتركيب باب مصفح تركي تصفيح كامل للشقة" },
                    { 95, 16, 2, "تركيب أبواب للغرف والحمامات خشب موسكي بطبقة MDF" },
                    { 96, 16, 3, "دهان الأبواب أستر أو لاكية حسب اختيار العميل" },
                    { 97, 16, 4, "تركيب الكوالين للأبواب (يتم شراء الأوكر من قبل العميل)" },
                    { 98, 17, 1, "توريد وتركيب سيراميك أو بورسلين للريسيبشن والطرقة (625 جنيه للمتر)" },
                    { 99, 17, 2, "توريد وتركيب سيراميك باقي الشقة حوائط وأرضيات (300 جنيه للمتر)" },
                    { 100, 17, 3, "توريد وتشوين الأسمنت والرمل ومادة السقية وكل ما يخص ذلك البند" },
                    { 101, 17, 4, "توريد وتركيب معابر الرخام بين الغرف + عتبة خارجية أمام باب الشقة" },
                    { 102, 18, 1, "وش سيلر مائي" },
                    { 103, 18, 2, "عدد (3) سكينة معجون للشقة بالكامل" },
                    { 104, 18, 3, "عدد (1) وش بطانة" },
                    { 105, 18, 4, "عدد (2) وش تشطيب نهائي" },
                    { 106, 18, 5, "الدهانات المستخدمة جوتين قابلة للغسيل" },
                    { 107, 18, 6, "عدد (2) جانب قطيفة أو ورق حائط من ضمنهم غرفة 3D" },
                    { 108, 18, 7, "حجر لا يتعدى 10 متر أو بلاطات 3D" },
                    { 109, 18, 8, "تجليد خشب أمام باب الشقة + تجليد خشب لديكور جانب واحد أو بديل الرخام أو بروفايل ليد بحد أقصى 15 متر" },
                    { 110, 18, 9, "توريد وتركيب CNC في الطرقة والريسيبشن لا يتعدى 15 متر" },
                    { 111, 19, 1, "توريد وتركيب شبابيك المطبخ والحمامات (UPVC) مع عمل مكان للشفاط" },
                    { 112, 20, 1, "لوحة 24 خط فينوس" },
                    { 113, 20, 2, "علب ماجيك وخراطيم مصطفى محمود" },
                    { 114, 20, 3, "تكييفات للشقة بالكامل كهرباء وتأسيس فريون" },
                    { 115, 20, 4, "سلك سويدي معتمد أو مسك سعودي أو ما يماثله" },
                    { 116, 20, 5, "لقم ومفاتيح فينوس أو شانسي ضمان مدى الحياة" },
                    { 117, 20, 6, "عمل دائرة تليفون للشقة بالكامل" },
                    { 118, 20, 7, "عمل دائرة دش للشقة بالكامل" },
                    { 119, 20, 8, "عمل دائرة نت للشقة بالكامل" },
                    { 120, 20, 9, "عمل كابل HD من مكتبية التلفزيون إلى أقرب مكان جلوس بالريسيبشن وغرفة المعيشة" },
                    { 121, 20, 10, "تأسيس وتوريد وتركيب أنتركم مرئي" },
                    { 122, 20, 11, "تأسيس روتر في الطرقة" },
                    { 123, 20, 12, "ديفتير في الطرقة وغرفة النوم الرئيسية" },
                    { 124, 20, 13, "عمل برايز للشفاط جنب شبابيك المطابخ والحمامات" },
                    { 125, 20, 14, "عمل مفتاح تكييفات للسخانات والغسالات والتكييفات" },
                    { 126, 20, 15, "توريد وتركيب اسبوتات ليد للجبسوم بورد" },
                    { 127, 20, 16, "عمل كشافات طوارئ للشقة بالكامل" },
                    { 128, 20, 17, "توريد وتركيب ساوند سيستم" },
                    { 129, 20, 18, "تأسيس شاتر للشقة بالكامل" },
                    { 130, 20, 19, "تأسيس وتركيب مخارج كهرباء للدريسنج روم وليد المطابخ" },
                    { 131, 20, 20, "عمل بروفايل ليد على حسب اختيار العميل" },
                    { 132, 20, 21, "تأسيس مواسير فريون للشقة بالكامل عدا الوجهات back to back" },
                    { 133, 21, 1, "توريد وتركيب خامات عزل الرطوبة للحمام مع عمل طبقة لياسة أسمنتية (رقبة زجاجة أسمنتية + عزل بارد + عزل انسومات + سيكا 107)، وتأسيس سباكة الحمامات + المطبخ" },
                    { 134, 21, 2, "المواسير المستخدمة في التأسيس بي إر وسمارت هوم ألماني مع إعطاء العميل شهادة ضمان" },
                    { 135, 21, 3, "تشطيب السباكة: (2) خزان دفن جروهي أو ايديال، وقاعدة معلقة وحوض ديوافيت بحد أقصى 6000 جنيه للطقم الواحد، تركيب خلاطات ايديال استاندرد 4000 جنيه + تركيب وحدة شاور" },
                    { 136, 21, 4, "عمل صرف داخلي للتكييفات" },
                    { 137, 21, 5, "تركيب بانيو شاسيه وتركيب كابينة شاور اكسسوار فرنساوي بحد أقصى 7000 جنيه" },
                    { 138, 22, 1, "عمل جبسوم بورد للوحدة بالكامل + مكتبة جبسوم بورد" },
                    { 139, 22, 2, "جبسوم بورد أحمر للمطابخ، وجبسوم بورد أخضر للحمامات" },
                    { 140, 23, 1, "توريد وتركيب باب مصفح تركي تصفيح كامل 11 سم للشقة" },
                    { 141, 23, 2, "توريد وتركيب أبواب جاهزة تركي" },
                    { 142, 24, 1, "توريد وتركيب شبابيك المطبخ والحمامات (UPVC) مع عمل مكان للشفاط" },
                    { 143, 25, 1, "توريد وتركيب سيراميك أو بورسلين مستورد أو رخام (بريشيا – امبرادور – كراره – بتشينو كلاسيك) للريسيبشن والطرقة (600 جنيه للمتر)" },
                    { 144, 25, 2, "توريد وتركيب سيراميك باقي الشقة حوائط وأرضيات أو توريد HDF للغرف (200 جنيه للمتر)" },
                    { 145, 25, 3, "توريد وتشوين الأسمنت والرمل ومادة السقية وكل ما يخص ذلك البند" },
                    { 146, 25, 4, "توريد وتركيب معابر الرخام بين الغرف + عتبة خارجية أمام باب الشقة" },
                    { 147, 26, 1, "وش سيلر مائي" },
                    { 148, 26, 2, "عدد (4) سكينة معجون للشقة بالكامل" },
                    { 149, 26, 3, "عدد (1) وش بطانة" },
                    { 150, 26, 4, "عدد (2) وش تشطيب نهائي" },
                    { 151, 26, 5, "الدهانات المستخدمة جوتين قابلة للغسيل" },
                    { 152, 26, 6, "عدد (3) جانب قطيفة أو ورق حائط من ضمنهم غرفة 3D" },
                    { 153, 26, 7, "حجر لا يتعدى 15 متر أو بلاطات 3D" },
                    { 154, 26, 8, "ديكور إضافي على حسب اختيار العميل (بروفايل ليد – تجليد خشب – بديل الرخام – بديل الخشب) بحد أقصى 30 متر" },
                    { 155, 27, 1, "لوحة 24 خط فينوس" },
                    { 156, 27, 2, "علب ماجيك وخراطيم مصطفى محمود" },
                    { 157, 27, 3, "تكييفات للشقة بالكامل كهرباء وتأسيس فريون" },
                    { 158, 27, 4, "سلك سويدي معتمد أو مسك سعودي أو ما يماثله" },
                    { 159, 27, 5, "لقم ومفاتيح فينوس أو شانسي ضمان مدى الحياة" },
                    { 160, 27, 6, "عمل دائرة تليفون، دش، ونت للشقة بالكامل" },
                    { 161, 27, 7, "عمل كابل HD من مكتبية التلفزيون إلى أقرب مكان جلوس بالريسيبشن وغرفة المعيشة" },
                    { 162, 27, 8, "تأسيس وتوريد وتركيب أنتركم مرئي" },
                    { 163, 27, 9, "تأسيس روتر في الطرقة، وديفتير في الطرقة وغرفة النوم الرئيسية" },
                    { 164, 27, 10, "عمل برايز للشفاط جنب شبابيك المطابخ والحمامات" },
                    { 165, 27, 11, "عمل مفتاح تكييفات للسخانات والغسالات والتكييفات" },
                    { 166, 27, 12, "توريد وتركيب اسبوتات ليد للجبسوم بورد" },
                    { 167, 27, 13, "عمل كشافات طوارئ للشقة بالكامل" },
                    { 168, 27, 14, "توريد وتركيب ساوند سيستم" },
                    { 169, 27, 15, "تأسيس شاتر للشقة بالكامل" },
                    { 170, 27, 16, "تأسيس وتركيب مخارج كهرباء للدريسنج روم وليد المطابخ" },
                    { 171, 27, 17, "عمل بروفايل ليد على حسب اختيار العميل" },
                    { 172, 27, 18, "تأسيس مواسير فريون للشقة بالكامل عدا الوجهات back to back" },
                    { 173, 28, 1, "توريد وتركيب خامات عزل الرطوبة للحمام (رقبة زجاجة أسمنتية + عزل بارد + عزل انسومات + سيكا 107)، وتأسيس سباكة الحمامات + المطبخ" },
                    { 174, 28, 2, "المواسير المستخدمة في التأسيس بي إر وسمارت هوم ألماني مع شهادة ضمان" },
                    { 175, 28, 3, "تشطيب السباكة: (2) خزان دفن جروهي أو ايديال، وقاعدة معلقة وحوض ديوافيت بحد أقصى 6000 جنيه للطقم الواحد، تركيب خلاطات ايديال استاندرد 4000 جنيه + تركيب وحدة شاور" },
                    { 176, 28, 4, "عمل صرف داخلي للتكييفات" },
                    { 177, 28, 5, "تركيب بانيو شاسيه وتركيب كابينة شاور اكسسوار فرنساوي بحد أقصى 7000 جنيه" },
                    { 178, 29, 1, "توريد وتركيب باب مصفح تركي تصفيح كامل 11 سم للشقة" },
                    { 179, 29, 2, "توريد وتركيب أبواب جاهزة تركي" },
                    { 180, 29, 3, "عمل جبسوم بورد للوحدة بالكامل + مكتبة جبسوم بورد" },
                    { 181, 29, 4, "جبسوم بورد أحمر للمطابخ، وجبسوم بورد أخضر للحمامات" },
                    { 182, 30, 1, "توريد وتركيب سيراميك أو بورسلين مستورد أو رخام (بريشيا – امبرادور – كراره – بتشينو كلاسيك) للريسيبشن والطرقة (600 جنيه للمتر)" },
                    { 183, 30, 2, "توريد وتركيب سيراميك باقي الشقة حوائط وأرضيات أو توريد HDF للغرف (200 جنيه للمتر)" },
                    { 184, 30, 3, "توريد وتشوين الأسمنت والرمل ومادة السقية وكل ما يخص ذلك البند" },
                    { 185, 30, 4, "توريد وتركيب معابر الرخام بين الغرف + عتبة خارجية أمام باب الشقة" },
                    { 186, 30, 5, "توريد وتركيب شبابيك الشقة بالكامل + شبابيك المطبخ والحمامات (UPVC) مع عمل مكان للشفاط" },
                    { 187, 31, 1, "وش سيلر مائي، عدد (4) سكينة معجون، وش بطانة، وعدد (2) وش تشطيب نهائي" },
                    { 188, 31, 2, "الدهانات المستخدمة جوتين قابلة للغسيل" },
                    { 189, 31, 3, "عدد (3) جانب قطيفة أو ورق حائط من ضمنهم غرفة 3D" },
                    { 190, 31, 4, "حجر لا يتعدى 15 متر أو بلاطات 3D" },
                    { 191, 31, 5, "ديكور إضافي على حسب اختيار العميل (بروفايل ليد – تجليد خشب – بديل الرخام – بديل الخشب) بحد أقصى 30 متر" },
                    { 192, 32, 1, "توريد وتركيب أعمال وحدات المطبخ (HPL أو ما يماثلها حسب اختيار العميل) بمفصلات مستوردة + الخلاطات وحلة الغسيل وعمل رخامة المطبخ" },
                    { 193, 32, 2, "توريد وتركيب غرفة الدريسينج روم بالكامل" },
                    { 194, 32, 3, "توريد وتركيب التكييفات الخاصة بالوحدة بالكامل ماركة شارب أو ما يماثلها، قدرات 1.5 أو 3 حصان" },
                    { 195, 32, 4, "توريد وتركيب سخانات للوحدة بعدد الحمامات والمطابخ" },
                    { 196, 32, 5, "توريد وتركيب الستائر الخاصة بالوحدة بالكامل" },
                    { 197, 32, 6, "توريد وتركيب وحدات الإضاءة (نجف – أباليك) مع عمل مقايسة بالتكلفة وتقديمها للعميل" },
                    { 198, 32, 7, "توريد وتركيب الشفاطات الخاصة بالحمامات والمطبخ حسب اختيار العميل ماركة شارب أو ما يماثلها" },
                    { 199, 32, 8, "توريد وتركيب المرايات الخاصة بالحمامات حسب اختيار العميل" },
                    { 200, 33, 1, "لوحة 24 خط فينوس" },
                    { 201, 33, 2, "علب ماجيك وخراطيم مصطفى محمود" },
                    { 202, 33, 3, "تكييفات للشقة بالكامل كهرباء وتأسيس فريون" },
                    { 203, 33, 4, "سلك سويدي معتمد أو مسك سعودي أو ما يماثله" },
                    { 204, 33, 5, "لقم ومفاتيح فينوس أو شانسي ضمان مدى الحياة" },
                    { 205, 33, 6, "عمل دائرة تليفون، دش، ونت للشقة بالكامل" },
                    { 206, 33, 7, "عمل كابل HD من مكتبية التلفزيون إلى أقرب مكان جلوس بالريسيبشن وغرفة المعيشة" },
                    { 207, 33, 8, "تأسيس وتوريد وتركيب أنتركم مرئي" },
                    { 208, 33, 9, "تأسيس روتر في الطرقة، وديفتير في الطرقة وغرفة النوم الرئيسية" },
                    { 209, 33, 10, "عمل برايز للشفاط جنب شبابيك المطابخ والحمامات" },
                    { 210, 33, 11, "عمل مفتاح تكييفات للسخانات والغسالات والتكييفات" },
                    { 211, 33, 12, "توريد وتركيب اسبوتات ليد للجبسوم بورد" },
                    { 212, 33, 13, "عمل كشافات طوارئ للشقة بالكامل" },
                    { 213, 33, 14, "توريد وتركيب ساوند سيستم" },
                    { 214, 33, 15, "تأسيس شاتر للشقة بالكامل" },
                    { 215, 33, 16, "تأسيس وتركيب مخارج كهرباء للدريسنج روم وليد المطابخ" },
                    { 216, 33, 17, "عمل بروفايل ليد على حسب اختيار العميل" },
                    { 217, 33, 18, "تأسيس مواسير فريون للشقة بالكامل عدا الوجهات back to back" },
                    { 218, 34, 1, "توريد وتركيب خامات عزل الرطوبة للحمام (رقبة زجاجة أسمنتية + عزل بارد + عزل انسومات + سيكا 107)، وتأسيس سباكة الحمامات + المطبخ" },
                    { 219, 34, 2, "المواسير المستخدمة في التأسيس بي إر وسمارت هوم ألماني مع شهادة ضمان" },
                    { 220, 34, 3, "تشطيب السباكة: (2) خزان دفن جروهي أو ايديال، وقاعدة معلقة وحوض ديوافيت بحد أقصى 6000 جنيه للطقم الواحد، تركيب خلاطات ايديال استاندرد 4000 جنيه + تركيب وحدة شاور" },
                    { 221, 34, 4, "عمل صرف داخلي للتكييفات" },
                    { 222, 34, 5, "تركيب بانيو شاسيه وتركيب كابينة شاور اكسسوار فرنساوي بحد أقصى 7000 جنيه" },
                    { 223, 35, 1, "توريد وتركيب باب مصفح تركي تصفيح كامل 11 سم للشقة" },
                    { 224, 35, 2, "توريد وتركيب أبواب جاهزة تركي" },
                    { 225, 35, 3, "عمل جبسوم بورد للوحدة بالكامل + مكتبة جبسوم بورد" },
                    { 226, 35, 4, "جبسوم بورد أحمر للمطابخ، وجبسوم بورد أخضر للحمامات" },
                    { 227, 36, 1, "توريد وتركيب سيراميك أو بورسلين مستورد أو رخام (بريشيا – امبرادور – كراره – بتشينو كلاسيك) للريسيبشن والطرقة (600 جنيه للمتر)" },
                    { 228, 36, 2, "توريد وتركيب سيراميك باقي الشقة حوائط وأرضيات أو توريد HDF للغرف (200 جنيه للمتر)" },
                    { 229, 36, 3, "توريد وتشوين الأسمنت والرمل ومادة السقية وكل ما يخص ذلك البند" },
                    { 230, 36, 4, "توريد وتركيب معابر الرخام بين الغرف + عتبة خارجية أمام باب الشقة" },
                    { 231, 36, 5, "توريد وتركيب شبابيك الشقة بالكامل + شبابيك المطبخ والحمامات (UPVC) مع عمل مكان للشفاط" },
                    { 232, 37, 1, "وش سيلر مائي، عدد (4) سكينة معجون، وش بطانة، وعدد (2) وش تشطيب نهائي" },
                    { 233, 37, 2, "الدهانات المستخدمة جوتين قابلة للغسيل" },
                    { 234, 37, 3, "عدد (3) جانب قطيفة أو ورق حائط من ضمنهم غرفة 3D" },
                    { 235, 37, 4, "حجر لا يتعدى 15 متر أو بلاطات 3D" },
                    { 236, 37, 5, "ديكور إضافي على حسب اختيار العميل (بروفايل ليد – تجليد خشب – بديل الرخام – بديل الخشب) بحد أقصى 30 متر" },
                    { 237, 38, 1, "توريد وتركيب أعمال وحدات المطبخ (HPL أو ما يماثلها حسب اختيار العميل) بمفصلات مستوردة + الخلاطات وحلة الغسيل وعمل رخامة المطبخ" },
                    { 238, 38, 2, "توريد وتركيب غرفة الدريسينج روم بالكامل" },
                    { 239, 38, 3, "توريد وتركيب عفش الشقة بالكامل حسب اختيار العميل من المصنع الخاص بالشركة، وفقاً للرسم المتفق عليه وعدد الغرف" },
                    { 240, 38, 4, "توريد وتركيب التكييفات الخاصة بالوحدة بالكامل ماركة شارب أو ما يماثلها، قدرات 1.5 أو 3 حصان" },
                    { 241, 38, 5, "توريد وتركيب سخانات للوحدة بعدد الحمامات والمطابخ" },
                    { 242, 38, 6, "توريد وتركيب الستائر الخاصة بالوحدة بالكامل" },
                    { 243, 38, 7, "توريد وتركيب وحدات الإضاءة (نجف – أباليك) مع عمل مقايسة بالتكلفة وتقديمها للعميل" },
                    { 244, 38, 8, "توريد وتركيب السجاد الخاص بالوحدة من قبل معارض الشركة" },
                    { 245, 38, 9, "توريد وتركيب المراتب: عدد 2 سرير أطفال، وعدد 1 مرتبة كينج" },
                    { 246, 38, 10, "توريد وتركيب الشفاطات الخاصة بالحمامات والمطبخ حسب اختيار العميل ماركة شارب أو ما يماثلها" },
                    { 247, 38, 11, "توريد وتركيب المرايات الخاصة بالحمامات حسب اختيار العميل" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 33);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 34);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 35);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 36);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 37);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 38);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 39);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 40);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 41);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 42);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 43);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 44);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 45);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 46);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 47);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 48);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 49);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 50);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 51);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 52);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 53);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 54);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 55);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 56);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 57);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 58);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 59);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 60);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 61);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 62);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 63);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 64);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 65);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 66);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 67);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 68);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 69);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 70);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 71);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 72);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 73);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 74);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 75);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 76);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 77);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 78);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 79);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 80);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 81);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 82);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 83);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 84);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 85);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 86);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 87);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 88);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 89);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 90);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 91);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 92);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 93);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 94);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 95);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 96);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 97);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 98);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 99);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 100);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 101);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 102);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 103);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 104);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 105);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 106);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 107);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 108);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 109);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 110);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 111);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 112);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 113);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 114);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 115);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 116);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 117);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 118);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 119);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 120);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 121);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 122);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 123);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 124);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 125);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 126);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 127);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 128);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 129);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 130);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 131);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 132);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 133);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 134);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 135);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 136);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 137);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 138);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 139);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 140);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 141);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 142);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 143);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 144);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 145);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 146);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 147);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 148);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 149);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 150);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 151);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 152);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 153);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 154);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 155);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 156);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 157);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 158);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 159);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 160);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 161);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 162);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 163);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 164);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 165);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 166);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 167);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 168);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 169);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 170);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 171);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 172);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 173);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 174);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 175);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 176);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 177);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 178);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 179);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 180);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 181);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 182);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 183);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 184);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 185);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 186);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 187);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 188);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 189);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 190);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 191);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 192);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 193);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 194);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 195);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 196);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 197);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 198);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 199);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 200);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 201);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 202);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 203);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 204);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 205);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 206);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 207);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 208);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 209);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 210);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 211);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 212);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 213);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 214);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 215);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 216);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 217);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 218);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 219);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 220);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 221);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 222);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 223);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 224);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 225);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 226);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 227);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 228);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 229);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 230);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 231);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 232);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 233);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 234);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 235);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 236);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 237);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 238);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 239);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 240);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 241);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 242);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 243);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 244);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 245);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 246);

            migrationBuilder.DeleteData(
                table: "PackageFeatureItems",
                keyColumn: "Id",
                keyValue: 247);

            migrationBuilder.DeleteData(
                table: "PackageSections",
                keyColumn: "Id",
                keyValue: 7);

            migrationBuilder.DeleteData(
                table: "PackageSections",
                keyColumn: "Id",
                keyValue: 8);

            migrationBuilder.DeleteData(
                table: "PackageSections",
                keyColumn: "Id",
                keyValue: 9);

            migrationBuilder.DeleteData(
                table: "PackageSections",
                keyColumn: "Id",
                keyValue: 10);

            migrationBuilder.DeleteData(
                table: "PackageSections",
                keyColumn: "Id",
                keyValue: 11);

            migrationBuilder.DeleteData(
                table: "PackageSections",
                keyColumn: "Id",
                keyValue: 12);

            migrationBuilder.DeleteData(
                table: "PackageSections",
                keyColumn: "Id",
                keyValue: 13);

            migrationBuilder.DeleteData(
                table: "PackageSections",
                keyColumn: "Id",
                keyValue: 14);

            migrationBuilder.DeleteData(
                table: "PackageSections",
                keyColumn: "Id",
                keyValue: 15);

            migrationBuilder.DeleteData(
                table: "PackageSections",
                keyColumn: "Id",
                keyValue: 16);

            migrationBuilder.DeleteData(
                table: "PackageSections",
                keyColumn: "Id",
                keyValue: 17);

            migrationBuilder.DeleteData(
                table: "PackageSections",
                keyColumn: "Id",
                keyValue: 18);

            migrationBuilder.DeleteData(
                table: "PackageSections",
                keyColumn: "Id",
                keyValue: 19);

            migrationBuilder.DeleteData(
                table: "PackageSections",
                keyColumn: "Id",
                keyValue: 20);

            migrationBuilder.DeleteData(
                table: "PackageSections",
                keyColumn: "Id",
                keyValue: 21);

            migrationBuilder.DeleteData(
                table: "PackageSections",
                keyColumn: "Id",
                keyValue: 22);

            migrationBuilder.DeleteData(
                table: "PackageSections",
                keyColumn: "Id",
                keyValue: 23);

            migrationBuilder.DeleteData(
                table: "PackageSections",
                keyColumn: "Id",
                keyValue: 24);

            migrationBuilder.DeleteData(
                table: "PackageSections",
                keyColumn: "Id",
                keyValue: 25);

            migrationBuilder.DeleteData(
                table: "PackageSections",
                keyColumn: "Id",
                keyValue: 26);

            migrationBuilder.DeleteData(
                table: "PackageSections",
                keyColumn: "Id",
                keyValue: 27);

            migrationBuilder.DeleteData(
                table: "PackageSections",
                keyColumn: "Id",
                keyValue: 28);

            migrationBuilder.DeleteData(
                table: "PackageSections",
                keyColumn: "Id",
                keyValue: 29);

            migrationBuilder.DeleteData(
                table: "PackageSections",
                keyColumn: "Id",
                keyValue: 30);

            migrationBuilder.DeleteData(
                table: "PackageSections",
                keyColumn: "Id",
                keyValue: 31);

            migrationBuilder.DeleteData(
                table: "PackageSections",
                keyColumn: "Id",
                keyValue: 32);

            migrationBuilder.DeleteData(
                table: "PackageSections",
                keyColumn: "Id",
                keyValue: 33);

            migrationBuilder.DeleteData(
                table: "PackageSections",
                keyColumn: "Id",
                keyValue: 34);

            migrationBuilder.DeleteData(
                table: "PackageSections",
                keyColumn: "Id",
                keyValue: 35);

            migrationBuilder.DeleteData(
                table: "PackageSections",
                keyColumn: "Id",
                keyValue: 36);

            migrationBuilder.DeleteData(
                table: "PackageSections",
                keyColumn: "Id",
                keyValue: 37);

            migrationBuilder.DeleteData(
                table: "PackageSections",
                keyColumn: "Id",
                keyValue: 38);
        }
    }
}
