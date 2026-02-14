'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import {
  Users,
  Ticket,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Activity,
  BarChart3,
} from 'lucide-react';
import { adminApi } from '@/lib/admin-api';

interface DashboardStats {
  totalTickets: number;
  openTickets: number;
  closedTickets: number;
  averageResolutionTime: string;
  highPriorityCount: number;
  todayTickets: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalTickets: 0,
    openTickets: 0,
    closedTickets: 0,
    averageResolutionTime: '0h',
    highPriorityCount: 0,
    todayTickets: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsData, activityData] = await Promise.all([
        adminApi.getDashboardStats(),
        adminApi.getRecentActivity(),
      ]);
      
      if (statsData) setStats(statsData);
      if (activityData) setRecentActivity(activityData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Tickets',
      value: stats.totalTickets,
      icon: Ticket,
      color: 'blue',
      trend: `+${stats.todayTickets} today`,
    },
    {
      title: 'Open Tickets',
      value: stats.openTickets,
      icon: Clock,
      color: 'yellow',
      trend: 'Pending resolution',
    },
    {
      title: 'Closed Tickets',
      value: stats.closedTickets,
      icon: CheckCircle,
      color: 'green',
      trend: 'Completed',
    },
    {
      title: 'High Priority',
      value: stats.highPriorityCount,
      icon: AlertTriangle,
      color: 'red',
      trend: 'Requires attention',
    },
  ];

  const metricCards = [
    {
      title: 'Avg Resolution Time',
      value: stats.averageResolutionTime,
      icon: Activity,
      description: 'Based on closed tickets',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin">
          <div className="w-12 h-12 border-4 border-orange-200 border-t-amber-600 rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-800 to-orange-700 bg-clip-text text-transparent mb-2">Dashboard Overview</h1>
        <p className="text-amber-700">Monitor your ITSM system performance and metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          const colorClasses = {
            blue: 'bg-gradient-to-br from-blue-400 to-cyan-500 text-white',
            yellow: 'bg-gradient-to-br from-amber-400 to-yellow-500 text-white',
            green: 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white',
            red: 'bg-gradient-to-br from-rose-400 to-orange-500 text-white',
          }[stat.color];

          return (
            <Card
              key={stat.title}
              className="bg-gradient-to-br from-white to-orange-50 border-orange-200 p-6 hover:shadow-lg hover:border-orange-300 transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg ${colorClasses} flex items-center justify-center shadow-md`}>
                  <Icon size={24} />
                </div>
              </div>
              <h3 className="text-amber-700 text-sm font-medium mb-1">{stat.title}</h3>
              <p className="text-3xl font-bold text-amber-900 mb-2">{stat.value}</p>
              <p className="text-xs text-orange-600">{stat.trend}</p>
            </Card>
          );
        })}
      </div>

      {/* Metrics and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Metrics */}
        {metricCards.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card
              key={metric.title}
              className="bg-gradient-to-br from-amber-50 to-orange-100 border-orange-200 p-6 hover:shadow-lg transition-all duration-200"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md">
                  <Icon size={20} className="text-white" />
                </div>
                <h3 className="text-amber-900 font-semibold">{metric.title}</h3>
              </div>
              <p className="text-3xl font-bold text-amber-900 mb-1">{metric.value}</p>
              <p className="text-sm text-amber-700">{metric.description}</p>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <Card className="bg-gradient-to-br from-white to-amber-50 border-orange-200 p-6 shadow-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold bg-gradient-to-r from-amber-800 to-orange-700 bg-clip-text text-transparent">Recent Activity</h2>
          <button className="text-sm text-amber-600 hover:text-orange-600 font-medium">View All</button>
        </div>
        
        {recentActivity.length > 0 ? (
          <div className="space-y-4">
            {recentActivity.slice(0, 5).map((activity, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-4 rounded-lg bg-gradient-to-r from-orange-50 to-amber-50 hover:shadow-md transition-all duration-200 border border-orange-100"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Activity size={16} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-amber-900 text-sm font-medium">{activity.title}</p>
                  <p className="text-amber-700 text-xs mt-1">{activity.description}</p>
                </div>
                <span className="text-xs text-orange-600">{activity.time}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Activity size={48} className="text-orange-300 mx-auto mb-4" />
            <p className="text-amber-600">No recent activity</p>
          </div>
        )}
      </Card>
    </div>
  );
}
