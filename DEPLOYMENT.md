# SkillSwap Deployment Guide for Render

## 🚀 Deploying to Render

### Prerequisites
1. GitHub repository with your SkillSwap code
2. Supabase project set up
3. Render account

### Step 1: Prepare Your Repository

1. **Push your code to GitHub** (if not already done):
   ```bash
   git add .
   git commit -m "Add launch-ready features for SkillSwap"
   git push origin main
   ```

2. **Create environment variables file** (`.env.example`):
   ```env
   # Supabase Configuration
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # Optional: Analytics
   # VITE_GOOGLE_ANALYTICS_ID=your_ga_id
   ```

### Step 2: Set Up Supabase Database

1. **Go to your Supabase project dashboard**
2. **Run the database schema**:
   - Go to SQL Editor in Supabase
   - Copy and paste the contents of `supabase/schema.sql`
   - Execute the script to create all tables and policies

3. **Configure Authentication**:
   - Go to Authentication > Settings
   - Add your Render domain to "Site URL" and "Redirect URLs"
   - Example: `https://your-app-name.onrender.com`

### Step 3: Deploy to Render

1. **Create a new Web Service**:
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure the service**:
   - **Name**: `skillswap` (or your preferred name)
   - **Environment**: `Static Site`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

3. **Set Environment Variables**:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key

4. **Advanced Settings**:
   - **Node Version**: `18` (or latest LTS)
   - **Auto-Deploy**: `Yes` (for automatic deployments on git push)

### Step 4: Configure Custom Domain (Optional)

1. **Add Custom Domain**:
   - Go to your service settings
   - Click "Custom Domains"
   - Add your domain (e.g., `skillswap.com`)

2. **Update Supabase Settings**:
   - Update Site URL and Redirect URLs in Supabase
   - Add your custom domain

### Step 5: Post-Deployment Setup

1. **Test the deployment**:
   - Visit your Render URL
   - Test user registration and login
   - Verify all features work correctly

2. **Set up monitoring**:
   - Enable Render's built-in monitoring
   - Set up uptime monitoring
   - Configure error tracking

### Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous key | Yes |
| `VITE_GOOGLE_ANALYTICS_ID` | Google Analytics tracking ID | No |
| `VITE_MIXPANEL_TOKEN` | Mixpanel tracking token | No |

### Render Configuration Files

The project includes:
- `render.yaml` - Render deployment configuration
- `vite.config.ts` - Vite build configuration
- `package.json` - Dependencies and scripts

### Troubleshooting

**Common Issues:**

1. **Build Fails**:
   - Check Node.js version (use 18+)
   - Verify all dependencies are in `package.json`
   - Check build logs in Render dashboard

2. **Environment Variables Not Working**:
   - Ensure variables start with `VITE_`
   - Check variable names match exactly
   - Redeploy after adding new variables

3. **Database Connection Issues**:
   - Verify Supabase URL and key are correct
   - Check RLS policies are set up
   - Ensure database schema is deployed

4. **Authentication Issues**:
   - Update Supabase redirect URLs
   - Check Site URL configuration
   - Verify CORS settings

### Performance Optimization

1. **Enable Caching**:
   - Static assets are cached for 1 year
   - Service worker handles offline functionality

2. **Monitor Performance**:
   - Use Render's built-in metrics
   - Set up Google Analytics for user behavior
   - Monitor Core Web Vitals

### Security Considerations

1. **Environment Variables**:
   - Never commit `.env` files
   - Use Render's environment variable system
   - Rotate keys regularly

2. **Database Security**:
   - RLS policies are enabled on all tables
   - API keys are properly scoped
   - Regular security audits recommended

### Scaling Considerations

1. **Database**:
   - Supabase handles scaling automatically
   - Monitor usage and upgrade plan as needed

2. **Static Site**:
   - Render's CDN handles global distribution
   - No server-side scaling needed

3. **Monitoring**:
   - Set up alerts for downtime
   - Monitor user growth and performance

### Support

- **Render Documentation**: https://render.com/docs
- **Supabase Documentation**: https://supabase.com/docs
- **Vite Documentation**: https://vitejs.dev/guide/

---

## 🎉 Your SkillSwap app should now be live on Render!

Visit your deployed URL and start trading skills with the world!
