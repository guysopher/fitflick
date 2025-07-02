# 🚀 Vercel Deployment Fix Guide

Your app is experiencing authentication errors in production on Vercel. Here's how to fix them:

## 🔧 **Root Cause**

The 500 errors on `/api/auth/*` endpoints are caused by missing or incorrect environment variables in your Vercel deployment.

## ✅ **Required Environment Variables**

You need to set these in your Vercel dashboard:

### **1. NextAuth Configuration**
```bash
NEXTAUTH_SECRET=your-random-32-character-secret-here
NEXTAUTH_URL=https://your-app-name.vercel.app
```

### **2. Google OAuth Credentials**
```bash
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### **3. Database Connection**
```bash
POSTGRES_URL=your-vercel-postgres-connection-string
```

### **4. Optional API Keys** (for full functionality)
```bash
OPENAI_API_KEY=your-openai-api-key
ELEVENLABS_API_KEY=your-elevenlabs-api-key
```

## 🛠️ **How to Set Environment Variables in Vercel**

### **Method 1: Vercel Dashboard**
1. Go to [vercel.com](https://vercel.com)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add each variable with the correct values
5. Select **Production**, **Preview**, and **Development** environments
6. Click **Save**

### **Method 2: Vercel CLI**
```bash
# Set each variable
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL
vercel env add GOOGLE_CLIENT_ID
vercel env add GOOGLE_CLIENT_SECRET
vercel env add POSTGRES_URL
```

## 🔑 **Generating Required Values**

### **NEXTAUTH_SECRET**
Generate a secure random string:
```bash
# Option 1: Use openssl
openssl rand -base64 32

# Option 2: Use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Option 3: Online generator
# Visit: https://generate-secret.now.sh/32
```

### **NEXTAUTH_URL**
Set to your production URL:
```bash
NEXTAUTH_URL=https://fitflick-gamma.vercel.app
```
*Replace with your actual Vercel app URL*

### **Google OAuth Setup**
If you haven't set up Google OAuth yet:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Set **Authorized redirect URIs**:
   ```
   https://your-app-name.vercel.app/api/auth/callback/google
   ```
6. Copy the **Client ID** and **Client Secret**

## 🗄️ **Database Setup**

### **Option 1: Vercel Postgres (Recommended)**
1. In Vercel dashboard, go to **Storage** tab
2. Create **Postgres** database
3. Copy the connection string
4. Set as `POSTGRES_URL` environment variable

### **Option 2: External Database**
Set your existing database connection string:
```bash
POSTGRES_URL=postgresql://username:password@host:port/database
```

## 🚀 **Deployment Steps**

1. **Set all environment variables** in Vercel dashboard
2. **Redeploy your app**:
   ```bash
   # Trigger a new deployment
   git commit --allow-empty -m "Trigger redeploy with env vars"
   git push
   ```
   
   Or use Vercel CLI:
   ```bash
   vercel --prod
   ```

3. **Check the deployment logs** for any remaining errors

## 🐛 **Debugging**

### **Check Environment Variables**
Visit this URL to verify your configuration:
```
https://your-app-name.vercel.app/api/auth/providers
```

If it returns providers info instead of 500 error, auth is working!

### **Check Vercel Function Logs**
1. Go to Vercel dashboard
2. Select your project
3. Go to **Functions** tab
4. Click on failing functions to see detailed logs

### **Local Testing**
Test locally with production-like environment:
```bash
# Create .env.local with production values
cp .env.local.example .env.local

# Add your production environment variables
# Then test locally
npm run build
npm start
```

## ⚡ **Quick Fix Checklist**

- [ ] `NEXTAUTH_SECRET` is set (32+ characters)
- [ ] `NEXTAUTH_URL` matches your production URL
- [ ] `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are correct
- [ ] `POSTGRES_URL` is valid and accessible
- [ ] Google OAuth redirect URI includes your production domain
- [ ] All environment variables are set for **Production** environment
- [ ] App has been redeployed after setting variables

## 🎯 **Expected Result**

After fixing the environment variables, you should see:
- ✅ `/api/auth/session` returns session data or null
- ✅ `/api/auth/providers` returns Google provider info
- ✅ `/api/auth/signin` works for Google OAuth
- ✅ No more 500 errors in Vercel function logs

## 📞 **Still Having Issues?**

1. **Check Vercel function logs** for specific error messages
2. **Verify Google Cloud Console** OAuth settings
3. **Test database connection** separately
4. **Compare local vs production** environment variables

The authentication system now has better error handling and will gracefully degrade if configuration is missing, but for full functionality, all environment variables must be properly set.

---

**Need Help?** The app now includes better logging to help debug issues. Check your Vercel function logs for detailed error information. 