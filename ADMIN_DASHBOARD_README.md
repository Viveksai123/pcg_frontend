# Admin Dashboard Documentation

## Overview
The Admin Dashboard is a comprehensive management interface for your AI-Driven Intelligent Ticketing system. It provides powerful tools for monitoring, analytics, configuration, and feedback management.

## Access Control
The dashboard is protected with role-based access control. Only users with admin privileges can access these features.

### Adding Admin Users
To grant admin access, add the user's email to the admin list:

1. Open `pcg_frontend/lib/admin-auth.ts`
2. Add the email to the `ADMIN_EMAILS` array:
```typescript
const ADMIN_EMAILS = [
  'admin@company.com',
  'your-email@company.com',  // Add your email here
];
```

### Future: Backend Role Management
When your backend supports user roles, update the `checkAdminRole` function in `admin-auth.ts` to check the `role` field from the user object.

## Dashboard Pages

### 1. Dashboard Overview (`/admin`)
- **Real-time Statistics**: View total tickets, open tickets, closed tickets, and high-priority alerts
- **Performance Metrics**: Monitor average resolution time, satisfaction scores, and weekly trends
- **Recent Activity**: See the latest ticket activities and system events

### 2. Tickets Management (`/admin/tickets`)
- **Complete Ticket List**: View all tickets in the system with detailed information
- **Advanced Filtering**: Filter by status, priority, category, and search by keywords
- **Bulk Actions**: Export tickets to CSV for reporting
- **Ticket Details**: View comprehensive ticket information including ML classification data
- **Real-time Updates**: Refresh data to see the latest ticket status

### 3. Analytics & Insights (`/admin/analytics`)
- **Trends Analysis**: 
  - Daily ticket volume visualization
  - Category distribution charts
  - Priority distribution breakdown
- **Pattern Detection**:
  - Top recurring issues
  - Noisy alert sources
  - Incident patterns
- **Performance Metrics**:
  - Average resolution time
  - First response time
  - SLA compliance rate
  - Ticket reopen rate
- **Forecasting**:
  - Predicted ticket volume for next week
  - Trend analysis (increasing/stable/decreasing)
  - Confidence scores on predictions

### 4. Routing Configuration (`/admin/routing`)
- **Resolver Groups Management**:
  - View all resolver teams
  - See team capacity and response times
  - Manage team categories and assignments
- **Routing Rules**:
  - Create intelligent routing rules
  - Set confidence thresholds
  - Map categories and priorities to resolver groups
  - Enable/disable rules dynamically
- **Rule Configuration**:
  - Category-based routing
  - Priority-based routing
  - Keyword matching
  - Confidence threshold settings

### 5. Audit Trail (`/admin/audit`)
- **Complete Decision Log**: Track every AI decision made by the system
- **Decision Transparency**:
  - View input data, output predictions, and confidence scores
  - See processing time for each decision
  - Track model versions used
- **Feedback Tracking**: See which decisions received user feedback
- **Filtering Options**:
  - Filter by decision type (classification, routing, priority, duplicate detection)
  - Filter by feedback status
  - Search by ticket ID or action
- **Export Capabilities**: Download audit logs in CSV format for compliance

### 6. Feedback Management (`/admin/feedback`)
- **Human Corrections**: Review corrections submitted by users
- **Feedback Processing**:
  - Accept or reject user feedback
  - Apply corrections to improve ML models
  - Add reviewer notes
- **Learning Insights**:
  - See model accuracy improvements
  - Track areas needing improvement
  - Monitor retrain schedule
- **Feedback Statistics**:
  - Total feedback count
  - Acceptance rate
  - Pending reviews
  - Model retrain history

## API Integration

### Backend Configuration
The admin dashboard connects to your backend-pcg API. Configure the backend URL in your environment:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

### API Endpoints Used
The dashboard uses the following backend endpoints:
- `GET /api/tickets` - Fetch all tickets
- `GET /api/tickets/:id` - Get ticket details
- `PUT /api/tickets/:id` - Update ticket
- `DELETE /api/tickets/:id` - Delete ticket

### Extending with Custom Endpoints
To add new admin features:

1. Add API functions in `lib/admin-api.ts`
2. Use the `fetchWithAuth` helper for authenticated requests
3. Handle errors gracefully with try-catch blocks

Example:
```typescript
export async function getCustomData() {
  try {
    return await fetchWithAuth('/api/admin/custom-endpoint');
  } catch (error) {
    console.error('Failed to fetch custom data:', error);
    return null;
  }
}
```

## Features & Capabilities

### 📊 Real-time Monitoring
- Live ticket statistics
- Performance metrics
- System health indicators

### 🔍 Advanced Analytics
- Trend analysis and forecasting
- Pattern detection
- Issue prioritization insights

### ⚙️ Configuration Management
- Routing rules setup
- Resolver group management
- Dynamic rule activation/deactivation

### 📝 Complete Audit Trail
- Every AI decision logged
- Full transparency and explainability
- Compliance-ready audit logs

### 🎯 Feedback Loop
- Human-in-the-loop corrections
- Continuous model improvement
- Track learning progress

### 🎨 Modern UI/UX
- Dark theme optimized for long sessions
- Responsive design for all screen sizes
- Intuitive navigation with collapsible sidebar
- Real-time data updates

## Navigation

The sidebar provides quick access to all admin features:
- **Overview** - Dashboard home
- **Tickets** - Ticket management
- **Analytics** - Insights and trends
- **Routing** - Configuration
- **Audit Trail** - Decision logs
- **Feedback** - Human corrections

The sidebar can be collapsed for more screen space by clicking the chevron button.

## Best Practices

1. **Regular Monitoring**: Check the dashboard daily for high-priority tickets and system alerts
2. **Review Feedback**: Process pending feedback weekly to improve AI accuracy
3. **Analyze Trends**: Use analytics to identify recurring issues and optimize resources
4. **Update Routing**: Review and adjust routing rules based on team performance
5. **Export Audits**: Regularly export audit trails for compliance and reporting

## Troubleshooting

### Dashboard Not Loading
- Check if you're logged in
- Verify your email is in the admin list
- Check browser console for errors

### Data Not Showing
- Ensure backend API is running on the correct port
- Check NEXT_PUBLIC_BACKEND_URL environment variable
- Verify authentication token is valid

### Permission Denied
- Confirm your email is added to ADMIN_EMAILS in `admin-auth.ts`
- Try logging out and logging back in
- Clear browser cache and cookies

## Future Enhancements

When extending the admin dashboard, consider:
- **Real-time Updates**: Implement WebSocket for live data
- **Advanced Filtering**: Add date range filters and custom queries
- **Batch Operations**: Enable bulk ticket updates
- **Custom Reports**: Add report builder functionality
- **Integration Hub**: Connect with external ITSM tools
- **ML Model Management**: Add model versioning and A/B testing
- **Alert Configuration**: Set up custom alerts and notifications

## Support

For questions or issues with the admin dashboard:
1. Check this documentation
2. Review the code comments in component files
3. Check the browser console for error messages
4. Verify API connectivity and authentication

---

Built with Next.js 14, TypeScript, Tailwind CSS, and shadcn/ui components.
