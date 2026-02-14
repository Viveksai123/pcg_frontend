# Deploy Frontend to Vercel

This guide will help you deploy the Next.js frontend to Vercel.

## Prerequisites

1. A [Vercel account](https://vercel.com) (free tier available)
2. Your frontend code pushed to a Git repository (GitHub, GitLab, or Bitbucket)

## Environment Variables

These environment variables are already configured in `.env.local` and need to be set in Vercel:

| Variable | Description | Value |
|----------|-------------|-------|
| `NEXT_PUBLIC_API_URL` | Backend API URL (Render) | `https://backend-pcg.onrender.com` |
| `NEXT_PUBLIC_ML_API_URL` | ML API URL (Hugging Face) | `https://srujanreddynadipi-itsm-ai-api.hf.space` |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth client ID | `571075156881-i9isam8en6nbraglr1lk34a6j2rqi55u.apps.googleusercontent.com` |

## Deployment Methods

### Method 1: Using Vercel CLI (Terminal) - Recommended

#### 1. Install Vercel CLI

```bash
npm install -g vercel
```

#### 2. Login to Vercel

```bash
vercel login
```

Follow the prompts to authenticate (email or GitHub).

#### 3. Deploy

Navigate to your frontend directory and run:

```bash
cd pcg_frontend
vercel
```

**First-time deployment prompts:**
- Set up and deploy? **Yes**
- Which scope? **Select your account**
- Link to existing project? **No** (first time) or **Yes** (subsequent deploys)
- What's your project's name? **pcg-frontend** (or your choice)
- In which directory is your code located? **./
- Want to override the settings? **No**

#### 4. Set Environment Variables (First Deploy)

After initial deployment:

```bash
vercel env add NEXT_PUBLIC_API_URL
# Enter: https://backend-pcg.onrender.com
# Select: Production, Preview, Development

vercel env add NEXT_PUBLIC_ML_API_URL
# Enter: https://srujanreddynadipi-itsm-ai-api.hf.space
# Select: Production, Preview, Development

vercel env add NEXT_PUBLIC_GOOGLE_CLIENT_ID
# Enter: 571075156881-i9isam8en6nbraglr1lk34a6j2rqi55u.apps.googleusercontent.com
# Select: Production, Preview, Development
```

#### 5. Deploy to Production

```bash
vercel --prod
```

Your app will be live at: `https://your-project.vercel.app`

### Method 2: Using Vercel Dashboard (Web UI)

#### 1. Push Code to GitHub

Make sure your frontend code is committed and pushed:

```bash
cd pcg_frontend
git status
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

#### 2. Import Project on Vercel

1. Go to [https://vercel.com/new](https://vercel.com/new)
2. Click "Import Project"
3. Select your Git provider (GitHub)
4. Select the repository containing your frontend
5. Configure project:
   - **Project Name**: `pcg-frontend`
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `pcg_frontend` (if monorepo) or leave empty
   - **Build Command**: `npm run build` (auto-filled)
   - **Output Directory**: `.next` (auto-filled)

#### 3. Add Environment Variables

In the "Environment Variables" section, add:

```
NEXT_PUBLIC_API_URL = https://backend-pcg.onrender.com
NEXT_PUBLIC_ML_API_URL = https://srujanreddynadipi-itsm-ai-api.hf.space
NEXT_PUBLIC_GOOGLE_CLIENT_ID = 571075156881-i9isam8en6nbraglr1lk34a6j2rqi55u.apps.googleusercontent.com
```

#### 4. Deploy

Click "Deploy" and wait for the build to complete (2-5 minutes).

## Post-Deployment

### Get Your Frontend URL

After deployment, you'll get:
- **Production URL**: `https://pcg-frontend.vercel.app` (or your custom domain)
- **Preview URLs**: Automatic for every branch/PR

### Update Google OAuth Settings

Add your Vercel domain to Google Cloud Console:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to APIs & Services → Credentials
3. Select your OAuth 2.0 Client ID
4. Add to "Authorized JavaScript origins":
   ```
   https://your-project.vercel.app
   ```
5. Add to "Authorized redirect URIs":
   ```
   https://your-project.vercel.app
   ```

### Update Backend CORS

Update your backend's CORS configuration to allow your Vercel domain:

In `backend-pcg/app.js`, update:
```javascript
app.use(cors({
  origin: [
    'https://your-project.vercel.app',
    'http://localhost:3000'
  ],
  credentials: true
}));
```

Then redeploy your backend on Render.

## Continuous Deployment

Vercel automatically redeploys when you push to your connected branch:

```bash
git add .
git commit -m "Update frontend"
git push origin main
```

Vercel will:
- Build your project
- Run tests (if configured)
- Deploy to production
- Provide preview URLs for PRs

## Managing Deployments

### CLI Commands

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# List deployments
vercel ls

# View deployment logs
vercel logs <deployment-url>

# Remove deployment
vercel rm <deployment-url>

# View environment variables
vercel env ls

# Pull environment variables
vercel env pull
```

### Dashboard

- View deployments: https://vercel.com/dashboard
- Check analytics: View page views, performance metrics
- Monitor errors: Integrated error tracking
- View logs: Real-time build and function logs

## Custom Domain (Optional)

### Add Custom Domain

1. Go to Project Settings → Domains
2. Click "Add Domain"
3. Enter your domain (e.g., `myapp.com`)
4. Configure DNS records as instructed
5. Wait for SSL certificate (automatic)

### DNS Configuration

Vercel provides these records:
- **A Record**: Points to Vercel's IP
- **CNAME**: Points to `cname.vercel-dns.com`

## Performance Optimization

### Built-in Features

- **Image Optimization**: Automatic with `next/image`
- **Code Splitting**: Automatic with Next.js
- **Edge Network**: Global CDN with 100+ locations
- **Edge Functions**: Run code close to users
- **Caching**: Intelligent caching strategies

### Speed Insights

Enable Vercel Speed Insights:

```bash
npm install @vercel/speed-insights
```

Add to your layout:
```typescript
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
```

## Monitoring and Analytics

### Vercel Analytics

Track page views and user behavior:

```bash
npm install @vercel/analytics
```

```typescript
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### Error Tracking

View runtime errors in Vercel Dashboard:
- Real-time error monitoring
- Stack traces
- User context
- Performance impact

## Troubleshooting

### Build Fails

**Issue**: Build errors in Vercel

**Solution**:
```bash
# Test build locally first
npm run build

# Check for TypeScript errors
npm run lint

# View detailed build logs in Vercel dashboard
```

### Environment Variables Not Working

**Issue**: API calls failing in production

**Solution**:
1. Verify environment variables are set in Vercel
2. Ensure they start with `NEXT_PUBLIC_` for client-side access
3. Redeploy after adding variables
4. Check browser console for values

### CORS Errors

**Issue**: Backend requests failing from Vercel

**Solution**:
1. Add Vercel URL to backend CORS origins
2. Update and redeploy backend
3. Check browser network tab for errors

### Google OAuth Errors

**Issue**: Google Sign-In 403 redirect_uri_mismatch

**Solution**:
1. Add Vercel URL to Google Cloud Console authorized origins
2. Add callback URL to authorized redirect URIs
3. Wait 5 minutes for Google to propagate changes

### Slow Cold Starts

**Issue**: First load is slow

**Solution**:
- Upgrade to Pro plan for faster edge network
- Implement loading states
- Use ISR or SSG where possible
- Enable middleware for critical paths

## Environment-Specific Deploys

### Preview Deployments

Every branch and PR gets a unique URL:
- Automatic builds
- Isolated environment
- Share with team for review

### Production vs Preview

- **Production**: `main` branch → `your-project.vercel.app`
- **Preview**: Other branches → `your-project-git-branch.vercel.app`
- **Development**: Local → `localhost:3000`

## Security Best Practices

1. **Environment Variables**: Never commit secrets
2. **API Routes**: Use server-side API routes for sensitive operations
3. **CORS**: Restrict to known domains
4. **Rate Limiting**: Implement for API routes
5. **HTTPS**: Automatic on Vercel
6. **CSP Headers**: Configure in `next.config.js`

## Scaling

### Free Tier Limits
- 100 GB bandwidth/month
- 100 builds/day
- 6000 build minutes/month
- Unlimited personal projects

### Pro Tier ($20/month)
- 1 TB bandwidth
- Faster builds
- Priority support
- Advanced analytics
- Password protection

## Testing Before Deploy

```bash
# Build locally
npm run build

# Test production build
npm start

# Check for errors
npm run lint

# Type check (TypeScript)
npx tsc --noEmit
```

## Rollback

If a deployment has issues:

```bash
# Via CLI
vercel rollback

# Via Dashboard
1. Go to Deployments
2. Find working version
3. Click "..." → "Promote to Production"
```

## Support

- Vercel Docs: https://vercel.com/docs
- Community: https://github.com/vercel/vercel/discussions
- Status: https://vercel-status.com

## Next Steps

1. ✅ Deploy frontend to Vercel
2. Configure custom domain (optional)
3. Set up monitoring and analytics
4. Configure error tracking
5. Optimize performance
6. Set up preview environments for testing

## Resources

- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Custom Domains](https://vercel.com/docs/custom-domains)
- [Vercel CLI](https://vercel.com/docs/cli)
