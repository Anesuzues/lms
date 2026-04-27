# Deployment Checklist

## ✅ Pre-Deployment (Completed)
- [x] Project built successfully (`npm run build`)
- [x] Production files generated in `dist/` folder
- [x] .htaccess file created for React Router support
- [x] Build optimized (CSS: 69.49 kB → 12.37 kB gzipped, JS: 330.53 kB → 104.56 kB gzipped)

## 📋 cPanel Deployment Steps

### 1. File Upload
- [ ] Log into cPanel
- [ ] Open File Manager
- [ ] Navigate to `public_html` (or domain root)
- [ ] Upload ALL files from `dist/` folder
- [ ] Verify all files uploaded correctly:
  - [ ] index.html
  - [ ] .htaccess
  - [ ] favicon.ico
  - [ ] nexalearn-logo.png
  - [ ] nobztech-favicon.svg
  - [ ] placeholder.svg
  - [ ] robots.txt
  - [ ] assets/index-DlSRs_cN.css
  - [ ] assets/index-DqkIsZKo.js

### 2. Domain Configuration
- [ ] Ensure SSL certificate is installed
- [ ] Test domain access (https://yourdomain.com)
- [ ] Verify HTTPS redirect is working

### 3. Functionality Testing
- [ ] Homepage loads correctly
- [ ] Navigation works (all routes)
- [ ] Intake form opens and functions
- [ ] Form submission works (Google Apps Script integration)
- [ ] Module access page works
- [ ] All images and assets load
- [ ] Mobile responsiveness works
- [ ] Page refresh doesn't cause 404 errors

### 4. Performance Verification
- [ ] Page load speed is acceptable
- [ ] Assets are compressed and cached
- [ ] No console errors in browser
- [ ] All external resources load correctly

### 5. SEO & Meta Tags
- [ ] Page title displays correctly
- [ ] Meta description is present
- [ ] Open Graph tags work (test with social media preview)
- [ ] Favicon displays correctly

## 🔧 Post-Deployment Configuration

### Google Apps Script Integration
- [ ] Verify Google Apps Script is deployed and accessible
- [ ] Test form submissions end-to-end
- [ ] Check email notifications are working
- [ ] Verify data is being stored correctly

### Analytics & Monitoring (Optional)
- [ ] Add Google Analytics if needed
- [ ] Set up error monitoring
- [ ] Configure uptime monitoring

## 🚨 Troubleshooting

If you encounter issues:

1. **404 on page refresh**: Check .htaccess file is uploaded and mod_rewrite is enabled
2. **Assets not loading**: Verify file permissions and paths
3. **Form not working**: Check Google Apps Script URL and CORS settings
4. **Slow loading**: Ensure compression is enabled in .htaccess

## 📞 Support

If you need help with deployment, check:
- cPanel documentation
- Your hosting provider's support
- The CPANEL_DEPLOYMENT_GUIDE.md file for detailed instructions

---

**Status**: Ready for deployment ✅
**Build Date**: $(date)
**Files Location**: `dist/` folder