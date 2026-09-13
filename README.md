# 🏠 AqarCare | عقار كير

<div align="center">

![AqarCare Platform](https://img.shields.io/badge/AqarCare-Real%20Estate%20Platform-047857?style=for-the-badge&logo=homeadvisor&logoColor=white)
![.NET 8](https://img.shields.io/badge/.NET-8.0-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)
![React 18](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![MapLibre GL](https://img.shields.io/badge/MapLibre-GL-blue?style=for-the-badge&logo=maplibre&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?style=for-the-badge&logo=vercel&logoColor=white)

**منصة متكاملة للتسويق العقاري، إدارة الوحدات والأدوار، والخريطة التفاعلية في المحلة الكبرى**  
*A modern full-stack real estate platform featuring interactive mapping, multi-floor unit pricing, and comprehensive filtering.*

[🌐 Live Website](https://aqar-care.vercel.app) • [🗺 Interactive Map](https://aqar-care.vercel.app/map) • [⚙️ API Service](https://aqarcare.runasp.net) • [📚 Swagger](https://aqarcare.runasp.net/swagger)

</div>

---

## 📑 Table of Contents / جدول المحتويات
- [✨ Key Features / أبرز المميزات](#-key-features--أبرز-المميزات)
- [🗺 Interactive Map / الخريطة التفاعلية](#-interactive-map--الخريطة-التفاعلية)
- [🏢 Multi-Floor & Pricing System / نظام الأدوار والتسعير](#-multi-floor--pricing-system--نظام-الأدوار-والتسعير)
- [🔍 Advanced Filtering & Search / نظام التصفية والبحث المتقدم](#-advanced-filtering--search--نظام-التصفية-والبحث-المتقدم)
- [🛠 Tech Stack / التقنيات المستخدمة](#-tech-stack--التقنيات-المستخدمة)
- [🚀 Quick Start / التشغيل السريع](#-quick-start--التشغيل-السريع)
- [📡 API Documentation / توثيق واجهة البرمجة](#-api-documentation--توثيق-واجهة-البرمجة)
- [🏗 Architecture & Structure / هيكل المشروع](#-architecture--structure--هيكل-المشروع)
- [👨‍💻 Author / المطور](#-author--المطور)

---

## ✨ Key Features / أبرز المميزات

### 🌐 For Visitors & Buyers (المشترين والمستثمرين)
- **Detailed Property Cards:** Displays full address (street + district + city), finishing type, price per meter, and floor availability badges.
- **Synchronized Pricing:** Clear cash (`سعر الكاش`) and installment (`سعر التقسيط`) pricing across all property units with intelligent "Starts from" (`يبدأ من`) calculations.
- **Interactive Street Map:** Real-time MapLibre GL map centered on El-Mahalla El-Kubra (Mansheyat El-Bakry & El-Sha'biya) with custom pins, finishing badges, and desktop/mobile card previews.
- **Multi-Unit Floors:** Comprehensive floor breakdown showing unit sizes, floor number, units per floor, and individual unit pricing.
- **Utility Meters & Amenities:** Clear status for electricity, water, and gas meters, plus elevator and under-construction flags.
- **Finishing Packages:** Detailed packages for interior and architectural finishing.

### 🛡 Admin Control Panel (لوحة التحكم الإدارية)
- **Protected Management:** Secure API key-based authentication (`/admin`).
- **Property CRUD:** Create, update, publish, and delete properties with full floor/unit configurations.
- **Map Coordinate Picker:** Visual map picker modal to drop pins and assign exact spatial coordinates to properties.
- **Media Upload:** Cloudinary integration for property image galleries.

---

## 🗺 Interactive Map / الخريطة التفاعلية

The platform features a smooth WebGL/MapLibre map (`/map`) tailored for local real estate:
- **Free OpenStreetMap vector/raster tiles** (No watermark, no expensive proprietary API locks).
- **Custom spatial projections** mapping city blocks and property coordinates.
- **Interactive Marker Overlays:** Color-coded status dots (`متاح`, `مباع`) and finishing badges (`عظم`, `نص تشطيب`, `تشطيب كامل`).
- **Smooth Navigation:** Automatic camera panning and elevation on desktop, with responsive slide-up bottom sheets on mobile.
- **Map Filters:** Instant filtering by listing type, property type, status, and finishing status.

---

## 🏢 Multi-Floor & Pricing System / نظام الأدوار والتسعير

Designed for buildings and towers with varying floor prices and configurations:
- **Per-Floor Unit Breakdown:** Shows available apartments on each floor (e.g. `الدور 3: شقة 1 (140 م²)`).
- **Independent Cash & Installment:** Cash and installment prices calculated per unit and per floor.
- **Intelligent Price Per Meter (`سعر المتر`):** Dynamically calculated across all available floors, displaying `يبدأ من X ج/م²` when floor rates vary.
- **Apartments Per Floor (`شقق بالدور`):** Distinguishes building layout specifications from current availability.

---

## 🔍 Advanced Filtering & Search / نظام التصفية والبحث المتقدم

The `/properties` page includes a multi-criteria filter system:
1. **نوع التشطيب (Finishing Status):** بدون تشطيب (عظم)، نصف تشطيب، تشطيب كامل، لوكس، سوبر لوكس، هاي لوكس.
2. **الحي والمنطقة (District):** الشعبية، منشية البكري، الرجبي، شكري القوتلي، الجمهورية، إلخ.
3. **بحث سريع فوري (Instant Search):** بالاسم، الشارع، أو الحي.
4. **نطاقات الأسعار والمساحات (Price & Area):** الحد الأدنى والأقصى للسعر وللمساحة (م²).
5. **المواصفات السريعة (One-Click Chips):**
   - 💳 متاح تقسيط
   - 🛗 متوفر أسانسير
   - 🏗️ تحت الإنشاء / 🔑 جاهز للاستلام
   - 💧 عداد مياه / ⚡ عداد كهرباء / 🔥 عداد غاز
6. **الترتيب (Sorting):** الأحدث، السعر (تصاعدي/تنازلي)، المساحة (تصاعدي/تنازلي).
7. **عدد الغرف والحمامات.**

---

## 🛠 Tech Stack / التقنيات المستخدمة

### Backend
- **Framework:** ASP.NET Core 8.0 Web API
- **ORM:** Entity Framework Core 8.0 with SQL Server
- **Authentication:** Custom API Key Middleware
- **Media Storage:** Cloudinary .NET SDK
- **Hosting:** RunASP (`https://aqarcare.runasp.net`)

### Frontend
- **Library:** React 18.3 + TypeScript
- **Bundler:** Vite
- **Mapping:** MapLibre GL & custom GIS projections
- **Icons:** Lucide React
- **Hosting:** Vercel (`https://aqar-care.vercel.app`)

---

## 🚀 Quick Start / التشغيل السريع

### Prerequisites
- [.NET 8.0 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 18+](https://nodejs.org/) & npm
- SQL Server (LocalDB or Remote SQL Server)

### 1. Backend Setup
```bash
# Navigate to backend directory
cd AqarCare

# Restore and update database
dotnet restore
dotnet ef database update

# Run API service
dotnet run
```
The API starts at `http://localhost:5041` (Swagger docs at `/swagger`).

### 2. Frontend Setup
```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Start development server
npm run dev
```
The web app opens at `http://localhost:5173`.

---

## 📡 API Documentation / توثيق واجهة البرمجة

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/properties` | Get published properties with filtering & pagination | Public |
| `GET` | `/api/properties/{id}` | Get property detail with floors and media | Public |
| `GET` | `/api/maps/{citySlug}` | Get interactive city map data, streets, and properties | Public |
| `GET` | `/api/finishing-packages` | List finishing packages | Public |
| `GET` | `/api/admin/properties` | List all properties (including unpublished) | `X-Api-Key` |
| `POST` | `/api/admin/properties` | Create new property listing | `X-Api-Key` |
| `PUT` | `/api/admin/properties/{id}` | Update existing property listing | `X-Api-Key` |
| `DELETE` | `/api/admin/properties/{id}` | Delete property listing | `X-Api-Key` |
| `POST` | `/api/admin/media/upload` | Upload images/media to Cloudinary | `X-Api-Key` |

---

## 🏗 Architecture & Structure / هيكل المشروع

```
AqarCare/
├── AqarCare/                      # ASP.NET Core 8 Web API
│   ├── Controllers/               # REST API Controllers (Properties, Maps, Admin)
│   ├── Data/
│   │   └── Entities/              # EF Core Entities (PropertyUnit, PropertyFloor, MapLocation)
│   ├── DTOs/                      # Data Transfer Objects & Query Contracts
│   ├── Middleware/                # Security & API Key Validation
│   └── Services/                  # Business Logic (PropertyService, MapService)
├── frontend/                      # React 18 + TypeScript + Vite
│   ├── src/
│   │   ├── api/                   # API Client Services
│   │   ├── components/            # Reusable UI Components
│   │   │   ├── map/               # MapGLView, MapFiltersPanel, Popups
│   │   │   └── admin/             # MapPickerModal, Admin Controls
│   │   ├── pages/                 # Route Pages (HomePage, PropertiesPage, MapPage, PropertyDetailPage)
│   │   ├── types/                 # TypeScript Interfaces & Enums
│   │   └── utils/                 # Formatters & Math Utilities
│   └── public/                    # Static Assets
└── README.md
```

---

## 👨‍💻 Author / المطور

**Abdallah Mohamed**
- GitHub: [@Abdallah-Muhamed](https://github.com/Abdallah-Muhamed)
- Repository: [Abdallah-Muhamed/AqarCare](https://github.com/Abdallah-Muhamed/AqarCare)

---

<div align="center">

**Built with ❤️ for modern real estate management**

</div>
