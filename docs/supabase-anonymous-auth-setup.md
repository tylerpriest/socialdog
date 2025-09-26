# Supabase Anonymous Authentication Setup Guide

## Overview
This guide walks you through enabling anonymous sign-ins in your Supabase project to support the guest login functionality.

## Steps to Enable Anonymous Authentication

### 1. Access Supabase Dashboard
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Log in to your account
3. Select your SocialDog project

### 2. Navigate to Authentication Settings
1. In the left sidebar, click on **Authentication**
2. Click on **Settings** (under Authentication)
3. You should see the **Auth Settings** page

### 3. Enable Anonymous Sign-ins
1. Scroll down to find the **Anonymous sign-ins** section
2. Toggle the switch to **Enable** anonymous sign-ins
3. Click **Save** to apply the changes

### 4. Configure Rate Limiting (Recommended)
1. In the same Auth Settings page, find **Rate Limiting**
2. Set **Anonymous sign-ins** rate limit to **30 requests per hour** (recommended)
3. Click **Save**

### 5. Enable Bot Protection (Highly Recommended)
To prevent abuse of anonymous sign-ins:

#### Option A: Cloudflare Turnstile (Free)
1. Go to [Cloudflare Turnstile](https://developers.cloudflare.com/turnstile/)
2. Create a free account and get your site key and secret key
3. In Supabase Auth Settings, find **CAPTCHA Protection**
4. Select **Cloudflare Turnstile**
5. Enter your site key and secret key
6. Click **Save**

#### Option B: hCaptcha (Alternative)
1. Go to [hCaptcha](https://www.hcaptcha.com/)
2. Create an account and get your site key and secret key
3. In Supabase Auth Settings, select **hCaptcha**
4. Enter your credentials
5. Click **Save**

### 6. Update RLS Policies (Already Done)
The RLS policies for anonymous users have already been created in our migration file:
- `supabase/migrations/004_guest_authentication.sql`

### 7. Test the Configuration
1. Run the development server: `npm run dev`
2. Go to the login page: `http://localhost:3000/auth/login`
3. Click "Continue as Guest" to test anonymous authentication

## Environment Variables
Make sure your environment variables are properly set:

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Security Considerations

### Rate Limiting
- **30 requests per hour per IP** is recommended for anonymous sign-ins
- This prevents abuse while allowing legitimate usage
- Can be adjusted based on your app's usage patterns

### Bot Protection
- **CAPTCHA is strongly recommended** to prevent automated abuse
- Anonymous users can create database records, so protection is crucial
- Monitor your database size regularly

### Session Management
- Guest sessions expire after 24 hours
- Automatic cleanup runs daily (configured in migration)
- Users are prompted to upgrade before session expires

### Database Monitoring
Monitor these metrics in your Supabase dashboard:
- Number of anonymous users created
- Database storage usage
- API request patterns
- Failed authentication attempts

## Troubleshooting

### "Anonymous sign-ins are disabled" Error
1. Verify anonymous sign-ins are enabled in Auth Settings
2. Check that you've saved the configuration
3. Wait a few minutes for changes to propagate
4. Clear browser cache and try again

### Rate Limit Exceeded
1. Check rate limiting settings in Auth Settings
2. Consider implementing client-side request throttling
3. Add user feedback for rate limit scenarios

### Database Size Growing Rapidly
1. Check cleanup function is running: `SELECT cleanup_expired_guest_profiles();`
2. Monitor guest user creation patterns
3. Consider stricter rate limiting
4. Ensure CAPTCHA is properly configured

## Next Steps After Enabling

1. **Test Guest Flow**: Verify the complete guest user journey
2. **Monitor Usage**: Watch for abuse patterns in the first few days
3. **Adjust Rate Limits**: Fine-tune based on actual usage
4. **User Feedback**: Gather feedback on the guest experience
5. **Analytics**: Track guest-to-permanent conversion rates

## Support
If you encounter issues:
1. Check Supabase documentation: [Anonymous Sign-ins](https://supabase.com/docs/guides/auth/auth-anonymous)
2. Verify all environment variables are correct
3. Check browser developer console for errors
4. Review Supabase project logs in the dashboard

## Configuration Checklist
- [ ] Anonymous sign-ins enabled in Supabase dashboard
- [ ] Rate limiting configured (30 requests/hour recommended)
- [ ] CAPTCHA protection enabled (Cloudflare Turnstile or hCaptcha)
- [ ] Environment variables properly set
- [ ] Database migration applied (`004_guest_authentication.sql`)
- [ ] Guest login tested on login page
- [ ] Account upgrade flow tested
- [ ] Session cleanup verified