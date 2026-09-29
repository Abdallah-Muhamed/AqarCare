# 🏢 AqarCare — Real Estate Management & Property Discovery Platform

[![Production Deployment](https://img.shields.io/badge/Production-Live-00C781?style=for-the-badge&logo=vercel&logoColor=white)](https://aqar-care.vercel.app)
[![Backend CI Pipeline](https://img.shields.io/badge/CI-GitHub_Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white)](https://github.com/Abdallah-Muhamed/AqarCare/actions)
[![.NET 8](https://img.shields.io/badge/.NET_8.0-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)](https://dotnet.microsoft.com/en-us/download/dotnet/8.0)
[![C# 12](https://img.shields.io/badge/C%23_12-239120?style=for-the-badge&logo=c-sharp&logoColor=white)](https://docs.microsoft.com/en-us/dotnet/csharp/)
[![React 18](https://img.shields.io/badge/React_18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript 5](https://img.shields.io/badge/TypeScript_5.6-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![SQL Server](https://img.shields.io/badge/SQL_Server_2022-CC292B?style=for-the-badge&logo=microsoft-sql-server&logoColor=white)](https://www.microsoft.com/sql-server)
[![Tests](https://img.shields.io/badge/Tests-26_Passing-green?style=for-the-badge)](https://github.com/Abdallah-Muhamed/AqarCare)

> A modular real estate management and property discovery platform built with **ASP.NET Core 8 Web API** and **React 18 / TypeScript / Vite**. Designed to address Egyptian real estate domain requirements — including multi-unit residential buildings, whole-building properties, commercial units, and licensed land parcels — backed by GIS vector mapping, optimistic concurrency controls, automated compensating transactions, and administrative management workflows.

🔗 **Live Production System:** [https://aqar-care.vercel.app](https://aqar-care.vercel.app)  
🏙️ **Browse Properties:** [https://aqar-care.vercel.app/properties](https://aqar-care.vercel.app/properties)  
🗺️ **Interactive Vector Map:** [https://aqar-care.vercel.app/map](https://aqar-care.vercel.app/map)  

### 🎯 Key Backend Topics Demonstrated
- **RESTful API Design & OpenAPI Contracts:** Clean layered architecture with ASP.NET Core 8 Web API, Swagger / OpenAPI schemas, and XML contract documentation.
- **Role-Based Access Control (RBAC):** Distinct authorization policies for **Admin**, **Agent**, and **Customer** roles, complete with password hashing via PBKDF2 with HMAC-SHA256.
- **Customer Inquiry Workflows:** Real estate lead generation and triage pipeline allowing Customers to submit inquiries and Agents to manage leads for their assigned listings.
- **Data Modeling & EF Core 8:** Complex one-to-many relationships (units, floors, media, inquiries), `.AsSplitQuery()` to eliminate Cartesian products, and `.AsNoTracking()` on read queries.
- **Concurrency & Data Integrity:** Optimistic concurrency control using SQL Server `ROWVERSION` (`[Timestamp] byte[] RowVersion`) with HTTP 409 Conflict handling.
- **Fault-Tolerant Media Workflows:** Compensating transactions on external CDN failures (automatic Cloudinary asset deletion if database persistence fails).
- **Security & Authorization:** Dual authentication pipeline supporting JWT Bearer tokens with claims-based authorization and constant-time API key validation (`CryptographicOperations.FixedTimeEquals`).
- **Global Exception Handling & Consistent Errors:** Centralized exception handling middleware returning standardized `ApiErrorResponse` structures with sanitized production errors and correlation Trace IDs.
- **Structured Telemetry & Logging:** Diagnostic request middleware tracking HTTP methods, status codes, and execution duration in milliseconds.
- **Traffic Control:** ASP.NET Core 8 rate limiting middleware (endpoint-specific authentication limits + global API ceilings).
- **Cache Invalidation:** In-memory caching with atomic version-increment invalidation on mutations (`Interlocked.Increment`).
- **Automated Testing & CI/CD:** 26 automated unit and integration tests using xUnit, Moq, and FluentAssertions, executed via a complete GitHub Actions `build → test → deploy` pipeline.

---

## 📑 Table of Contents
1. [Key Backend Topics](#-key-backend-topics-demonstrated)
2. [Architecture & System Design](#-architecture--system-design)
3. [Authentication, Authorization & Security](#-authentication-authorization--security)
4. [Resilience & Engineering Decisions](#-resilience--engineering-decisions)
5. [Domain Modeling & Data Architecture](#-domain-modeling--data-architecture)
6. [GIS Vector Engine & Arabic Property Search](#-gis-vector-engine--arabic-property-search)
7. [Automated Testing & CI/CD Pipeline](#-automated-testing--cicd-pipeline)
8. [API Specification & Security Contracts](#-api-specification--security-contracts)
9. [Local Setup & Environment Configuration](#-local-setup--environment-configuration)
10. [Author](#-author)

---

## 🏗️ Architecture & System Design

The application follows a clean layered architecture with clear separation of concerns between client presentation, HTTP transport, application services, caching, and persistence:

```
[ Client: React 18 / TypeScript / Vite / MapLibre GL ]
                       │
                       │ HTTPS (RESTful JSON + Brotli / Gzip)
                       ▼
[ Cloud Edge: Vercel CDN Routing & Static Assets ]
                       │
                       ▼
[ ASP.NET Core 8 Web API Gateway ]
   ├── Built-in Rate Limiting Middleware (Fixed-Window IP Throttling)
   ├── Response Compression Middleware (Brotli & Gzip for HTTPS)
   ├── JWT Bearer Authentication & Claims Transformation Pipeline
   ├── Dual-Auth Middleware (JWT Tokens & Constant-Time Hashed API Key)
   │
   ├── [ Controllers Layer ]
   │      ├── AuthController (Login, Token Issuance, Session Verification)
   │      ├── PropertiesController (Public Property Queries & Details)
   │      ├── MapsController (Public GIS Datasets & Geolocated Pins)
   │      └── Admin Controllers (Protected Inventory, Floors, Media Operations)
   │
   ├── [ Application Services Layer ]
   │      ├── PropertyService (Filtering, Multi-Unit Calculations, Cache Orchestration)
   │      ├── MapService (Geographic Coordinate Normalization & City Maps)
   │      ├── CloudinaryService (ICloudinaryService Media Upload & Ingestion)
   │      └── JwtTokenService (IJwtTokenService Token Generation & Claims)
   │
   ├── [ Caching Layer: In-Memory Cache with Atomic Version Invalidation ]
   │
   └── [ Data Access Layer: EF Core 8 with SQL Server 2022 ]
          ├── Split Query Execution (.AsSplitQuery)
          ├── Optimistic Concurrency Control ([Timestamp] RowVersion)
          └── Read-Only Optimization (.AsNoTracking)
```

---

## 🔐 Authentication, Authorization & Security

Administrative operations are protected using industry-standard ASP.NET Core security patterns:

### 1. Modern JWT Bearer Authentication
- **Endpoint:** `POST /api/auth/login` validates administrator credentials and issues a signed JSON Web Token (JWT) with standard role claims (`ClaimTypes.Role: Admin`).
- Tokens include cryptographic signatures (HMAC SHA-256), customizable expiration windows, and issuer/audience validation via `Microsoft.AspNetCore.Authentication.JwtBearer`.
- Controller endpoints enforce authorization using standard ASP.NET Core `[Authorize(Roles = "Admin")]` metadata.

### 2. Secure Machine-to-Machine Integration (Dual Authentication)
- In addition to interactive user login via JWT, backend management scripts and automated webhooks can authenticate using `X-Api-Key`.
- **Side-Channel Mitigation:** The authentication middleware uses `CryptographicOperations.FixedTimeEquals` to perform constant-time byte comparisons between incoming headers and configured secrets, preventing timing attacks.
- Once verified, the middleware synthesizes a valid `ClaimsPrincipal` with the `Admin` role, ensuring unified downstream authorization policies.

### 3. Rate Limiting Protection (.NET 8 Built-in)
- Integrated `Microsoft.AspNetCore.RateLimiting` protects sensitive routes against brute-force attacks and volumetric abuse:
  - **Auth Limiter:** Fixed-window limit of 5 attempts per minute per IP address on `/api/auth/login`.
  - **API Limiter:** 120 requests per minute general traffic ceiling to safeguard against automated scrapers.

---

## 🛡️ Resilience & Engineering Decisions

Here is how the architecture addresses real-world engineering failure modes and concurrency challenges:

### 1. What happens if two administrators update the same property simultaneously?
**Solution: Optimistic Concurrency Control (`RowVersion`)**
- `PropertyUnit` carries a `[Timestamp] public byte[]? RowVersion { get; set; }` concurrency token mapped to SQL Server's `ROWVERSION` type.
- During updates, EF Core attaches the original `RowVersion` sent by the client. If another transaction has modified and committed the record in the interim, the database rejects the update and EF Core throws a `DbUpdateConcurrencyException`.
- The controller catches this exception and returns an HTTP `409 Conflict` response with an actionable error message, preventing silent data loss (lost updates).

### 2. What happens if Cloudinary upload succeeds but the database save fails?
**Solution: Automated Compensating Transactions**
- Multi-step media ingestion involves an external third-party CDN (Cloudinary) and internal database persistence.
- In `PropertyService.UploadAndAttachMediaAsync`, after an image or video is uploaded to Cloudinary:
  ```csharp
  try
  {
      _db.PropertyMedia.Add(media);
      await _db.SaveChangesAsync(ct);
  }
  catch
  {
      // Compensating action: Delete the asset from Cloudinary
      // to prevent orphaned files consuming storage quotas.
      if (!string.IsNullOrWhiteSpace(uploadResult.PublicId))
      {
          await cloudinaryService.DeleteAsync(uploadResult.PublicId, CancellationToken.None);
      }
      throw;
  }
  ```
- If the database commit fails (network blip, constraint violation), the `catch` block invokes a compensating delete request against Cloudinary before bubbling up the exception.

### 3. What happens if the cache contains stale data?
**Solution: Cache-Aside with Atomic Version Invalidation**
- Read queries use composite versioned cache keys: `pub_v{_cacheVersion}_{filters}` with a conservative 60-second sliding TTL.
- Write operations (Create, Update, Delete) trigger `Interlocked.Increment(ref _cacheVersion)`. This instantly invalidates all active cached search permutations without lock contention or expensive key iteration.
- **Horizontal Scaling Consideration:** In a single-instance deployment, in-memory caching is fast and cost-effective. For distributed multi-node deployments across container clusters, this strategy smoothly upgrades to **Redis Distributed Cache** combined with **Redis Pub/Sub** or Redis cache tags to broadcast invalidation signals across all API nodes.

### 4. How are EF Core Cartesian product explosions mitigated?
**Solution: Explicit Split Queries (`AsSplitQuery`)**
- Real estate records frequently join multiple one-to-many child collections (`PropertyUnit` -> `Floors` + `Media`).
- Default relational joins create a Cartesian product, multiplying parent columns across all child combinations.
- AqarCare explicitly chains `.AsSplitQuery()` on relational queries, executing individual, targeted SQL SELECT statements per collection, cutting data transfer overhead and database memory usage.

---

## 🏛️ Domain Modeling & Data Architecture

```
                    ┌─────────────────────────┐
                    │      PropertyUnit       │
                    ├─────────────────────────┤
                    │ Id: int (PK)            │
                    │ Title: string           │
                    │ PropertyType: enum      │
                    │ ListingType: enum       │
                    │ Price: decimal?         │
                    │ InstallmentPrice: dec?  │
                    │ AreaSqm: decimal?       │
                    │ FrontageLength: dec?    │
                    │ StreetWidth: string?    │
                    │ HasBuildingLicense: bool│
                    │ Status: string          │
                    │ RowVersion: byte[] (CC) │
                    │ CreatedAt, UpdatedAt    │
                    └───────────┬─────────────┘
                                │ 1
                                │
               ┌────────────────┴────────────────┐
               │ 1..*                            │ 0..*
┌──────────────▼──────────────┐   ┌──────────────▼──────────────┐
│        PropertyFloor        │   │        PropertyMedia        │
├─────────────────────────────┤   ├─────────────────────────────┤
│ Id: int (PK)                │   │ Id: int (PK)                │
│ PropertyUnitId: int (FK)    │   │ PropertyUnitId: int (FK)    │
│ FloorNumber: int            │   │ MediaUrl: string            │
│ FloorName: string           │   │ MediaType: string           │
│ Price: decimal?             │   │ CloudinaryPublicId: string  │
│ InstallmentPrice: decimal?  │   │ SortOrder: int              │
│ PricePerMeter: decimal?     │   └─────────────────────────────┘
│ Bedrooms, Bathrooms         │
│ IsAvailable: bool           │
└─────────────────────────────┘
```

### Domain Attributes by Category:
- **Multi-Unit Towers:** Explicit parent-child matrix representing floors and units with independent cash vs installment pricing, meter price calculations, and availability statuses.
- **Whole-Building Houses:** Multi-floor residential buildings with individual apartment finishing distributions (`متشطب`, `نص تشطيب`, `عظم`) and suppressed meter prices.
- **Land Parcels:** Surveyor metrics including street width, frontage length, and official building license verification (`رخصة بناء`).

---

## 🗺️ GIS Vector Engine & Arabic Property Search

### 1. Vector Mapping with MapLibre GL
- Hardware-accelerated WebGL vector map rendering supporting interactive navigation across administrative zones.
- Domain-specific SVG pins dynamically adapt to property types:
  - **Land (`أرض`):** Surveyor land plot marker.
  - **Houses (`منزل`):** Multi-story residential building glyph.
  - **Shops (`محل`):** Commercial storefront icon.
  - **Apartments (`شقة`):** Floor-based residential markers with finishing level badges.

### 2. Arabic Search Normalization
Arabic search inputs encounter varied spelling conventions. The client-side normalization pipeline unifies these orthographic variations prior to matching:

```typescript
export function normalizeArabic(text: string): string {
  if (!text) return '';
  return text
    .trim()
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670]/g, '') // Strip diacritics (Tashkeel)
    .replace(/[إأآٱ]/g, 'ا')               // Standardize Alif variants
    .replace(/ة/g, 'ه')                    // Normalize Taa Marbuta
    .replace(/ى/g, 'ي')                    // Standardize Yaa / Alif Maqsura
    .replace(/[\-–—_\/\\,،\.]/g, ' ')      // Standardize punctuation
    .replace(/\s+/g, ' ');                 // Collapse multiple spaces
}
```

---

## 🧪 Automated Testing & CI/CD Pipeline

### 1. Unit & Integration Test Suite (`AqarCare.Tests`)
The test project covers business rules, RBAC security policies, customer inquiry workflows, optimistic concurrency handling, and compensating transactions using **xUnit**, **Moq**, and **FluentAssertions**:

```
AqarCare.Tests
 ├── AuthServiceTests.cs         # PBKDF2 hashing, multi-tenant roles (Admin/Agent/Customer), JWT generation & login
 ├── InquiryServiceTests.cs      # Customer inquiry submission, agent listing scoping, and status transitions
 ├── ErrorHandlingTests.cs       # Global exception middleware, 409 conflict formatting, 500 error sanitization
 ├── PropertyServiceTests.cs     # Filtering, pagination, multi-unit calculations, cache invalidation
 ├── FaultToleranceTests.cs      # Compensating actions upon database save failures
 └── MapServiceTests.cs          # Active city filtering and GIS endpoint edge cases
```

Run tests locally:
```bash
dotnet test AqarCare.sln --verbosity normal
```

### 2. Continuous Integration & Deployment (GitHub Actions)
The repository includes an automated workflow [`.github/workflows/backend-ci.yml`](.github/workflows/backend-ci.yml) implementing a complete `build → test → deploy` pipeline:
1. **Build & Test Job:**
   - Checks out repository and configures .NET 8.0 SDK.
   - Restores NuGet packages with caching.
   - Compiles solution in `Release` configuration.
   - Executes all 26 automated unit and integration tests with code coverage collection.
   - Compiles and packages release binaries via `dotnet publish`.
   - Uploads verified build artifacts (`actions/upload-artifact@v4`).
2. **Deploy Job:**
   - Runs automatically upon successful completion of `build-and-test` on the `main` branch.
   - Validates release binary integrity and triggers production deployment workflows.

---

## 📡 API Specification & Security Contracts

Interactive OpenAPI / Swagger documentation with XML summaries and request/response schemas is available at `/swagger`:

| Method | Endpoint | Description | Security |
|:---|:---|:---|:---|
| `POST` | `/api/auth/register` | Register new Customer or Agent account | Public (Rate Limited) |
| `POST` | `/api/auth/login` | Authenticate user (Admin, Agent, Customer) & receive JWT | Public (Rate Limited) |
| `GET` | `/api/auth/me` | Inspect current authenticated identity, roles & profile | `Bearer <JWT>` |
| `POST` | `/api/properties/{id}/inquiries` | Submit customer inquiry or contact request | Public / Customer |
| `GET` | `/api/inquiries/my` | Retrieve inquiries submitted by authenticated customer | `Bearer [Customer]` |
| `GET` | `/api/inquiries` | Triage customer inquiries (Admin sees all; Agent sees own) | `Bearer [Admin, Agent]` |
| `PATCH` | `/api/inquiries/{id}/status` | Update inquiry status (Pending → Contacted → Closed) | `Bearer [Admin, Agent]` |
| `GET` | `/api/properties` | Retrieve paginated, filterable properties | Public |
| `GET` | `/api/properties/{id}` | Retrieve property details with floors & media | Public |
| `GET` | `/api/maps/{citySlug}` | Fetch interactive map GIS datasets & pins | Public |
| `GET` | `/api/admin/properties` | Fetch complete inventory (including drafts) | `Bearer` / `X-Api-Key` |
| `POST` | `/api/admin/properties` | Create property listing (auto-associates Agent ID) | `Bearer` / `X-Api-Key` |
| `PUT` | `/api/admin/properties/{id}` | Update property (Optimistic Concurrency + Agent check) | `Bearer` / `X-Api-Key` |
| `DELETE` | `/api/admin/properties/{id}` | Delete property (Agent listing check + cache invalidation) | `Bearer` / `X-Api-Key` |
| `POST` | `/api/admin/properties/{id}/media/upload` | Upload & attach media with compensating rollback | `Bearer` / `X-Api-Key` |
| `DELETE` | `/api/admin/properties/{id}/media/{mediaId}` | Remove media record from property | `Bearer` / `X-Api-Key` |

---

## 🚀 Local Setup & Environment Configuration

### Prerequisites
- [.NET 8.0 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js](https://nodejs.org/) (v18+) & npm
- Local SQL Server instance or Docker SQL Server container

### 1. Configure & Run Backend
```bash
git clone https://github.com/Abdallah-Muhamed/AqarCare.git
cd AqarCare/AqarCare

# Copy settings template and provide your database credentials
cp appsettings.Template.json appsettings.json

# Restore dependencies and apply database migrations
dotnet restore
dotnet ef database update

# Run the API server
dotnet run
```
*API will start at `http://localhost:5041` with Swagger UI available at `http://localhost:5041/swagger`.*

### 2. Configure & Run Frontend
```bash
cd ../frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
*Frontend will be running at `http://localhost:5173`.*

### 3. Run Test Suite
```bash
cd ..
dotnet test AqarCare.sln
```

---

## 👨‍💻 Author

**Abdallah Mohamed**  
*Backend Developer — ASP.NET Core / C#*  
- **GitHub:** [@Abdallah-Muhamed](https://github.com/Abdallah-Muhamed)  
- **Repository:** [AqarCare](https://github.com/Abdallah-Muhamed/AqarCare)  
