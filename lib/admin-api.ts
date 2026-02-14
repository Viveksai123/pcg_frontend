/**
 * Admin API Client
 * Handles all API calls for the admin dashboard
 * Connects to backend-pcg APIs
 */

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

// Helper function to make authenticated requests
async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  let token = null;
  
  // Try to get token from localStorage (client-side only)
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('authToken');
  }
  
  const headers: any = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  // Add authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BACKEND_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    // If unauthorized, return empty data instead of throwing
    if (response.status === 401) {
      console.warn('Unauthorized API call - returning empty data');
      return [];
    }
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Dashboard Overview
export async function getDashboardStats() {
  try {
    // Get all tickets and calculate stats
    const tickets = await fetchWithAuth('/api/tickets');
    
    const totalTickets = tickets.length;
    // Open tickets = active + pending status
    const openTickets = tickets.filter((t: any) => t.status === 'active' || t.status === 'pending').length;
    const closedTickets = tickets.filter((t: any) => t.status === 'closed').length;
    const highPriorityCount = tickets.filter(
      (t: any) => t.priority === 'Critical' || t.priority === 'High'
    ).length;

    // Calculate today's tickets
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTickets = tickets.filter((t: any) => 
      new Date(t.created_at) >= today
    ).length;

    // Calculate average resolution time for closed tickets
    const closedWithResolution = tickets.filter((t: any) => 
      t.status === 'closed' && t.resolved_at
    );
    let avgResolutionTime = '0h';
    if (closedWithResolution.length > 0) {
      const totalTime = closedWithResolution.reduce((acc: number, t: any) => {
        const created = new Date(t.created_at).getTime();
        const resolved = new Date(t.resolved_at).getTime();
        return acc + (resolved - created);
      }, 0);
      const avgMs = totalTime / closedWithResolution.length;
      const avgHours = Math.round(avgMs / (1000 * 60 * 60));
      avgResolutionTime = `${avgHours}h`;
    }

    return {
      totalTickets,
      openTickets,
      closedTickets,
      averageResolutionTime: avgResolutionTime,
      highPriorityCount,
      todayTickets,
    };
  } catch (error) {
    console.error('Failed to get dashboard stats:', error);
    return null;
  }
}

export async function getRecentActivity() {
  try {
    const tickets = await fetchWithAuth('/api/tickets');
    
    return tickets.slice(0, 5).map((ticket: any) => ({
      title: ticket.title,
      description: `Ticket ${ticket.status} - ${ticket.category}`,
      time: new Date(ticket.created_at).toLocaleTimeString(),
    }));
  } catch (error) {
    console.error('Failed to get recent activity:', error);
    return [];
  }
}

// Tickets Management
export async function getAllTickets() {
  try {
    return await fetchWithAuth('/api/tickets');
  } catch (error) {
    console.error('Failed to get all tickets:', error);
    return [];
  }
}

export async function getTicketById(ticketId: string) {
  try {
    return await fetchWithAuth(`/api/tickets/${ticketId}`);
  } catch (error) {
    console.error('Failed to get ticket:', error);
    return null;
  }
}

export async function updateTicket(ticketId: string, updates: any) {
  try {
    return await fetchWithAuth(`/api/tickets/${ticketId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  } catch (error) {
    console.error('Failed to update ticket:', error);
    throw error;
  }
}

export async function deleteTicket(ticketId: string) {
  try {
    return await fetchWithAuth(`/api/tickets/${ticketId}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Failed to delete ticket:', error);
    throw error;
  }
}

// Analytics & Insights
export async function getAnalytics() {
  try {
    const tickets = await fetchWithAuth('/api/tickets');
    
    // Calculate trends
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      date.setHours(0, 0, 0, 0);
      return date;
    });

    const daily = last7Days.map(date => {
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      
      const count = tickets.filter((t: any) => {
        const ticketDate = new Date(t.created_at);
        return ticketDate >= date && ticketDate < nextDay;
      }).length;

      return {
        date: date.toISOString(),
        tickets: count,
      };
    });

    // Category distribution
    const categoryMap = new Map();
    tickets.forEach((t: any) => {
      const cat = t.category || 'General';
      categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1);
    });
    const categories = Array.from(categoryMap.entries()).map(([category, count]) => ({
      category,
      count,
    }));

    // Priority distribution
    const priorityMap = new Map();
    tickets.forEach((t: any) => {
      const priority = t.priority || 'Low';
      priorityMap.set(priority, (priorityMap.get(priority) || 0) + 1);
    });
    const priorities = Array.from(priorityMap.entries()).map(([priority, count]) => ({
      priority,
      count,
    }));

    // Top issues (group by similar titles)
    const titleMap = new Map();
    tickets.forEach((t: any) => {
      const key = t.title.toLowerCase().substring(0, 20);
      if (!titleMap.has(key)) {
        titleMap.set(key, { title: t.title, count: 0, category: t.category });
      }
      titleMap.get(key).count++;
    });
    const topIssues = Array.from(titleMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Performance metrics
    const closed = tickets.filter((t: any) => t.status === 'closed');
    let avgResolutionHours = 0;
    if (closed.length > 0) {
      const totalMs = closed.reduce((acc: number, t: any) => {
        if (t.resolved_at) {
          return acc + (new Date(t.resolved_at).getTime() - new Date(t.created_at).getTime());
        }
        return acc;
      }, 0);
      avgResolutionHours = Math.round(totalMs / (1000 * 60 * 60 * closed.length));
    }

    return {
      trends: {
        daily,
        categories,
        priorities,
      },
      patterns: {
        topIssues,
      },
      performance: {
        avgResolutionTime: `${avgResolutionHours}h`,
      },
    };
  } catch (error) {
    console.error('Failed to get analytics:', error);
    return null;
  }
}

// Routing Configuration
export async function getRoutingRules() {
  try {
    return await fetchWithAuth('/api/routing-rules');
  } catch (error) {
    console.error('Failed to get routing rules:', error);
    return [];
  }
}

export async function getResolverGroups() {
  try {
    // Get unique resolver groups from routing rules
    const rules = await getRoutingRules();
    const groupsMap = new Map();
    
    rules.forEach((rule: any) => {
      if (rule.resolver_group && !groupsMap.has(rule.resolver_group)) {
        groupsMap.set(rule.resolver_group, {
          id: rule.resolver_group,
          name: rule.resolver_group,
          categories: [rule.category],
          rulesCount: 1
        });
      } else if (rule.resolver_group) {
        const group = groupsMap.get(rule.resolver_group);
        if (!group.categories.includes(rule.category)) {
          group.categories.push(rule.category);
        }
        group.rulesCount++;
      }
    });
    
    return Array.from(groupsMap.values());
  } catch (error) {
    console.error('Failed to get resolver groups:', error);
    return [];
  }
}

export async function createRoutingRule(rule: any) {
  try {
    const response = await fetchWithAuth('/api/routing-rules', {
      method: 'POST',
      body: JSON.stringify(rule),
    });
    return response;
  } catch (error) {
    console.error('Failed to create routing rule:', error);
    throw error;
  }
}

export async function updateRoutingRule(ruleId: string, updates: any) {
  try {
    return await fetchWithAuth(`/api/routing-rules/${ruleId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  } catch (error) {
    console.error('Failed to update routing rule:', error);
    throw error;
  }
}

export async function deleteRoutingRule(ruleId: string) {
  try {
    return await fetchWithAuth(`/api/routing-rules/${ruleId}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Failed to delete routing rule:', error);
    throw error;
  }
}

// Audit Trail
export async function getAuditTrail() {
  try {
    const tickets = await fetchWithAuth('/api/tickets');
    
    // Generate audit entries from tickets with ML classification
    const auditEntries = tickets
      .filter((t: any) => t.ml_classification)
      .map((ticket: any) => ({
        id: `audit-${ticket._id}`,
        timestamp: ticket.ml_classification?.classified_at || ticket.created_at,
        action: 'Ticket Classification',
        decision_type: 'classification',
        ticket_id: ticket._id,
        ticket_title: ticket.title,
        input: {
          title: ticket.title,
          description: ticket.description,
        },
        output: {
          category: ticket.category,
          priority: ticket.priority,
          resolver_group: ticket.resolver_group,
        },
        confidence: ticket.ml_classification?.confidence,
        model_version: ticket.ml_classification?.model_version || 'v1.0.0',
        processing_time_ms: ticket.ml_classification?.processing_time_ms,
        user_feedback: ticket.ml_classification?.user_feedback,
      }));

    return auditEntries;
  } catch (error) {
    console.error('Failed to get audit trail:', error);
    return [];
  }
}

// Feedback Management
export async function getFeedback() {
  try {
    const auditEntries = await getAuditTrail();
    
    // Filter entries with user feedback
    return auditEntries
      .filter((entry: any) => entry.user_feedback)
      .map((entry: any) => ({
        id: entry.id,
        ticket_id: entry.ticket_id,
        ticket_title: entry.ticket_title,
        timestamp: entry.timestamp,
        decision_type: entry.decision_type,
        original_prediction: entry.output,
        user_correction: entry.user_correction || null,
        feedback_type: entry.user_feedback,
        user_comment: entry.user_comment,
        status: entry.status || 'pending',
        reviewer: entry.reviewer,
      }));
  } catch (error) {
    console.error('Failed to get feedback:', error);
    return [];
  }
}

export async function getFeedbackStats() {
  try {
    const feedback = await getFeedback();
    const auditEntries = await getAuditTrail();
    
    const totalFeedback = feedback.length;
    const accepted = feedback.filter((f: any) => f.feedback_type === 'accepted').length;
    const acceptanceRate = auditEntries.length > 0 
      ? Math.round((accepted / auditEntries.length) * 100)
      : 0;
    const improvementOpportunities = feedback.filter((f: any) => f.status === 'pending').length;

    return {
      totalFeedback,
      acceptanceRate,
      improvementOpportunities,
    };
  } catch (error) {
    console.error('Failed to get feedback stats:', error);
    return {
      totalFeedback: 0,
      acceptanceRate: 0,
      improvementOpportunities: 0,
    };
  }
}

export async function reviewFeedback(feedbackId: string, action: 'approve' | 'reject', note?: string) {
  try {
    return await fetchWithAuth(`/api/feedback/${feedbackId}/review`, {
      method: 'POST',
      body: JSON.stringify({ action, note }),
    });
  } catch (error) {
    console.error('Failed to review feedback:', error);
    throw error;
  }
}

export async function applyFeedbackCorrection(feedbackId: string) {
  try {
    return await fetchWithAuth(`/api/feedback/${feedbackId}/apply`, {
      method: 'POST',
    });
  } catch (error) {
    console.error('Failed to apply feedback correction:', error);
    throw error;
  }
}

// Export all functions as adminApi object
export const adminApi = {
  // Dashboard
  getDashboardStats,
  getRecentActivity,
  
  // Tickets
  getAllTickets,
  getTicketById,
  updateTicket,
  deleteTicket,
  
  // Analytics
  getAnalytics,
  
  // Routing
  getRoutingRules,
  getResolverGroups,
  createRoutingRule,
  updateRoutingRule,
  deleteRoutingRule,
  
  // Audit
  getAuditTrail,
  
  // Feedback
  getFeedback,
  getFeedbackStats,
  reviewFeedback,
  applyFeedbackCorrection,
};
