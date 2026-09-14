# 🏠 AqarCare | عقار كير

<div align="center">

![AqarCare Platform](https://img.shields.io/badge/AqarCare-Real%20Estate%20Platform-047857?style=for-the-badge&logo=homeadvisor&logoColor=white)
![AI Broker](https://img.shields.io/badge/AI%20Broker-Groq%20Cloud-f55036?style=for-the-badge&logo=openai&logoColor=white)
![.NET 8](https://img.shields.io/badge/.NET-8.0-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)
![React 18](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![SEO Ready](https://img.shields.io/badge/SEO-Google%20Indexed-22c55e?style=for-the-badge&logo=google&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?style=for-the-badge&logo=vercel&logoColor=white)

**منصة متكاملة للتسويق العقاري، إدارة الوحدات والأدوار، والمساعد العقاري الذكي بالذكاء الاصطناعي في المحلة الكبرى**  
*A modern full-stack real estate platform featuring an Egyptian AI Sales Broker, interactive mapping, multi-floor unit pricing, and comprehensive search.*

[🌐 Live Website](https://aqar-care.vercel.app) • [💬 AI Broker](https://aqar-care.vercel.app/properties) • [🗺 Interactive Map](https://aqar-care.vercel.app/map) • [⚙️ API Service](https://aqarcare.runasp.net) • [📚 Swagger](https://aqarcare.runasp.net/swagger)

</div>

---

## 📑 Table of Contents / جدول المحتويات
- [✨ Key Features / أبرز المميزات](#-key-features--أبرز-المميزات)
- [🤖 AI Sales Broker / المساعد العقاري الذكي](#-ai-sales-broker--المساعد-العقاري-الذكي)
- [🗺 Interactive Map / الخريطة التفاعلية](#-interactive-map--الخريطة-التفاعلية)
- [🏢 Multi-Floor & Pricing System / نظام الأدوار والتسعير](#-multi-floor--pricing-system--نظام-الأدوار-والتسعير)
- [🔍 Advanced Filtering & Search / نظام التصفية والبحث المتقدم](#-advanced-filtering--search--نظام-التصفية-والبحث-المتقدم)
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
- **Detailed Property Cards:** بطاقات عقارية شاملة توضح الحي والشارع بالتفصيل، نوع التشطيب، سعر المتر، وحالة توفر الأدوار.
- **Synchronized Pricing:** أسعار كاش وتقسيط دقيقة ومحسوبة تلقائياً مع تنبيه "يبدأ من" حسب تنوع الأدوار.
- **Interactive Street Map:** خريطة تفاعلية لمدينة المحلة الكبرى (منشية البكري والشعبية) تدعم التكبير والانتقال السلس (Smooth FlyTo).
- **Multi-Unit Floors:** تفصيل كامل لكل دور مع مساحته، حالته (متاح / مباع)، وسعره المستقل.
- **Utility Meters & Amenities:** عرض حالة عدادات المرافق (كهرباء، مياه، غاز)، الأسانسير، وحالة الإنشاء (تحت الإنشاء / جاهز للاستلام).
- **Mobile-First UX:** تصميم متجاوب فائق السلاسة على الهواتف مع شريط سفلي ثابت لحجز المعاينة والتواصل دون تداخل.

### 🛡 Admin Control Panel (لوحة التحكم الإدارية)
- **Protected Management:** لوحة تحكم محمية بمفتاح API سري (`/admin`).
- **Property & Floors CRUD:** إدارة كاملة للعقارات، الأدوار، والأسعار.
- **Floor-Level Sold Marking:** تمييز أي دور محدد كمباع مع تسجيل **سعر البيع الفعلي (SoldPrice)** لحساب الإيرادات بدقة.
- **📋 تكرار بيانات الدور السابق:** زر لنسخ مواصفات الدور السابق بضغطة واحدة لتسريع إدخال الأبراج متعددة الأدوار.
- **Analytics Summary Cards:** إحصائيات فورية لإجمالي الوحدات، الشقق المتاحة والمباعة، وإجمالي المبيعات المحققة بالجنيه.
- **Visual Map Coordinate Picker:** نافذة لاختيار وتحديد موقع العقار على الخريطة الجغرافية بدقة.
- **Cloudinary Media Upload:** رفع وإدارة معارض الصور العقارية سحابياً.

---

## 🤖 AI Sales Broker / المساعد العقاري الذكي

تم تزويد المنصة بمساعد مبيعات عقاري محترف (`مستشارك العقاري`) يتميز بالتالي:
1. **شخصية بائع مصري خبير:** يتحدث بأسلوب لبق، مقنع، ومرحب باللهجة المصرية الراقية (`"أهلاً بحضرتك يا فندم"`, `"عندي ليك فرصة ممتازة"`).
2. **ربط مباشر بقاعدة البيانات الحية:** لا يهلوس ولا يخترع أسعاراً، بل يستند حصرياً إلى العقارات المتاحة والمنشورة في النظام.
3. **ترشيح البدائل الذكية:** إذا لم يتوفر طلب العميل بدقة، يقترح بذكاء أقرب الخيارات البديلة ويبرز قيمتها الاستثمارية.
4. **كروت عقارات تفاعلية داخل الشات:** عند ترشيح أي عقار، تظهر بطاقة مصغرة تشمل الصورة والسعر والمساحة مع زر انتقال مباشر وزر حجز معاينة عبر واتساب.
5. **Multi-Key Failover & Load Balancing:** دعم تدوير مفاتيح Groq API المتعددة لضمان كوتا يومية ضخمة واستمرارية خدمة 24/7 دون توقف (Zero Downtime).

---

## 🗺 Interactive Map / الخريطة التفاعلية

- **OpenStreetMap & MapLibre GL:** خرائط خفيفة وسريعة بدون قيود مادية أو علامات مائية.
- **Smooth Cinematic Navigation:** انتقال ناعم بزوايا انسيابية ثلاثية الأبعاد (Smooth Camera FlyTo) عند فتح موقع العقار من صفحته.
- **Marker Overlays:** نقاط جغرافية ملوّنة حسب الحالة (متاح / مباع) ووسوم لنوع التشطيب ومستوى البناء.
- **Responsive Drawer:** قائمة سحب سفلية سلسة على شاشات الموبايل لتصفح العقارات المحددة على الخريطة.

---

## 🏢 Multi-Floor & Pricing System / نظام الأدوار والتسعير

- **تفصيل الأدوار المستقل:** إمكانية تخصيص كل دور بمساحته وسعر المتر وسعره الإجمالي ونظام التقسيط.
- **تتبع البيع بالدور:** خيار تحديد أدوار معينة كـ «مباعة» مع إبقاء بقية أدوار البرج متاحة للبيع.
- **سعر المتر الذكي:** احتساب سعر المتر بناءً على الأدوار المتاحة وعرض أقل سعر متاح كبداية.
- **عدد الشقق بالدور (`ApartmentsPerFloor`):** توثيق تصميم البرج والخصوصية لكل طابق.

---

## 🔍 Advanced Filtering & Search / نظام التصفية والبحث المتقدم

- **شرائح الميزانية بنقرة واحدة (Quick Budget Chips):** (أقل من 1.5 مليون، 1.5 - 2.5 مليون، 2.5 - 3.5 مليون، أكثر من 3.5 مليون).
- **نوع التشطيب:** بدون تشطيب (عظم)، نصف تشطيب، لوكس، سوبر لوكس، هاي لوكس.
- **المناطق والأحياء:** الشعبية، منشية البكري، الرجبي، الجمهورية، إلخ.
- **زر مسح الفلاتر السريع:** زر فوري في الهيدر لإلغاء التصفية والعودة لكافة النتائج بنقرة واحدة.
- **فلاتر المرافق:** أسانسير، تقسيط، تحت الإنشاء، عدادات المياه والكهرباء والغاز.

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
- **Framework:** ASP.NET Core 8.0 Web API
- **AI Engine:** Groq Cloud API (`openai/gpt-oss-120b` with Multi-Key Rotation)
- **Database & ORM:** SQL Server + Entity Framework Core 8.0
- **Authentication:** Custom API Key Middleware
- **Media CDN:** Cloudinary .NET SDK
- **Deployment:** RunASP (`https://aqarcare.runasp.net`)

### Frontend
- **Framework:** React 18.3 + TypeScript
- **Build Tool:** Vite 5.4
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
| `GET` | `/api/properties` | Get published properties with filtering & pagination | Public |
| `GET` | `/api/properties/{id}` | Get property details with floors and media gallery | Public |
| `GET` | `/api/maps/{citySlug}` | Get interactive map data, streets, and properties | Public |
| `GET` | `/api/finishing-packages` | List architectural finishing packages | Public |
| `GET` | `/api/admin/properties` | List all properties (including unpublished listings) | `X-Api-Key` |
| `POST` | `/api/admin/properties` | Create new property listing with floors | `X-Api-Key` |
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
