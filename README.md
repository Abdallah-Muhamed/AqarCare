# AqarCare – Real Estate Management Platform

[![.NET 8](https://img.shields.io/badge/.NET-8.0-512BD4?style=flat&logo=dotnet&logoColor=white)](https://dotnet.microsoft.com/en-us/download/dotnet/8.0)
[![React 18](https://img.shields.io/badge/React-18.3-61DAFB?style=flat&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript 5](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vercel Deployment](https://img.shields.io/badge/Deployed%20on-Vercel-000000?style=flat&logo=vercel)](https://aqar-care.vercel.app)

---

## Overview
AqarCare is a full‑stack real‑estate platform built with **ASP.NET Core 8** (C#) and **React 18**. It provides a modern UI for property browsing, an AI‑driven sales broker, and an interactive map for the city of Al‑Sha‘biyah. The solution demonstrates high‑performance server‑side caching, SEO‑ready rendering, and a clean separation of concerns suitable for enterprise‑grade applications.

---

## Key Features
- **AI Sales Broker** – Conversational assistant powered by Groq Cloud that understands Egyptian Arabic queries and suggests suitable properties.
- **Interactive Map** – MapLibre‑GL based map with colour‑coded markers, filter panel, and mobile‑first drawer.
- **Multi‑Floor & House Management** – Granular control over tower floors, finishing levels, and standalone house units.
- **Performance Optimisation** – In‑memory caching, Brotli/Gzip compression, and progressive rendering for fast page loads.
- **Responsive Design** – Mobile‑first UI with glass‑morphism effects, smooth animations, and adaptive layout.
- **Comprehensive API** – Swagger‑documented REST endpoints for properties, maps, and admin operations.
- **CI/CD Ready** – Deployable to Vercel (frontend) and RunASP (backend) with zero‑downtime updates.

---

## Architecture Overview
```
AqarCare/
├─ AqarCare/                # ASP.NET Core 8 Web API
│   ├─ Controllers/        # API Controllers (Properties, AI Broker, Maps)
│   ├─ Data/               # EF Core DbContext & Entities
│   ├─ Services/           # Business logic (PropertyService, AIBrokerService)
│   ├─ Middleware/         # API‑Key authentication
│   └─ appsettings.json    # Configuration (connection string, API keys)
├─ frontend/                # React 18 + TypeScript + Vite
│   ├─ src/
│   │   ├─ components/     # Reusable UI components (cards, map, chat)
│   │   ├─ pages/          # Route pages (Home, Properties, Map, Admin)
│   │   ├─ api/            # API client wrappers
│   │   └─ utils/          # SEO helpers, formatters
│   └─ public/              # static assets (robots.txt, sitemap.xml)
└─ README.md                # This document
```
*An optional architecture diagram can be added here.*

---

## Tech Stack
**Backend**
- ASP.NET Core 8 (C#)
- Entity Framework Core 8 (SQL Server)
- In‑memory caching (`IMemoryCache`)
- Response compression (Brotli & Gzip)
- Groq Cloud LLM for AI broker
- Cloudinary .NET SDK for media storage
- RunASP for hosting

**Frontend**
- React 18 with TypeScript
- Vite 5 (fast bundling)
- MapLibre GL for interactive maps
- Lucide React icons
- Modern CSS with custom variables & glass‑morphism effects
- Vercel for deployment

---

## Getting Started
### Prerequisites
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- Node.js 18+ and npm
- SQL Server (local or Azure)

### Backend
```bash
cd AqarCare
# Copy the template settings and fill in your connection string & API keys
cp appsettings.Template.json appsettings.json
# Restore packages and apply migrations
dotnet restore
dotnet ef database update
# Run the API (Swagger available at /swagger)
dotnet run
```
The API listens on `http://localhost:5041` by default.

### Frontend
```bash
cd ../frontend
npm install
npm run dev
```
Open `http://localhost:5173` to view the application.

---

## API Documentation
The API is fully described in Swagger UI:
- **Base URL:** `http://localhost:5041`
- **Swagger:** `http://localhost:5041/swagger`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/properties` | List published properties (cached, supports pagination) |
| `GET` | `/api/properties/{id}` | Retrieve detailed property information |
| `POST` | `/api/ai/broker` | Chat with the AI sales broker |
| `GET` | `/api/maps/{citySlug}` | Map data for the selected city |
| `GET` | `/api/admin/properties` | Admin‑only list of all properties (requires `X‑Api‑Key`) |
| `POST` | `/api/admin/properties` | Create a new property (admin) |
| `PUT` | `/api/admin/properties/{id}` | Update an existing property (admin) |
| `DELETE` | `/api/admin/properties/{id}` | Delete a property (admin) |
| `POST` | `/api/admin/media/upload` | Upload media to Cloudinary (admin) |

---

## Contributing
Contributions are welcome. Please follow these steps:
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/your-feature`).
3. Ensure the solution builds and all tests pass.
4. Open a Pull Request with a clear description of changes.

---

## License
This project is licensed under the **MIT License**.

---

## About the Author
**Abdallah Mohamed** – Full‑stack .NET developer with a focus on performance‑critical web applications.
- GitHub: [@Abdallah-Muhamed](https://github.com/Abdallah-Muhamed)
- Portfolio: https://github.com/Abdallah-Muhamed/AqarCare

---

*Built with passion for modern real‑estate solutions in Egypt.*
