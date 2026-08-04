# 🚀 Deployment Guide

## Backend Deployment (ASP.NET Core)

### Prerequisites
- ASP.NET Core 8.0 Hosting Bundle installed on the server
- SQL Server database (already configured)
- Cloudinary account configured

### Step 1: Update Production Configuration

Before deployment, update `appsettings.Production.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=db60259.public.databaseasp.net; Database=db60259; User Id=db60259; Password=fW%7+9Lkp_4Q; Encrypt=True; TrustServerCertificate=True; MultipleActiveResultSets=True;"
  },
  "Admin": {
    "ApiKey": "CHANGE_THIS_TO_SECURE_KEY_IN_PRODUCTION"
  },
  "Cloudinary": {
    "CloudName": "YOUR_CLOUD_NAME",
    "ApiKey": "221265963371637",
    "ApiSecret": "5z8TLD8NjYCb23JS_1jUuzuMDAs",
    "Folder": "aqarcare"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Warning",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "aqarcare.runasp.net"
}
```

**Important**: 
- Change the `Admin.ApiKey` to a secure value
- Add your Cloudinary CloudName

### Step 2: Build the Application

```bash
cd AqarCare
dotnet publish -c Release -o ./publish
```

### Step 3: Upload to Server

Upload the contents of the `publish` folder to your hosting server at `aqarcare.runasp.net`.

### Step 4: Configure IIS (if using IIS)

1. Create a new website in IIS Manager
2. Point it to the published folder
3. Set the application pool to use .NET 8.0 (No Managed Code)
4. Ensure HTTPS is configured with a valid SSL certificate

### Step 5: Run Database Migrations

The application will automatically run migrations on startup, but you can also run them manually:

```bash
dotnet ef database update --connection "YourProductionConnectionString"
```

### Step 6: Verify Deployment

1. Access the API at: `https://aqarcare.runasp.net`
2. Check Swagger documentation: `https://aqarcare.runasp.net/swagger`
3. Test the API endpoints

---

## Frontend Deployment (React + Vite)

### Step 1: Build for Production

```bash
cd frontend
npm run build
```

This will create a `dist` folder with optimized production files.

### Step 2: Upload to Server

Upload the contents of the `dist` folder to your hosting server or a CDN.

### Step 3: Configure Web Server

#### For IIS:

Create a `web.config` file in the `dist` folder:

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="React Router" stopProcessing="true">
          <match url=".*" />
          <conditions>
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
          </conditions>
          <action type="Rewrite" url="/" />
        </rule>
      </rules>
    </rewrite>
    <staticContent>
      <mimeMap fileExtension=".json" mimeType="application/json" />
    </staticContent>
  </system.webServer>
</configuration>
```

#### For Nginx:

```nginx
server {
    listen 80;
    server_name aqarcare.runasp.net;

    root /path/to/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass https://aqarcare.runasp.net;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Step 4: Verify Frontend

1. Access the frontend at: `https://aqarcare.runasp.net`
2. Test all pages and functionality
3. Verify API calls are working correctly

---

## Environment Variables

### Frontend Environment Variables

Create `.env.production` in the frontend root:

```env
VITE_API_BASE_URL=https://aqarcare.runasp.net
```

### Backend Environment Variables

The backend uses `appsettings.Production.json` for production configuration.

---

## Security Checklist

Before going live, ensure:

- [ ] Change the Admin API Key to a secure value
- [ ] Add your Cloudinary CloudName
- [ ] Enable HTTPS with a valid SSL certificate
- [ ] Review CORS settings and restrict to your domain
- [ ] Disable Swagger in production (optional, for security)
- [ ] Set up proper logging and monitoring
- [ ] Configure database backups
- [ ] Review database connection string security

---

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure the frontend domain is added to CORS policy in `Program.cs`
2. **Database Connection**: Verify connection string and database accessibility
3. **Media Upload**: Check Cloudinary credentials and CloudName
4. **API Key**: Ensure the correct API key is used in frontend

### Logs

Check application logs for errors:
- IIS logs: `C:\inetpub\logs\LogFiles\`
- Application logs: Check your logging configuration

---

## Post-Deployment

1. **Test Admin Panel**: Access `/admin` and verify authentication works
2. **Test Property Management**: Create, edit, and delete properties
3. **Test Media Upload**: Upload images and verify they appear correctly
4. **Test Finishing Packages**: Verify all packages display correctly
5. **Performance Testing**: Test with multiple users and large datasets

---

## Monitoring

Set up monitoring for:
- API response times
- Database performance
- Error rates
- Server uptime

---

## Backup Strategy

- **Database**: Regular automated backups
- **Media**: Cloudinary handles media storage
- **Application**: Keep source code in Git repository
- **Configuration**: Document all environment-specific settings

---

## Support

For deployment issues:
- Check logs for error messages
- Verify all configuration settings
- Test API endpoints individually
- Contact hosting provider if server issues persist
