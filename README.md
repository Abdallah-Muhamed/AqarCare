# 🏠 AqarCare

<div align="center">

![AqarCare Logo](https://img.shields.io/badge/AqarCare-Real%20Estate%20Platform-blue)
![.NET](https://img.shields.io/badge/.NET-8.0-purple)
![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![License](https://img.shields.io/badge/License-MIT-green)

**A comprehensive real estate finishing and property management platform**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Installation](#-installation) • [Usage](#-usage) • [API Documentation](#-api-documentation) • [Contributing](#-contributing)

</div>

---

## 🌟 Features

### For Property Owners
- **Property Management**: Add, edit, and manage real estate listings
- **Finishing Packages**: Browse and select from multiple finishing packages (Classic, Bronze, Silver, Gold, Platinum, Diamond)
- **Media Upload**: Upload images and videos for property listings
- **Status Tracking**: Track property status (Available, Sold, Rented, Reserved)
- **Pricing Management**: Set listing prices and track actual sale prices

### For Customers
- **Property Search**: Browse available properties with advanced filters
- **Finishing Package Details**: View detailed information about finishing packages
- **Payment Plans**: View payment phases and supervision percentages
- **Property Details**: Comprehensive property information including area, rooms, finishing status

### Admin Panel
- **Secure Authentication**: API key-based authentication
- **Property CRUD**: Full control over property listings
- **Media Management**: Upload and manage property media
- **Package Management**: Manage finishing packages and their details

---

## 🛠 Tech Stack

### Backend
- **Framework**: ASP.NET Core 8.0
- **Database**: SQL Server with Entity Framework Core
- **Authentication**: API Key-based authentication
- **Cloud Storage**: Cloudinary for media hosting
- **API**: RESTful API with Swagger documentation

### Frontend
- **Framework**: React 18 with TypeScript
- **Styling**: CSS with custom components
- **Routing**: React Router
- **HTTP Client**: Fetch API
- **Build Tool**: Vite

---

## 📦 Installation

### Prerequisites
- .NET 8.0 SDK
- Node.js 18+ and npm
- SQL Server
- Cloudinary account (for media upload)

### Backend Setup

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/AqarCare.git
cd AqarCare/AqarCare
```

2. **Configure the application**
Update `appsettings.json` with your configuration:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=your_server; Database=AqarCare; User Id=your_user; Password=your_password; Encrypt=True; TrustServerCertificate=True; MultipleActiveResultSets=True;"
  },
  "Admin": {
    "ApiKey": "your-secure-admin-api-key"
  },
  "Cloudinary": {
    "CloudName": "your-cloud-name",
    "ApiKey": "your-api-key",
    "ApiSecret": "your-api-secret",
    "Folder": "aqarcare"
  }
}
```

3. **Install dependencies and run migrations**
```bash
dotnet restore
dotnet ef database update
```

4. **Run the backend**
```bash
dotnet run
```
The API will be available at `http://localhost:5041`

### Frontend Setup

1. **Navigate to the frontend directory**
```bash
cd ../frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Run the development server**
```bash
npm run dev
```
The frontend will be available at `http://localhost:5173`

---

## 🚀 Usage

### Accessing the Application

- **Main Website**: `http://localhost:5173`
- **API Documentation**: `http://localhost:5041/swagger`
- **Admin Panel**: `http://localhost:5173/admin`

### Admin Authentication

To access the admin panel, use the API key configured in `appsettings.json`:
```
API Key: your-secure-admin-api-key
```

### Finishing Packages

The platform offers 6 finishing packages:

| Package | Price/m² | Description |
|---------|----------|-------------|
| Classic | 1500 EGP | Basic finishing with essential features |
| Bronze | 2500 EGP | Standard finishing with upgraded materials |
| Silver | 3500 EGP | Premium finishing with advanced features |
| Gold | 4500 EGP | Luxury finishing with German materials |
| Platinum | 7000 EGP | Complete package with supplies included |
| Diamond | 9000 EGP | Full package with furniture and furnishing |

---

## 📚 API Documentation

### Public Endpoints

#### Properties
- `GET /api/properties` - Get published properties (with pagination)
- `GET /api/properties/{id}` - Get property details by ID

#### Finishing Packages
- `GET /api/finishing-packages` - Get all finishing packages
- `GET /api/finishing-packages/{slug}` - Get package details by slug

### Admin Endpoints

All admin endpoints require the API key in the `X-Api-Key` header.

#### Properties Management
- `GET /api/admin/properties` - Get all properties (including unpublished)
- `GET /api/admin/properties/{id}` - Get property details
- `POST /api/admin/properties` - Create new property
- `PUT /api/admin/properties/{id}` - Update property
- `DELETE /api/admin/properties/{id}` - Delete property
- `POST /api/admin/properties/{id}/media` - Add media to property
- `DELETE /api/admin/properties/{id}/media/{mediaId}` - Remove media

#### Media Upload
- `POST /api/admin/media/upload` - Upload media to Cloudinary
- `DELETE /api/admin/media/{publicId}` - Delete media from Cloudinary

For detailed API documentation, visit the Swagger UI at `http://localhost:5041/swagger`

---

## 🏗 Project Structure

```
AqarCare/
├── AqarCare/                    # Backend ASP.NET Core application
│   ├── Controllers/             # API controllers
│   │   ├── Admin/             # Admin-specific controllers
│   │   ├── PropertiesController.cs
│   │   └── FinishingPackagesController.cs
│   ├── Data/                   # Database context and entities
│   │   ├── Entities/          # Database models
│   │   ├── Seed/              # Database seeding
│   │   └── Configurations/    # EF Core configurations
│   ├── Services/              # Business logic services
│   ├── DTOs/                  # Data transfer objects
│   ├── Middleware/            # Custom middleware
│   └── Filters/              # Action filters
├── frontend/                   # React frontend application
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── pages/            # Page components
│   │   ├── constants/        # Constants and configurations
│   │   └── App.tsx           # Main app component
│   └── public/               # Static assets
└── README.md                  # This file
```

---

## 🔧 Configuration

### Database Connection

Update the connection string in `appsettings.json`:
```json
"ConnectionStrings": {
  "DefaultConnection": "Server=your_server; Database=AqarCare; User Id=your_user; Password=your_password; Encrypt=True; TrustServerCertificate=True; MultipleActiveResultSets=True;"
}
```

### Cloudinary Setup

1. Create a Cloudinary account at [cloudinary.com](https://cloudinary.com)
2. Get your Cloud Name, API Key, and API Secret from the dashboard
3. Update the Cloudinary section in `appsettings.json`

### Admin API Key

Change the default admin API key in `appsettings.json` for security:
```json
"Admin": {
  "ApiKey": "your-secure-admin-api-key"
}
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👥 Authors

- **Your Name** - *Initial work* - [YourGitHub](https://github.com/yourusername)

---

## 🙏 Acknowledgments

- Cloudinary for media hosting services
- Microsoft for .NET and Entity Framework Core
- React community for the amazing framework

---

## 📞 Support

For support, email support@aqarcare.com or open an issue in the repository.

---

<div align="center">

**Built with ❤️ for the real estate industry**

</div>
