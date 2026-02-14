# TicketHub - Quick Start Guide

## Installation & Setup (5 minutes)

### 1. Install Dependencies
```bash
cd tickethub-frontend
pnpm install
```

### 2. Configure Environment
Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_ML_API_URL=http://localhost:8000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

### 3. Start Development Server
```bash
pnpm dev
```
Application runs at: `http://localhost:3000`

## Page Routes

| Route | Purpose | Auth Required |
|-------|---------|---|
| `/` | Landing page | No |
| `/login` | Login page | No |
| `/signup` | Signup page | No |
| `/dashboard` | Main dashboard | Yes |
| `/tickets` | All tickets list | Yes |
| `/tickets/create` | Create new ticket | Yes |
| `/tickets/:id` | Ticket details | Yes |
| `/notifications` | Notifications center | Yes |

## Common Development Tasks

### Add a New API Endpoint

1. Add to `/lib/config.ts`:
```typescript
export const API_ENDPOINTS = {
  NEW_FEATURE: '/endpoint-path',
};
```

2. Add type in `/lib/types.ts`:
```typescript
export interface NewFeature {
  id: string;
  // ... properties
}
```

3. Use in component:
```typescript
import { apiClient, API_ENDPOINTS } from '@/lib/config';

const response = await apiClient.get(API_ENDPOINTS.NEW_FEATURE);
```

### Create Protected Page

```typescript
'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (!isAuthenticated) return null;

  return <main>{/* Your content */}</main>;
}
```

### Use Authentication

```typescript
import { useAuth } from '@/lib/auth-context';

export default function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();

  return (
    <>
      {isAuthenticated ? (
        <p>Welcome, {user?.name}</p>
      ) : (
        <p>Please log in</p>
      )}
    </>
  );
}
```

### Make API Calls

```typescript
import { apiClient, API_ENDPOINTS } from '@/lib/config';

// GET request
const response = await apiClient.get('/endpoint');

// POST request
const response = await apiClient.post('/endpoint', data);

// PUT request
const response = await apiClient.put('/endpoint', updatedData);

// DELETE request
const response = await apiClient.delete('/endpoint');
```

### Use Tickets Hook

```typescript
import { useTickets } from '@/hooks/use-tickets';

export default function TicketsComponent() {
  const { isLoading, error, getAllTickets, createTicket } = useTickets();

  return (
    // Your component
  );
}
```

## Styling Guide

### Colors
```css
/* Primary */
@apply bg-blue-600 text-blue-400

/* Neutral */
@apply bg-slate-800 text-slate-300

/* Status */
@apply text-green-400   /* Success/Resolved */
@apply text-yellow-400  /* Warning/Pending */
@apply text-red-400     /* Error */
```

### Common Patterns
```tsx
/* Card */
<Card className="bg-slate-800 border-slate-700 p-6">

/* Button Primary */
<Button className="bg-blue-600 hover:bg-blue-700 text-white">

/* Input */
<Input className="bg-slate-700 border-slate-600 text-white" />

/* Container */
<div className="max-w-4xl mx-auto px-4 py-12">

/* Grid */
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
```

## Backend Requirements Checklist

- [ ] `/auth/login` endpoint implemented
- [ ] `/auth/signup` endpoint implemented
- [ ] `/auth/google-login` endpoint implemented
- [ ] `/auth/profile` endpoint implemented
- [ ] `/auth/logout` endpoint implemented
- [ ] `/tickets/create` endpoint implemented
- [ ] `/tickets` endpoint implemented (GET all)
- [ ] `/tickets/:id` endpoint implemented (GET one)
- [ ] `/tickets/:id` endpoint implemented (PUT)
- [ ] `/tickets/status/:status` endpoint implemented
- [ ] `/tickets/:id` endpoint implemented (DELETE)
- [ ] JWT token generation and validation
- [ ] CORS configured for frontend domain
- [ ] ML service running on port 8000

## ML Service Requirements

- Service running on `http://localhost:8000`
- `/predict` endpoint accepts `{"text": "string"}`
- Returns response with:
  - `predicted_class`: string
  - `confidence_scores`: object
  - `processed_text`: string
  - `timestamp`: string

## Testing the Integration

### 1. Test Authentication
```bash
# Visit http://localhost:3000/login
# Try: email@test.com / password123
```

### 2. Test Ticket Creation
```bash
# Navigate to /tickets/create
# Fill form and click "Get AI Prediction"
# Verify ML predictions show correctly
```

### 3. Test Ticket Listing
```bash
# Navigate to /tickets
# Use filters to search/sort
# Click on ticket to view details
```

### 4. Test Notifications
```bash
# Navigate to /notifications
# Mark notifications as read
# Filter between read/unread
```

## Troubleshooting

### "Cannot GET /"
- Backend not running on port 3000
- Check `NEXT_PUBLIC_API_URL` environment variable

### "ML predictions failing"
- ML service not running on port 8000
- Check `NEXT_PUBLIC_ML_API_URL` environment variable
- Verify ML service endpoint path

### "Login not working"
- Backend authentication endpoints not implemented
- Check JWT token generation
- Verify CORS configuration

### "Blank page"
- Check browser console for errors
- Verify environment variables set
- Check all services running

## Useful Commands

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run linter

# With npm
npm run dev
npm run build
npm start
npm run lint
```

## File Locations Quick Reference

| Task | File |
|------|------|
| Change API endpoints | `/lib/config.ts` |
| Update types | `/lib/types.ts` |
| Modify auth logic | `/lib/auth-context.tsx` |
| Edit navbar | `/components/layout/navbar.tsx` |
| Edit footer | `/components/layout/footer.tsx` |
| Change theme colors | `/app/globals.css` + `tailwind.config.ts` |
| Add new page | `/app/[name]/page.tsx` |

## Deployment Quick Steps

### Deploy to Vercel
```bash
# 1. Push to GitHub
git push origin main

# 2. Connect to Vercel
# - Go to vercel.com
# - Connect repository
# - Set environment variables
# - Deploy
```

### Deploy to Other Platforms
1. Build: `pnpm build`
2. Set environment variables
3. Run production: `pnpm start`
4. Set port: `PORT=3000`

## Getting Help

1. Check `BACKEND_INTEGRATION.md` for API specs
2. Check `IMPLEMENTATION_GUIDE.md` for detailed setup
3. Review `PROJECT_SUMMARY.md` for overview
4. Check browser console for error messages
5. Verify all services (frontend, backend, ML) running

---

**Ready to start?**  
Run `pnpm dev` and visit `http://localhost:3000`
