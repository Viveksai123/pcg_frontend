# TicketHub Frontend - Implementation Guide

## Overview

TicketHub is an AI-powered ticket management system built with Next.js. This guide explains the architecture, how to run the application, and how to integrate it with your backend services.

## Project Structure

```
├── app/
│   ├── page.tsx                 # Home page
│   ├── login/page.tsx           # Login page
│   ├── signup/page.tsx          # Signup page
│   ├── dashboard/page.tsx       # Dashboard
│   ├── tickets/
│   │   ├── page.tsx             # Tickets listing
│   │   ├── create/page.tsx      # Create ticket
│   │   └── [id]/page.tsx        # Ticket details
│   ├── notifications/page.tsx   # Notifications
│   ├── layout.tsx               # Root layout with providers
│   └── globals.css              # Global styles
├── components/
│   ├── auth/
│   │   ├── google-login.tsx     # Google OAuth component
│   │   └── protected-route.tsx  # Route protection wrapper
│   ├── layout/
│   │   ├── navbar.tsx           # Navigation bar
│   │   └── footer.tsx           # Footer
│   └── ui/                      # shadcn/ui components
├── lib/
│   ├── config.ts                # API configuration
│   ├── types.ts                 # TypeScript interfaces
│   ├── api.ts                   # API client classes
│   └── auth-context.tsx         # Authentication context
├── hooks/
│   └── use-tickets.ts           # Tickets management hook
├── BACKEND_INTEGRATION.md       # Backend API specification
└── IMPLEMENTATION_GUIDE.md      # This file

```

## Key Features

### 1. Authentication
- Email/password login and signup
- Google OAuth integration
- JWT token-based authentication
- Persistent user sessions with localStorage
- Protected routes

### 2. Ticket Management
- Create tickets with title, description, and priority
- View all tickets with filtering by status and priority
- Search tickets by title or description
- Mark tickets as pending or resolved
- View detailed ticket information

### 3. AI Integration
- Automatic ticket categorization using ML model
- Display confidence scores for predictions
- Show alternative category possibilities
- Store ML predictions with tickets

### 4. User Interface
- Modern dark theme design
- Responsive layout for mobile and desktop
- Real-time status updates
- Organized navigation and notifications
- Professional footer

## Getting Started

### Prerequisites

- Node.js 18+ (16+ recommended)
- npm or pnpm package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd tickethub-frontend
```

2. Install dependencies:
```bash
pnpm install
# or
npm install
```

3. Create `.env.local` file with environment variables:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_ML_API_URL=http://localhost:8000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
```

### Running the Application

Start the development server:
```bash
pnpm dev
# or
npm run dev
```

The application will be available at `http://localhost:3000`

### Building for Production

```bash
pnpm build
pnpm start
# or
npm run build
npm start
```

## Architecture

### Authentication Flow

1. User enters credentials or uses Google OAuth
2. Frontend sends request to backend authentication endpoint
3. Backend validates credentials and returns JWT token
4. Frontend stores token in localStorage and context
5. Token is included in Authorization header for subsequent API calls
6. Token is validated on protected routes

### Ticket Creation Flow

1. User fills ticket form with title, description, and priority
2. User clicks "Get AI Prediction" button
3. Frontend sends description to ML service `/predict` endpoint
4. ML service returns predicted category and confidence scores
5. User can review prediction and create ticket
6. Frontend sends ticket data including ML results to backend
7. Backend stores ticket with categorization information
8. User is redirected to tickets listing

### Ticket Management Flow

1. User views tickets with filtering options
2. Frontend fetches all tickets from backend
3. User can filter by status (pending/resolved) or priority
4. User can search tickets by title or description
5. Clicking on ticket shows detailed view
6. User can update ticket status on detail page
7. Changes are persisted in backend

## API Integration

### Setting Up API Client

The application uses a centralized API client (`lib/api.ts`) that handles:
- Base URL configuration
- Authorization token management
- Request/response handling
- Error management

### Making API Calls

Example usage in components:

```typescript
import { apiClient, API_ENDPOINTS } from '@/lib/config';

// Login
const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, {
  email: 'user@example.com',
  password: 'password123'
});

// Get tickets
const response = await apiClient.get(API_ENDPOINTS.TICKETS.GET_ALL);

// Create ticket
const response = await apiClient.post(API_ENDPOINTS.TICKETS.CREATE, {
  title: 'Issue title',
  description: 'Issue description',
  priority: 'high'
});
```

### Authentication Context

The `AuthContext` provides authentication state management:

```typescript
import { useAuth } from '@/lib/auth-context';

export function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  return (
    <div>
      {isAuthenticated && <p>Welcome, {user?.name}</p>}
    </div>
  );
}
```

## Backend Requirements

Your backend should implement the following endpoints. Detailed specifications are in `BACKEND_INTEGRATION.md`:

### Authentication
- `POST /auth/login`
- `POST /auth/signup`
- `POST /auth/google-login`
- `GET /auth/profile`
- `POST /auth/logout`

### Tickets
- `POST /tickets/create`
- `GET /tickets`
- `GET /tickets/:id`
- `PUT /tickets/:id`
- `GET /tickets/status/:status`
- `DELETE /tickets/:id`

### ML Service
- `POST /predict` (on port 8000)

## Environment Configuration

### Development
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_ML_API_URL=http://localhost:8000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=dev_google_client_id
```

### Production
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_ML_API_URL=https://ml.yourdomain.com
NEXT_PUBLIC_GOOGLE_CLIENT_ID=prod_google_client_id
```

## Development Workflow

### Adding New Pages

1. Create file in appropriate directory under `app/`
2. Import `useAuth` for authentication checks
3. Wrap component in `ProtectedRoute` if needed
4. Use `useRouter` for navigation

### Adding New API Endpoints

1. Add endpoint to `lib/config.ts`
2. Update `lib/types.ts` with request/response types
3. Add methods to `lib/api.ts` if needed
4. Import and use in components via `apiClient`

### Styling

- Uses Tailwind CSS for styling
- Dark theme with slate colors as base
- Blue (#0066cc) as primary accent color
- Responsive design with mobile-first approach
- Component library from shadcn/ui

## Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically on git push

### Docker Deployment

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t tickethub-frontend .
docker run -p 3000:3000 tickethub-frontend
```

## Troubleshooting

### Common Issues

1. **CORS errors**
   - Ensure backend has CORS headers configured
   - Check API URLs in environment variables

2. **Auth token not persisting**
   - Verify localStorage is enabled in browser
   - Check JWT token expiration time

3. **ML predictions failing**
   - Verify ML service is running on port 8000
   - Check ML API URL in environment

4. **Blank page on load**
   - Check browser console for errors
   - Verify environment variables are set
   - Check backend service availability

## Support

For issues or questions:
1. Check the Backend Integration guide
2. Review environment variable setup
3. Verify backend service endpoints
4. Check browser console for error messages

## License

[Your License Here]
