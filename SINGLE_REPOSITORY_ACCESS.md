# Single Repository Access Feature

## Overview

CodeCraft now supports **single repository access** through GitHub App installation, allowing users to grant access to specific repositories only instead of all repositories. This provides better security and granular control over repository permissions.

## 🆕 **New Features**

### **Two Authentication Options**

1. **🔒 GitHub App Installation (Recommended)**
   - Install CodeCraft as a GitHub App
   - Choose specific repositories to grant access to
   - More secure with granular permissions
   - Easy to revoke access per repository

2. **🔓 OAuth Authentication (Legacy)**
   - Traditional OAuth flow
   - Grants access to all repositories
   - Faster setup but broader permissions
   - Good for users who want full access

## 🛠 **Setup Instructions**

### Option 1: GitHub App (Recommended)

1. **Create GitHub App**:
   - Go to [GitHub Developer Settings](https://github.com/settings/apps)
   - Click "New GitHub App"
   - Fill in the details:
     - **GitHub App name**: CodeCraft
     - **Homepage URL**: `http://localhost:5173`
     - **Callback URL**: `http://localhost:5173/github-installation-callback`
     - **Setup URL**: `http://localhost:5173/github-installation-callback` (optional)
     - **Webhook URL**: Leave empty for now

2. **Set Permissions**:
   - **Repository permissions**:
     - Contents: Read
     - Metadata: Read
     - Pull requests: Read
     - Issues: Read (optional)
   - **Account permissions**: None required

3. **Add Environment Variable**:
   ```env
   VITE_GITHUB_APP_ID=123456  # Your GitHub App ID
   ```

### Option 2: OAuth App (Existing)

Keep your existing OAuth app configuration:
```env
VITE_GITHUB_CLIENT_ID=your_client_id
VITE_GITHUB_CLIENT_SECRET=your_client_secret
```

## 🎯 **How It Works**

### GitHub App Flow

1. **User clicks "Install GitHub App"**
2. **Redirects to GitHub App installation page**
3. **User selects specific repositories**
4. **GitHub redirects back with installation ID**
5. **CodeCraft fetches accessible repositories from installation**
6. **User can analyze only the selected repositories**

### OAuth Flow (Existing)

1. **User clicks "OAuth Login"**
2. **Standard OAuth flow**
3. **User authorizes access to all repositories**
4. **CodeCraft can access all user repositories**

## 🎨 **UI Updates**

### **Enhanced Modal**

- **Two-option layout**: GitHub App vs OAuth
- **Clear recommendations**: GitHub App marked as recommended
- **Security indicators**: Shield icons and warnings
- **Feature explanations**: Clear descriptions of each option

### **Repository Selection**

- **Installation-based filtering**: Only show repositories from installations
- **Access indicators**: Visual indicators for installation vs OAuth access
- **Granular control**: Users see exactly which repositories are accessible

## 📁 **Code Structure**

```
src/
├── lib/
│   └── github-auth.ts              # Enhanced with installation methods
├── components/
│   └── AddRepositoryModal.tsx      # Updated with dual options
├── routes/
│   ├── github-callback.tsx         # OAuth callback
│   └── github-installation-callback.tsx  # App installation callback
└── .env.local                      # Environment variables
```

### **New Methods in GitHub Auth Service**

```typescript
// GitHub App installation methods
initiateAppInstallation()           // Start app installation
handleInstallationCallback()        // Process installation
fetchUserInstallations()           // Get user's installations
fetchInstallationRepositories()    // Get repos from installation
fetchInstallationDetails()         // Get installation info
```

## 🔒 **Security Benefits**

### **GitHub App Advantages**

- ✅ **Granular permissions**: Access only to selected repositories
- ✅ **User control**: Users can modify repository selection anytime
- ✅ **Revocable access**: Easy to revoke per-repository access
- ✅ **Audit trail**: Clear installation and permission history
- ✅ **Limited scope**: App can't access repositories not explicitly granted

### **OAuth Considerations**

- ⚠️ **Broad access**: Access to all user repositories
- ⚠️ **All-or-nothing**: Can't limit to specific repositories
- ⚠️ **User trust**: Requires users to trust app with full access

## 📱 **User Experience**

### **Repository Selection Process**

1. **Choose access level**: App installation vs OAuth
2. **Grant permissions**: Select repositories (App) or grant all access (OAuth)
3. **Repository browser**: See only accessible repositories
4. **Analyze repositories**: Select from granted repositories only

### **Visual Indicators**

- **🛡️ Recommended badge**: GitHub App option highlighted
- **⚠️ Warning badge**: OAuth option with broader permissions note
- **🔒 Access indicators**: Repository cards show access method
- **📊 Permission summary**: Clear display of what's accessible

## 🚀 **Migration Path**

### **For Existing Users**

1. **Current OAuth still works**: No breaking changes
2. **Optional migration**: Users can choose to migrate to GitHub App
3. **Dual support**: Both methods work simultaneously
4. **Clear benefits**: UI explains advantages of migration

### **For New Users**

1. **GitHub App recommended**: Default choice in UI
2. **OAuth as fallback**: Available if user prefers
3. **Guided setup**: Clear instructions for both paths

## 🔧 **Development Setup**

### **Environment Variables**

```env
# OAuth App (existing)
VITE_GITHUB_CLIENT_ID=your_oauth_client_id
VITE_GITHUB_CLIENT_SECRET=your_oauth_client_secret

# GitHub App (new)
VITE_GITHUB_APP_ID=your_github_app_id
```

### **Routes**

- `/github-callback` - OAuth callback
- `/github-installation-callback` - GitHub App installation callback

### **Testing**

1. **Test OAuth flow**: Use existing OAuth credentials
2. **Test App installation**: Create GitHub App and test installation
3. **Test repository access**: Verify correct repositories are accessible
4. **Test revocation**: Test removing app access from GitHub

## 🎯 **Best Practices**

### **For Users**

- **Use GitHub App**: More secure and granular control
- **Select minimal repos**: Only grant access to repositories you want to analyze
- **Regular review**: Periodically review installed apps in GitHub settings
- **Revoke unused access**: Remove access when no longer needed

### **For Developers**

- **Promote GitHub App**: Make it the recommended option
- **Clear documentation**: Explain the benefits and setup process
- **Graceful fallback**: Support both methods for flexibility
- **Security messaging**: Clearly communicate security benefits

## 🚨 **Security Considerations**

### **Production Recommendations**

1. **Move secrets server-side**: GitHub App tokens should be server-side
2. **Implement webhooks**: Listen for installation/repository changes
3. **Token rotation**: Implement token refresh mechanisms
4. **Rate limiting**: Respect GitHub API rate limits
5. **Audit logging**: Log all repository access and modifications

### **User Education**

- **Permission explanations**: Clear description of what access means
- **Security benefits**: Explain why single repository access is better
- **Revocation process**: Show users how to revoke access
- **Best practices**: Guide users on secure app usage

## 📊 **Monitoring & Analytics**

### **Track Usage**

- **Installation vs OAuth**: Monitor which method users prefer
- **Repository selection**: Track how many repositories users typically select
- **Conversion rates**: Monitor from authentication to repository analysis
- **Security incidents**: Track any access-related issues

### **User Feedback**

- **Preference surveys**: Ask users about their authentication preferences
- **Security concerns**: Gather feedback on security features
- **UX improvements**: Identify pain points in the flow
- **Feature requests**: Track requests for additional permissions

## 🔄 **Future Enhancements**

### **Planned Features**

1. **Webhook integration**: Real-time repository updates
2. **Team management**: Support for organization installations
3. **Advanced permissions**: Fine-grained permission controls
4. **Bulk operations**: Install across multiple repositories at once
5. **Permission migration**: Easy migration from OAuth to App

### **Technical Improvements**

1. **Server-side tokens**: Move token handling to backend
2. **GraphQL API**: Use GitHub's GraphQL for better performance
3. **Caching layer**: Cache installation and repository data
4. **Real-time sync**: Live updates of repository permissions
5. **Advanced security**: Implement additional security measures

This single repository access feature provides users with much better control and security over their repository data while maintaining the ease of use that CodeCraft is known for.