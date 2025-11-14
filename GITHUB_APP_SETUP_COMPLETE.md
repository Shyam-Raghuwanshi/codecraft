# GitHub App Setup Guide - Complete Vercel-Style Implementation

This guide will help you set up a GitHub App for CodeCraft that provides the same repository selection experience as Vercel.

## 🎯 What You'll Get

After completing this setup, users will see:
- **All repositories** option (like Vercel's first screenshot)
- **Only select repositories** option with dropdown (like Vercel's second screenshot)
- Granular permission control
- Professional installation flow

## 📋 Prerequisites

- GitHub account with admin access to your organization (if applicable)
- Local development environment running
- Basic understanding of GitHub Apps vs OAuth Apps

## 🛠️ Step 1: Create GitHub App

### 1.1 Navigate to GitHub App Creation
- Go to [GitHub Developer Settings](https://github.com/settings/apps)
- Click **"New GitHub App"**

### 1.2 App Configuration

**Basic Information:**
```
GitHub App name: CodeCraft
Description: AI-powered code review and analysis tool
Homepage URL: http://localhost:5174 (or your domain)
```

**Webhook Configuration:**
```
Webhook URL: http://localhost:5174/api/github/webhook (optional for now)
Webhook secret: (leave empty for now)
```

**Repository permissions:**
```
✅ Contents: Read
✅ Metadata: Read  
✅ Pull requests: Read
✅ Issues: Read (optional)
✅ Commit statuses: Read (optional)
```

**Account permissions:**
```
✅ Email addresses: Read
```

**User permissions:**
```
✅ Email addresses: Read
```

**Subscribe to events:**
```
□ Push (optional)
□ Pull request (optional) 
□ Issues (optional)
```

**Where can this GitHub App be installed?:**
```
○ Only on this account (for testing)
● Any account (for production)
```

### 1.3 Generate App Credentials

After creating the app:

1. **Note your App ID** (you'll see it in the URL and app settings)
2. **Generate a private key** (download the .pem file)
3. **Note your Client ID** (in OAuth section)
4. **Generate a Client Secret** (in OAuth section)

## 🔧 Step 2: Update Environment Configuration

Update your `.env.local` file:

```bash
# GitHub OAuth Configuration (existing)
VITE_GITHUB_CLIENT_ID=your_existing_client_id
VITE_GITHUB_CLIENT_SECRET=your_existing_client_secret

# GitHub App Configuration (NEW)
VITE_GITHUB_APP_ID=123456
VITE_GITHUB_APP_CLIENT_ID=Iv1.your_app_client_id
VITE_GITHUB_APP_CLIENT_SECRET=your_app_client_secret

# GitHub App Private Key (for server-side operations)
GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...your key...\n-----END RSA PRIVATE KEY-----"
```

## 📱 Step 3: Test Installation URLs

### 3.1 All Repositories Installation
```
https://github.com/apps/codecraft/installations/new
```

### 3.2 Specific Repository Selection
```
https://github.com/apps/codecraft/installations/new?suggested_target_id=REPOSITORY_ID
```

## 🎨 Step 4: UI Implementation Features

The updated modal will include:

### Repository Access Options
- **All repositories**: Full access to current and future repositories
- **Only select repositories**: Choose specific repositories with dropdown

### Permission Display
- Clear list of what permissions the app requests
- Explanation of why each permission is needed
- Security indicators

### Installation Flow
- Professional GitHub-hosted installation page
- Automatic redirect back to your app
- Repository selection persistence

## 🔒 Step 5: Security Considerations

### Webhook Security
```javascript
// For future webhook implementation
const crypto = require('crypto')

function verifySignature(payload, signature) {
  const hmac = crypto.createHmac('sha256', process.env.GITHUB_WEBHOOK_SECRET)
  const computedSignature = 'sha256=' + hmac.update(payload).digest('hex')
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(computedSignature)
  )
}
```

### Private Key Storage
- Never commit private keys to version control
- Use environment variables or secure secret management
- Rotate keys periodically

## 🧪 Step 6: Testing Checklist

### Local Testing
- [ ] App shows in GitHub Apps settings
- [ ] Installation URL loads correctly
- [ ] Repository selection works
- [ ] Permissions are correctly requested
- [ ] Installation completes successfully
- [ ] App receives installation webhook (if configured)

### Production Testing
- [ ] Update URLs to production domain
- [ ] Test with real organization repositories
- [ ] Verify permissions work as expected
- [ ] Test uninstallation flow

## 🚀 Step 7: Production Deployment

### Update Production Environment
```bash
# Update these for production
VITE_GITHUB_APP_ID=your_production_app_id
GITHUB_APP_PRIVATE_KEY="your_production_private_key"

# Update app URLs to production domain
Homepage URL: https://your-domain.com
Webhook URL: https://your-domain.com/api/github/webhook
```

### GitHub App Settings Update
- Change homepage URL to production domain
- Update webhook URL if using webhooks
- Test installation flow on production

## 🔄 Repository Selection Implementation

### Installation Types

1. **All Repositories**
   ```
   GET /installations/{installation_id}/repositories
   ```

2. **Selected Repositories**
   ```
   GET /user/installations/{installation_id}/repositories
   ```

### Example Installation Data
```json
{
  "id": 12345,
  "account": {
    "login": "your-org",
    "type": "Organization"
  },
  "repository_selection": "selected",
  "repositories": [
    {
      "id": 67890,
      "name": "my-repo",
      "full_name": "your-org/my-repo"
    }
  ]
}
```

## 📝 Notes

- GitHub Apps provide more granular permissions than OAuth Apps
- Installation can be done per-repository or organization-wide
- Users can modify repository selection after installation
- Apps can request additional repositories later

## 🆘 Troubleshooting

### Common Issues
1. **404 on installation URL**: App ID is incorrect or app doesn't exist
2. **Permission errors**: App doesn't have required permissions
3. **Webhook failures**: URL not accessible or signature verification fails

### Debug Commands
```bash
# Check app installation status
curl -H "Authorization: Bearer $TOKEN" \
  https://api.github.com/user/installations

# List repositories for installation
curl -H "Authorization: Bearer $TOKEN" \
  https://api.github.com/user/installations/$INSTALLATION_ID/repositories
```

---

## 🎉 Next Steps

After completing this setup:
1. Your app will have Vercel-style repository selection
2. Users can choose granular permissions
3. Professional installation experience
4. Enhanced security with GitHub Apps

The UI will automatically detect the GitHub App configuration and provide the advanced repository selection interface!