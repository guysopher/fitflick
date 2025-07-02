# Google OAuth Setup Guide

To enable Google login for your FitFlick app, you need to set up Google OAuth credentials and create environment variables.

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API for your project

## Step 2: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth 2.0 Client IDs**
3. Configure the consent screen if prompted:
   - Application name: `FitFlick`
   - User support email: Your email
   - Developer contact information: Your email
4. For **Application type**, select **Web application**
5. Add these **Authorized redirect URIs**:
   - `http://localhost:3000/api/auth/callback/google` (for development)
   - `https://yourdomain.com/api/auth/callback/google` (for production)

## Step 3: Create Environment Variables

Create a `.env.local` file in your project root with:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_from_step_2
GOOGLE_CLIENT_SECRET=your_google_client_secret_from_step_2

# NextAuth Secret - Generate with: openssl rand -base64 32
NEXTAUTH_SECRET=your_generated_secret_here

# NextAuth URL
NEXTAUTH_URL=http://localhost:3000
```

## Step 4: Generate NextAuth Secret

Run this command to generate a secure secret:

```bash
openssl rand -base64 32
```

Copy the output and use it as your `NEXTAUTH_SECRET`.

## Step 5: Test the Setup

1. Start your development server: `npm run dev`
2. Visit `http://localhost:3000`
3. You should be redirected to the login page
4. Click "Continue with Google" to test the authentication

## Production Deployment

For production:
1. Update `NEXTAUTH_URL` to your production domain
2. Add your production domain to the authorized redirect URIs in Google Cloud Console
3. Make sure all environment variables are set in your hosting platform

## Troubleshooting

- **Redirect URI mismatch**: Make sure the redirect URI in Google Cloud Console exactly matches your domain
- **Client ID not found**: Double-check your `GOOGLE_CLIENT_ID` environment variable
- **Invalid client secret**: Verify your `GOOGLE_CLIENT_SECRET` environment variable
- **NextAuth errors**: Ensure `NEXTAUTH_SECRET` is set and `NEXTAUTH_URL` matches your domain

## Security Notes

- Never commit `.env.local` to version control
- Use strong, unique secrets for production
- Regularly rotate your OAuth credentials
- Limit OAuth scope to only what you need 