# cPanel Deployment Guide

## Files Ready for Deployment

The site has been successfully built and is ready for cPanel deployment. All production files are located in the `dist/` folder.

## Deployment Steps

### 1. Upload Files to cPanel
1. Log into your cPanel account
2. Open **File Manager**
3. Navigate to `public_html` (or your domain's document root)
4. Upload ALL contents from the `dist/` folder to your domain's root directory

### 2. Required Files Structure
```
public_html/
├── index.html
├── favicon.ico
├── nexalearn-logo.png
├── nobztech-favicon.svg
├── placeholder.svg
├── robots.txt
└── assets/
    ├── index-DlSRs_cN.css
    └── index-DqkIsZKo.js
```

### 3. Configure .htaccess for React Router
Since this is a React SPA with client-side routing, you need to create a `.htaccess` file in your `public_html` directory.

### 4. SSL Certificate
Ensure your domain has an SSL certificate installed for HTTPS access.

### 5. Domain Configuration
Update any hardcoded URLs in your application if needed for your production domain.

## Post-Deployment Checklist

- [ ] All files uploaded successfully
- [ ] .htaccess file created and configured
- [ ] Site loads correctly at your domain
- [ ] All routes work properly (test navigation)
- [ ] Forms submit correctly
- [ ] Images and assets load properly
- [ ] SSL certificate is active
- [ ] Google Apps Script integration is working

## Troubleshooting

### Common Issues:
1. **404 errors on page refresh**: Ensure .htaccess is properly configured
2. **Assets not loading**: Check file paths and permissions
3. **Forms not working**: Verify Google Apps Script URLs are updated for production

## Performance Optimization

The build includes:
- Minified CSS (69.49 kB → 12.37 kB gzipped)
- Minified JavaScript (330.53 kB → 104.56 kB gzipped)
- Optimized assets and images
- Production-ready React build

Your site is now ready for production deployment!