# 🏠 AqarCare | عقار كير

<div align="center">

![AqarCare Platform](https://img.shields.io/badge/AqarCare-Real%20Estate%20Platform-047857?style=for-the-badge&logo=homeadvisor&logoColor=white)
![AI Broker](https://img.shields.io/badge/AI%20Broker-Groq%20Cloud-f55036?style=for-the-badge&logo=openai&logoColor=white)
![.NET 8](https://img.shields.io/badge/.NET-8.0-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)
![React 18](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![High Performance](https://img.shields.io/badge/Performance-In--Memory%20Cache%20%26%20Brotli-059669?style=for-the-badge&logo=speedtest&logoColor=white)
![SEO Ready](https://img.shields.io/badge/SEO-Google%20Indexed-22c55e?style=for-the-badge&logo=google&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?style=for-the-badge&logo=vercel&logoColor=white)

**منصة متكاملة للتسويق العقاري، إدارة الأبراج والمنازل المستقلة، والمساعد العقاري الذكي بالذكاء الاصطناعي في المحلة الكبرى**  
*A modern full-stack real estate platform featuring an Egyptian AI Sales Broker, interactive mapping, multi-floor tower pricing, dedicated house breakdown system, and high-performance in-memory caching.*

[🌐 Live Website](https://aqar-care.vercel.app) • [💬 AI Broker](https://aqar-care.vercel.app/properties) • [🗺 Interactive Map](https://aqar-care.vercel.app/map) • [⚙️ API Service](https://aqarcare.runasp.net) • [📚 Swagger](https://aqarcare.runasp.net/swagger)

</div>

---

## 📑 Table of Contents / جدول المحتويات
- [✨ Key Features / أبرز المميزات](#-key-features--أبرز-المميزات)
- [🏠 House & Multi-Floor Breakdown System / نظام المنازل والأدوار](#-house--multi-floor-breakdown-system--نظام-المنازل-والأدوار)
- [🤖 AI Sales Broker / المساعد العقاري الذكي](#-ai-sales-broker--المساعد-العقاري-الذكي)
- [⚡ Performance & Scalability Architecture / معمارية الأداء والسرعة](#-performance--scalability-architecture--معمارية-الأداء-والسرعة)
- [🗺 Interactive Map / الخريطة التفاعلية](#-interactive-map--الخريطة-التفاعلية)
- [🔍 Smart Quick Filtering / نظام التصفية السريعة والبحث](#-smart-quick-filtering--نظام-التصفية-السريعة-والبحث)
- [🌐 Search Engine Optimization (SEO) / تهيئة محركات البحث](#-search-engine-optimization-seo--تهيئة-محركات-البحث)
- [🛠 Tech Stack / التقنيات المستخدمة](#-tech-stack--التقنيات-المستخدمة)
- [🚀 Quick Start / التشغيل السريع](#-quick-start--التشغيل-السريع)
- [📡 API Documentation / توثيق واجهة البرمجة](#-api-documentation--توثيق-واجهة-البرمجة)
- [🏗 Architecture & Structure / هيكل المشروع](#-architecture--structure--هيكل-المشروع)
- [👨‍💻 Author / المطور](#-author--المطور)

---

## ✨ Key Features / أبرز المميزات

### 🌐 For Visitors & Buyers (المشترين والمستثمرين)
- **🤖 مستشارك العقاري الذكي (AI Broker):** مساعد بيعي وتفاوضي بالذكاء الاصطناعي مدعوم بنماذج Groq Cloud الفائقة السرعة، يفهم احتياجات المشتري باللهجة المصرية، يقترح البدائل المناسبة من المخزون الفعلي، ويقنع العميل بحجز موعد معاينة ميدانية عبر واتساب.
- **Detailed Property Cards:** بطاقات عقارية شاملة توضح الحي والشارع بالتفصيل، نوع التشطيب، سعر المتر، وحالة توفر الأدوار، مع شارات مخصصة للمنازل والأبراج.
- **Synchronized Pricing:** أسعار كاش وتقسيط دقيقة ومحسوبة تلقائياً مع تنبيه "يبدأ من" حسب تنوع الأدوار.
- **Interactive Street Map:** خريطة تفاعلية لمدينة المحلة الكبرى (منشية البكري والشعبية) تدعم التكبير والانتقال السلس (Smooth FlyTo).
- **Multi-Unit Floors & House Specs:** تفصيل كامل لكل دور أو منزل مع بيان عدد الشقق المتشطبة والنص تشطيب والعظم.
- **Utility Meters & Amenities:** عرض حالة عدادات المرافق (كهرباء، مياه، غاز)، الأسانسير، وحالة الإنشاء (تحت الإنشاء / جاهز للاستلام).
- **Mobile-First UX:** تصميم متجاوب فائق السلاسة على الهواتف بتقنية العرض التراكمي (Progressive Rendering) لتجربة تصفح سريعة بدون تقطيع.

### 🛡 Admin Control Panel (لوحة التحكم الإدارية)
- **Protected Management:** لوحة تحكم محمية بمفتاح API سري (`/admin`).
- **Property & Floors CRUD:** إدارة كاملة للعقارات، الأدوار، والأسعار دون قيود على عدد النتائج (`pageSize=10000`).
- **Dedicated House Entry Model:** واجهة مبسطة ومخصصة للمنازل والبيوت المستقلة تتيح إدخال مواصفات وتوزيع تشطيب الشقق بنقرة واحدة وإلغاء التعقيدات غير اللازمة.
- **Floor-Level Sold Marking:** تمييز أي دور محدد كمباع مع تسجيل **سعر البيع الفعلي (SoldPrice)** لحساب الإيرادات بدقة.
- **Analytics Summary Cards:** إحصائيات فورية لإجمالي الوحدات، الشقق المتاحة والمباعة، وإجمالي المبيعات المحققة بالجنيه.
- **Visual Map Coordinate Picker:** نافذة لاختيار وتحديد موقع العقار على الخريطة الجغرافية بدقة.
- **Cloudinary Media Upload:** رفع وإدارة معارض الصور العقارية سحابياً مع ضغط وتحويل تلقائي للجيل الحديث (WebP/AVIF).

---

## 🏠 House & Multi-Floor Breakdown System / نظام المنازل والأدوار

تم بناء نظام دقيق ومخصص يفرق بين **الشقق والأبراج السكنية** وبين **المنازل والبيوت المستقلة**:

### 1. نظام المنازل والبيوت المستقلة (House System):
- يباع البيت كوحدة واحدة بسعر إجمالي محدد.
- إلغاء مفهوم "حالة التشطيب العامة" للمنزل.
- إدخال مواصفات تقسيم شقق البيت عبر 5 معايير أساسية تظهر في لوحة الإدارة وكارت العقار وصفحة التفاصيل:
  1. 🏢 **عدد الأدوار** (`NumberOfFloors`)
  2. 🚪 **كم شقة في الدور** (`ApartmentsPerFloor`)
  3. ✨ **عدد الشقق المتشطبة** (`FinishedApartments`)
  4. 🧱 **عدد الشقق النص تشطيب** (`SemiFinishedApartments`)
  5. 🏗️ **عدد الشقق العظم** (`CoreShellApartments`)

### 2. نظام الأبراج السكنية والشقق (Multi-Floor Towers):
- تفصيل مستقل لكل دور بمساحته، سعر المتر، وسعره الإجمالي ونظام التقسيط.
- إمكانية تحديد أدوار معينة كـ «مباعة» مع إبقاء بقية أدوار البرج متاحة للبيع.
- احتساب سعر المتر وسعر الكاش الأدنى تلقائياً لعرض تنبيه "يبدأ من".

---

## 🤖 AI Sales Broker / المساعد العقاري الذكي

تم تزويد المنصة بمساعد مبيعات عقاري محترف (`مستشارك العقاري`) يتميز بالتالي:
1. **شخصية بائع مصري خبير:** يتحدث بأسلوب لبق، مقنع، ومرحب باللهجة المصرية الراقية (`"أهلاً بحضرتك يا فندم"`, `"عندي ليك فرصة ممتازة"`).
2. **استدعاء دوال البحث المباشر (Agentic Function Calling):** يبحث مباشرة في قاعدة بيانات العقارات بدقة دون استهلاك توكنز ضخمة.
3. **ترشيح البدائل الذكية:** إذا لم يتوفر طلب العميل بدقة، يقترح بذكاء أقرب الخيارات البديلة ويبرز قيمتها الاستثمارية.
4. **كروت عقارات تفاعلية داخل الشات:** عند ترشيح أي عقار، تظهر بطاقة مصغرة تشمل الصورة والسعر والمساحة مع زر انتقال مباشر وزر حجز معاينة عبر واتساب.
5. **Multi-Key Failover & Load Balancing:** دعم تدوير مفاتيح Groq API المتعددة لضمان كوتا يومية ضخمة واستمرارية خدمة 24/7 دون توقف (Zero Downtime).

---

## ⚡ Performance & Scalability Architecture / معمارية الأداء والسرعة

تمت ترقية معمارية النظام ليتحمل **أكثر من 20,000 عقار و 1,000 مستخدم متزامن (200,000+ زائر يومياً)** دون رفع تكاليف الاستضافة:

- **In-Memory Caching (`IMemoryCache`):** تخزين نتائج الاستعلامات في الذاكرة السريعة للسيرفر لمدة 60 ثانية، مما خفّض زمن استجابة الـ API إلى **أقل من 3 مللي ثانية**.
- **Atomic Cache Invalidation:** تفريغ وتحديث الكاش لحظياً وذرياً بمجرد قيام الأدمن بأي عملية (إضافة، تعديل، حذف، أو رفع وسائط).
- **Response Compression (Brotli & Gzip):** ضغط استجابات الـ JSON تلقائياً بنسبة تصل إلى **80%** لتوفير الباندويث وتسريع التحميل على شبكات الهاتف.
- **EF Core Split Queries (`.AsSplitQuery()`):** منع التضخم الديكارتي (Cartesian Product) عند جلب الأدوار والميديا، مما يقلل استهلاك الذاكرة بشكل ملحوظ.
- **Progressive Infinite Rendering:** تقنية عرض تراكمي ذكية في الواجهة ترسم أول 24 عقاراً وتزيد تدريجياً عبر `IntersectionObserver`، للحفاظ على استقرار الـ DOM وسرعة 60 FPS على هواتف الموبايل.
- **Cloudinary On-The-Fly Optimization:** تحويل الصور تلقائياً لصيغ WebP/AVIF الخفيفة (`f_auto,q_auto,w_600`) لتصغير حجم الصورة من 1MB إلى **25-35KB**.

---

## 🗺 Interactive Map / الخريطة التفاعلية

- **OpenStreetMap & MapLibre GL:** خرائط خفيفة وسريعة بدون قيود مادية أو علامات مائية.
- **Smooth Cinematic Navigation:** انتقال ناعم بزوايا انسيابية ثلاثية الأبعاد (Smooth Camera FlyTo) عند فتح موقع العقار من صفحته.
- **Marker Overlays:** نقاط جغرافية ملوّنة حسب الحالة (متاح / مباع) ووسوم لنوع العقار ومستوى البناء.
- **Responsive Drawer:** قائمة سحب سفلية سلسة على شاشات الموبايل لتصفح العقارات المحددة على الخريطة.

---

## 🔍 Smart Quick Filtering / نظام التصفية السريعة والبحث

شريط اقتراحات تصفية سريعة مرن وذكي يظهر أعلى صفحة العقارات بأسلوب التفاف متعدد الأسطر (Multi-Row Wrap) دون أن تختفي أي عناصر:
- `🏠 منازل` • `🏢 شقق سكنية` • `🏪 محلات تجارية` • `🌿 أراضي`
- `✨ متشطب` • `🧱 عظم (طوب أحمر)` • `💳 متاح تقسيط`
- `🪜 دور منخفض (أقل من الثامن)` (خاص بالشقق فقط من الأرضي حتى السابع)
- `💰 أقل من 1.5 مليون` • `🏗️ تحت الإنشاء` • `🔑 استلام فوري` • `🛗 يوجد أسانسير`

---

## 🌐 Search Engine Optimization (SEO) / تهيئة محركات البحث

- **Google Search Console Verified:** دعم ملف التحقق ووسوم التحقق المعتمدة.
- **Dynamic Meta Tags (`seo.ts`):** توليد عناوين وأوصاف وروابط لكل صفحة وعقار بشكل منفصل.
- **Social Sharing Previews:** وسوم Open Graph و Twitter Cards لإظهار المعاينة بالصورة والعنوان عند إرسال الروابط على واتساب وفيسبوك.
- **Robots.txt & Sitemap.xml:** أرشفة كاملة لكافة صفحات العقارات والخرائط مع حماية مسار الإدارة.
- **Schema.org Structured Data:** بيانات منظمة بصيغة JSON-LD لنشاط وكالة عقارية معتمد لدى روبوتات جوجل.

---

## 🛠 Tech Stack / التقنيات المستخدمة

### Backend
- **Framework:** ASP.NET Core 8.0 Web API (.NET 8)
- **AI Engine:** Groq Cloud API (`openai/gpt-oss-120b` with Multi-Key Rotation & Function Calling)
- **Database & ORM:** SQL Server + Entity Framework Core 8.0
- **Caching & Compression:** `IMemoryCache` + Microsoft Response Compression (Brotli/Gzip)
- **Authentication:** Custom API Key Middleware (`X-Api-Key`)
- **Media CDN:** Cloudinary .NET SDK
- **Deployment:** RunASP (`https://aqarcare.runasp.net`)

### Frontend
- **Framework:** React 18.3 + TypeScript
- **Build Tool:** Vite 5.4
- **Performance:** Progressive Virtual Rendering with `IntersectionObserver`
- **Styling:** Modern CSS with custom theme variables & RTL support
- **Mapping:** MapLibre GL
- **Icons:** Lucide React
- **Deployment:** Vercel (`https://aqar-care.vercel.app`)

---

## 🚀 Quick Start / التشغيل السريع

### Prerequisites
- [.NET 8.0 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 18+](https://nodejs.org/) & npm
- SQL Server

### 1. Backend Setup
```bash
cd AqarCare

# Copy template to appsettings.json and fill in your connection string and keys
cp appsettings.Template.json appsettings.json

# Restore dependencies and apply migrations
dotnet restore
dotnet ef database update

# Run the API server
dotnet run
```
API runs at `http://localhost:5041` (Swagger docs at `/swagger`).

### 2. Frontend Setup
```bash
cd ../frontend

# Install dependencies
npm install

# Start development server
npm run dev
```
Web app runs at `http://localhost:5173`.

---

## 📡 API Documentation / توثيق واجهة البرمجة

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/ai/broker` | Chat with the Egyptian AI Sales Broker (Groq LLM) | Public |
| `GET` | `/api/properties` | Get published properties (Cached in-memory, supports up to 10,000 units) | Public |
| `GET` | `/api/properties/{id}` | Get property details with floors and media gallery | Public |
| `GET` | `/api/maps/{citySlug}` | Get interactive map data, streets, and properties | Public |
| `GET` | `/api/finishing-packages` | List architectural finishing packages | Public |
| `GET` | `/api/admin/properties` | List all properties (including unpublished listings, up to 10,000) | `X-Api-Key` |
| `POST` | `/api/admin/properties` | Create new property listing with floors or house breakdown | `X-Api-Key` |
| `PUT` | `/api/admin/properties/{id}` | Update existing property listing | `X-Api-Key` |
| `DELETE` | `/api/admin/properties/{id}` | Delete property listing | `X-Api-Key` |
| `POST` | `/api/admin/media/upload` | Upload photos and media to Cloudinary CDN | `X-Api-Key` |

---

## 🏗 Architecture & Structure / هيكل المشروع

```
AqarCare/
├── AqarCare/                      # ASP.NET Core 8 Web API
│   ├── Controllers/               # REST Controllers (Properties, AIBroker, Maps, Admin)
│   ├── Data/                      # EF Core DbContext & Entities (PropertyUnit, PropertyFloor)
│   ├── DTOs/                      # Data Transfer Objects & Contracts
│   ├── Migrations/                # EF Core Schema Migrations
│   ├── Middleware/                # ApiKeyAuthMiddleware
│   ├── Services/                  # Services (PropertyService, AIBrokerService, MapService)
│   └── appsettings.Template.json  # Sanitized config template for version control
├── frontend/                      # React 18 + TypeScript + Vite
│   ├── src/
│   │   ├── api/                   # API Client Services
│   │   ├── components/            # Reusable UI Components
│   │   │   ├── chat/              # ChatBrokerWidget & styles
│   │   │   ├── map/               # MapLibreGL Views & Filter Panels
│   │   │   └── admin/             # Property Forms, Duplication, Map Picker
│   │   ├── pages/                 # Pages (Home, Properties, Detail, Map, Admin)
│   │   ├── types/                 # TypeScript Interfaces & Models
│   │   └── utils/                 # SEO Helpers & Formatters
│   └── public/                    # robots.txt, sitemap.xml, site logos
└── README.md
```

---

## 👨‍💻 Author / المطور

**Abdallah Mohamed**
- GitHub: [@Abdallah-Muhamed](https://github.com/Abdallah-Muhamed)
- Repository: [Abdallah-Muhamed/AqarCare](https://github.com/Abdallah-Muhamed/AqarCare)

---

<div align="center">

**Built with ❤️ for modern real estate management in Egypt**

</div>
