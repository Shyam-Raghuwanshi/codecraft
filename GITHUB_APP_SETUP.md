# GitHub App Setup Guide

## 🚨 **Current Issue**

You're getting a 404 error because the GitHub App "CodeCraft" doesn't exist yet. The URL `https://github.com/apps/codecraft/installations/new` is looking for an app that hasn't been created.

## ✅ **Solution: Create GitHub App**

Follow these steps to create your GitHub App and enable single repository access:

### **Step 1: Create GitHub App**

1. **Go to GitHub Developer Settings**:
   ```
   https://github.com/settings/apps
   ```

2. **Click "New GitHub App"**

3. **Fill in the App Details**:
   - **GitHub App name**: `CodeCraft` (or `CodeCraft-YourUsername` if taken)
   - **Description**: `AI-powered code review and error tracking for GitHub repositories`
   - **Homepage URL**: `http://localhost:5173`
   - **User authorization callback URL**: `http://localhost:5173/github-callback`
   - **Setup URL (optional)**: `http://localhost:5173/github-installation-callback`
   - **Webhook URL**: Leave empty for now
   - **Webhook secret**: Leave empty for now

### **Step 2: Set Permissions**

Configure these **Repository permissions**:
- **Contents**: `Read` (to analyze code)
- **Metadata**: `Read` (to get repository information)
- **Pull requests**: `Read` (to analyze PRs)
- **Issues**: `Read` (optional, for issue tracking)

**Account permissions**: None required

### **Step 3: Get Your App ID**

1. **After creating the app**, you'll see the App details page
2. **Copy the App ID** (it's a number like `123456`)
3. **Add it to your environment file**:

```bash
# Open your .env.local file and add:
VITE_GITHUB_APP_ID=123456  # Replace with your actual App ID
```

### **Step 4: Test the Installation**

1. **Restart your development server**:
   ```bash
   npm run dev
   ```

2. **Try the "Install GitHub App" option** - it should now work!

## 🔧 **Current Workaround**

Until you create the GitHub App, you can use the **OAuth Login** option which is already configured and working with your existing credentials.

## 📋 **Complete Environment Setup**

Your `.env.local` should look like this:

```bash
# Existing OAuth App (already working)
VITE_GITHUB_CLIENT_ID=Ov23liw0WWD0S6ELUnDB
VITE_GITHUB_CLIENT_SECRET=cc9a56ab9fbd9798da137923f4f9145e937539cd

# New GitHub App (add this after creating the app)
VITE_GITHUB_APP_ID=your_actual_app_id_here

# Other existing variables...
VITE_CONVEX_URL=https://whimsical-greyhound-524.convex.cloud
VITE_CLERK_PUBLISHABLE_KEY=pk_test_c3Rhci1zbHVnLTU1LmNsZXJrLmFjY291bnRzLmRldiQ
# ... etc
```

## 🎯 **What Happens Next**

Once you create the GitHub App:

1. **Single Repository Access** will be available
2. **Users can choose specific repositories** to grant access to
3. **More secure and granular permissions**
4. **Better user trust and adoption**

## 🔄 **Alternative: Use OAuth for Now**

If you want to test the functionality immediately:

1. **Click "OAuth Login"** instead of "Install GitHub App"
2. **This uses your existing OAuth credentials** 
3. **Works immediately** with full repository access
4. **You can add GitHub App later**

## 🛠 **Development Notes**

The app automatically detects if the GitHub App ID is configured:
- **✅ If configured**: Shows "Install GitHub App" button
- **⚠️ If not configured**: Shows "Setup Required" with instructions
- **✅ OAuth always available**: As a fallback option

## 📞 **Need Help?**

If you run into issues:

1. **Check GitHub App name** - it must be unique across all of GitHub
2. **Verify callback URLs** - they must match exactly
3. **Check permissions** - make sure you have the required repository permissions
4. **App ID format** - it should be just numbers, no quotes or extra characters

Try creating the GitHub App and let me know if you need help with any of the steps!