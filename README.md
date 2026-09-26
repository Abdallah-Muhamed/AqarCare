# 🏢 AqarCare (عقار كير) – Modern Real Estate Platform

[![.NET 8](https://img.shields.io/badge/.NET-8.0-512BD4?style=flat&logo=dotnet&logoColor=white)](https://dotnet.microsoft.com/en-us/download/dotnet/8.0)
[![React 18](https://img.shields.io/badge/React-18.3-61DAFB?style=flat&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript 5](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![MapLibre GL](https://img.shields.io/badge/MapLibre-GL-3887BE?style=flat&logo=maplibre&logoColor=white)](https://maplibre.org/)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?style=flat&logo=vercel)](https://aqar-care.vercel.app)

> **AqarCare (عقار كير)** is a full-stack, enterprise-grade real estate platform crafted specifically for the Egyptian market (focusing on El Mahalla El Kubra and Gharbia Governorate). Built with an **ASP.NET Core 8 Web API** and a high-performance **React 18 / TypeScript / Vite** frontend.

🌐 **Live Demo:** [https://aqar-care.vercel.app](https://aqar-care.vercel.app)

---

## 🌟 Highlights & Key Features

### 🔍 Unified Smart Search Experience
- **PropertyFinder & Bayut-Inspired UX:** Identical search bar across both Homepage and Properties catalog (`/properties`).
- **Dynamic Street & Landmark Autocomplete:** Aggregates registered districts, addresses, and landmarks from live properties alongside curated Mahalla neighborhoods.
- **Fuzzy Arabic Search (`fuzzyArabicMatch`):** Tolerates common spelling variations (أ/إ/ا، ة/ه، ى/ي) and finds streets and properties even with partial words.
- **Full Two-Way URL Sync:** Real-time synchronization between search parameters, URL query strings, and instant client-side property filtering.
- **Quick Budget & Feature Chips:** 1-click filters for price thresholds, delivery status (Immediate / Under Construction), low floor preference, and elevator availability.

### 🗺️ Interactive Map (MapLibre GL)
- **Fluid Vector Mapping:** Georeferenced coordinates with custom camera fly-to animations and multi-zoom level precision.
- **Type-Specific Markers & Labels:**
  - **Land (`أرض`):** Custom SVG `LandPlot` vector marker with floating `أرض` pill.
  - **Houses (`منزل`):** Distinctive residential building icon with floating `منزل` pill.
  - **Commercial Shops (`محل`):** Storefront icon with floating `محل` pill.
  - **Apartments (`شقة`):** Classic building pin with live finishing badges (`عظم` / `نص` / `تشطيب`).
- **Responsive Overlays:** Interactive rich popups on desktop and smooth bottom sliding drawers on mobile devices.

### 🏘️ Domain-Specific Property Modeling
- **Apartments & Towers:** Granular floor-by-floor specifications, individual floor pricing (Cash & Installment), bedroom/bathroom counts, and elevator / utility meter status.
- **Houses & Multi-Story Buildings:** Multi-unit breakdown (finished, semi-finished, core-shell apartments, ground floor shops) with price per square meter hidden for clarity.
- **Land Parcels:** Detailed frontage length, street width, and official building permit verification.
- **Commercial Units:** High-visibility retail and office listings with flexible financing options.

### 🎨 Finishing Packages & Cost Estimator
- Turnkey finishing packages (Economy, Modern, Luxury, Ultra Lux) with price-per-square-meter calculations and itemized work scopes.

### ⚡ Performance & Mobile-First UX
- **Zero Layout Shifts:** High-quality architectural SVG and WebP fallback placeholders preventing broken image boxes.
- **Client-Side Instant Filtering:** Sub-millisecond response times across thousands of units with in-memory caching.
- **1-Click WhatsApp Lead Generation:** Pre-formatted contextual inquiry messages containing unit ID, title, and price.

---

## 🏗️ Architecture & Repository Structure

```
AqarCare/
├── AqarCare/                    # ASP.NET Core 8 Web API
│   ├── Controllers/            # API Endpoints (Properties, Maps, Media, Admin)
│   ├── Data/                   # EF Core AppDbContext & Database Entities
│   ├── Models/                 # Domain Entities (Property, Floor, Media, CityMap)
│   ├── DTOs/                   # Request/Response Data Transfer Objects
│   ├── Services/               # Business Logic & Cloudinary Integrations
│   ├── Middleware/             # API Key Security & Global Error Handling
│   └── appsettings.json        # Database Connection & Configuration
├── frontend/                   # React 18 + TypeScript + Vite Client
│   ├── src/
│   │   ├── api/                # Typed API client functions
│   │   ├── components/         # Reusable UI (HeroSearchBar, PropertyCard, ImageGallery)
│   │   │   ├── home/           # Homepage-specific components
│   │   │   ├── map/            # MapLibre GL components & layer controls
│   │   │   └── admin/          # Admin management modals & pickers
│   │   ├── constants/          # Static locations & realistic placeholder configs
│   │   ├── pages/              # Routes (Home, Properties, Detail, Map, Packages, Admin)
│   │   ├── types/              # TypeScript interfaces & query schemas
│   │   └── utils/              # Arabic normalization, formatters & SEO helpers
│   ├── public/                 # Static assets, logos, and architectural renders
│   └── vite.config.ts          # Vite build & proxy settings
├── FB_MARKETING_PLAN.md        # Comprehensive Facebook advertising & organic strategy
├── DEPLOYMENT.md               # Production deployment manual
└── README.md                   # Platform documentation
```

---

## 💻 Tech Stack

### Backend
- **Framework:** .NET 8.0 (C#)
- **Data Access:** Entity Framework Core 8.0
- **Database:** Microsoft SQL Server
- **Caching:** In-Memory Caching (`IMemoryCache`)
- **Compression:** Response Compression (Brotli & Gzip)
- **Media Storage:** Cloudinary .NET SDK
- **Documentation:** Swagger / OpenAPI

### Frontend
- **Framework:** React 18 with TypeScript
- **Bundler:** Vite 5
- **Routing:** React Router v6
- **Mapping:** MapLibre GL
- **Icons:** Lucide React
- **Styling:** Custom CSS with CSS Variables & Glassmorphism
- **Deployment:** Vercel

---

## 🚀 Getting Started

### Prerequisites
- [.NET 8.0 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js](https://nodejs.org/) (v18 or higher) & npm
- SQL Server (LocalDB, Express, or Azure SQL)

### 1. Backend Setup
```bash
# Navigate to the API project
cd AqarCare

# Copy settings template and configure connection string
cp appsettings.Template.json appsettings.json

# Restore dependencies & apply migrations
dotnet restore
dotnet ef database update

# Run the backend API
dotnet run
```
*API will run by default at `http://localhost:5041` with Swagger at `http://localhost:5041/swagger`.*

### 2. Frontend Setup
```bash
# Navigate to the frontend directory
cd ../frontend

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```
*The client app will be accessible at `http://localhost:5173`.*

---

## 📡 Core API Endpoints

| Method | Endpoint | Description | Auth |
|:---|:---|:---|:---|
| `GET` | `/api/properties` | Fetch properties list (with pagination, sorting & filters) | Public |
| `GET` | `/api/properties/{id}` | Retrieve comprehensive property details & floors | Public |
| `GET` | `/api/maps/{citySlug}` | Fetch interactive map data & georeferenced units | Public |
| `GET` | `/api/admin/properties` | Retrieve full admin properties dataset | `X-Api-Key` |
| `POST` | `/api/admin/properties` | Create a new property with floor matrix | `X-Api-Key` |
| `PUT` | `/api/admin/properties/{id}` | Update existing property data and status | `X-Api-Key` |
| `DELETE` | `/api/admin/properties/{id}` | Delete a property record | `X-Api-Key` |
| `POST` | `/api/admin/media/upload` | Upload photos and video media to Cloudinary | `X-Api-Key` |

---

## 📄 Facebook Marketing & Lead Plan

A complete advertising and organic growth plan tailored for the Egyptian real estate market is available in:
👉 [FB_MARKETING_PLAN.md](file:///c:/Users/user/Documents/AspNetCore/AqarCare/FB_MARKETING_PLAN.md)

It includes budget distribution, precise audience targeting (Mahalla/Gharbia radius), ready-to-copy Arabic ad copy for 850k apartments, installments, and residential houses, plus WhatsApp sales conversion scripts.

---

## 👨‍💻 Author & Acknowledgements

Developed by **Abdallah Mohamed**
- **GitHub:** [@Abdallah-Muhamed](https://github.com/Abdallah-Muhamed)
- **Repository:** [AqarCare](https://github.com/Abdallah-Muhamed/AqarCare)

---

## 📜 License
This project is open-source and licensed under the [MIT License](LICENSE).
