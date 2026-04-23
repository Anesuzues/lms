# Google Form Shadow Configuration Fix

## Current Issue
Your Google Form at:
`https://docs.google.com/forms/d/e/1FAIpQLSeicnftUC9dRZKALdSJugUxYTEJTQQrEyOoEjyzxtSExc2inQ/viewform`

**Is currently requiring sign-in**, which prevents it from working as a shadowed backend form.

## Fix Steps

### 1. Open Form Settings
1. Go to your Google Form
2. Click the **Settings (⚙️)** icon at the top right

### 2. Configure "Responses" Tab
- [ ] **UNCHECK** "Limit to 1 response"
- [ ] **UNCHECK** "Restrict to [organization name] users"
- [ ] Optionally uncheck "Collect email addresses" (unless needed)

### 3. Configure "General" Tab
- [ ] **UNCHECK** "Require sign in"
- [ ] Optionally check "Limit to 1 response" if you want to prevent duplicate submissions

### 4. Save Changes
Click **Save** to apply the settings

## Verify the Fix

After making changes, test the form:

1. **Open the form URL in an incognito/private browser window**
2. You should see the form directly (no sign-in prompt)
3. Try submitting a test response
4. Verify the response is recorded in your Google Sheet

## What "Shadowed" Means

A properly shadowed form:
- ✅ Accepts responses from anyone (no authentication required)
- ✅ Can be embedded or accessed programmatically
- ✅ Is not publicly advertised or discoverable
- ✅ Only accessible via direct link (not in search results)
- ✅ Not shared in public directories

## Security Considerations

Since the form accepts anonymous responses:
- Add validation in your Google Apps Script
- Consider adding a honeypot field to prevent spam
- Monitor submissions for abuse
- Use reCAPTCHA if spam becomes an issue

## Testing After Fix

Test with this HTML file to verify it works:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Form Test</title>
</head>
<body>
    <h1>Test Shadowed Form</h1>
    <iframe 
        src="https://docs.google.com/forms/d/e/1FAIpQLSeicnftUC9dRZKALdSJugUxYTEJTQQrEyOoEjyzxtSExc2inQ/viewform?embedded=true" 
        width="640" 
        height="800" 
        frameborder="0" 
        marginheight="0" 
        marginwidth="0">
        Loading…
    </iframe>
</body>
</html>
```

If you see the form (not a sign-in page), it's properly configured!

## Current Status
- ❌ Form requires sign-in (NEEDS FIX)
- ⏳ Waiting for configuration update

## After Fix
- ✅ Form accepts anonymous responses
- ✅ Can be used as backend for custom form
- ✅ Ready for production deployment