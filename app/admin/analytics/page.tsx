'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  TrendingUp,
  AlertCircle,
  Users,
  Clock,
  BarChart3,
  PieChart,
  Activity,
  Download,
} from 'lucide-react';
import { adminApi } from '@/lib/admin-api';

interface AnalyticsData {
  trends: {
    daily: Array<{ date: string; tickets: number }>;
    categories: Array<{ category: string; count: number }>;
    priorities: Array<{ priority: string; count: number }>;
  };
  patterns: {
    topIssues: Array<{ title: string; count: number; category: string }>;
  };
  performance: {
    avgResolutionTime: string;
  };
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData>({
    trends: { daily: [], categories: [], priorities: [] },
    patterns: { topIssues: [] },
    performance: {
      avgResolutionTime: '0h',
    },
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('trends');

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const analyticsData = await adminApi.getAnalytics();
      if (analyticsData) setData(analyticsData);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    const report = JSON.stringify(data, null, 2);
    const blob = new Blob([report], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics_report_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

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
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-800 to-orange-700 bg-clip-text text-transparent mb-2">Analytics & Insights</h1>
          <p className="text-amber-700">Deep dive into patterns, trends, and predictions</p>
        </div>
        <Button onClick={exportReport} className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md">
          <Download size={16} className="mr-2" />
          Export Report
        </Button>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
        <Card className="bg-gradient-to-br from-white to-blue-50 border-blue-200 p-6 shadow-md">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center shadow-sm">
              <Clock size={20} className="text-white" />
            </div>
            <h3 className="text-amber-800 font-medium">Avg Resolution</h3>
          </div>
          <p className="text-3xl font-bold text-amber-900">{data.performance.avgResolutionTime}</p>
          <p className="text-xs text-amber-700 mt-1">Time to resolve</p>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-gradient-to-r from-amber-100 to-orange-100 border border-orange-200">
          <TabsTrigger
            value="trends"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white"
          >
            <TrendingUp size={16} className="mr-2" />
            Trends
          </TabsTrigger>
          <TabsTrigger
            value="patterns"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white"
          >
            <BarChart3 size={16} className="mr-2" />
            Patterns
          </TabsTrigger>
        </TabsList>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Categories Distribution */}
            <Card className="bg-gradient-to-br from-white to-orange-50 border-orange-200 p-6 shadow-md">
              <div className="flex items-center gap-3 mb-6">
                <PieChart size={20} className="text-amber-600" />
                <h3 className="text-lg font-semibold text-amber-900">Category Distribution</h3>
              </div>
              <div className="space-y-3">
                {data.trends.categories.map((cat, idx) => {
                  const total = data.trends.categories.reduce((sum, c) => sum + c.count, 0);
                  const percentage = total > 0 ? ((cat.count / total) * 100).toFixed(1) : 0;
                  return (
                    <div key={idx}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-amber-800">{cat.category}</span>
                        <span className="text-amber-700">
                          {cat.count} ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-orange-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-sky-500 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Priority Distribution */}
            <Card className="bg-gradient-to-br from-white to-orange-50 border-orange-200 p-6 shadow-md">
              <div className="flex items-center gap-3 mb-6">
                <AlertCircle size={20} className="text-orange-600" />
                <h3 className="text-lg font-semibold text-amber-900">Priority Distribution</h3>
              </div>
              <div className="space-y-3">
                {data.trends.priorities.map((priority, idx) => {
                  const total = data.trends.priorities.reduce((sum, p) => sum + p.count, 0);
                  const percentage = total > 0 ? ((priority.count / total) * 100).toFixed(1) : 0;
                  const colors = {
                    Critical: 'bg-gradient-to-r from-red-500 to-rose-500',
                    High: 'bg-gradient-to-r from-orange-500 to-amber-500',
                    Medium: 'bg-gradient-to-r from-yellow-500 to-amber-500',
                    Low: 'bg-gradient-to-r from-emerald-500 to-green-500',
                  };
                  return (
                    <div key={idx}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-amber-800">{priority.priority}</span>
                        <span className="text-amber-700">
                          {priority.count} ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-orange-200 rounded-full h-2">
                        <div
                          className={`${colors[priority.priority as keyof typeof colors]} h-2 rounded-full shadow-sm`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Daily Trends Chart */}
          <Card className="bg-gradient-to-br from-white to-amber-50 border-orange-200 p-6 shadow-md">
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 size={20} className="text-emerald-600" />
              <h3 className="text-lg font-semibold text-amber-900">Daily Ticket Volume</h3>
            </div>
            <div className="h-64 flex items-end gap-2">
              {data.trends.daily.map((day, idx) => {
                const maxTickets = Math.max(...data.trends.daily.map((d) => d.tickets), 1);
                const height = (day.tickets / maxTickets) * 100;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full bg-orange-100 rounded-t-lg relative group">
                      <div
                        className="w-full bg-gradient-to-t from-amber-500 to-orange-400 rounded-t-lg transition-all hover:from-amber-600 hover:to-orange-500 shadow"
                        style={{ height: `${height * 2}px` }}
                      />
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-amber-900 px-2 py-1 rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                        {day.tickets}
                      </div>
                    </div>
                    <span className="text-xs text-amber-700">
                      {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        </TabsContent>

        {/* Patterns Tab */}
        <TabsContent value="patterns" className="space-y-6">
          {/* Top Issues */}
          <Card className="bg-gradient-to-br from-white to-red-50 border-red-200 p-6 shadow-md">
            <div className="flex items-center gap-3 mb-6">
              <AlertCircle size={20} className="text-red-600" />
              <h3 className="text-lg font-semibold text-amber-900">Top Issues</h3>
            </div>
            {data.patterns.topIssues.length > 0 ? (
              <div className="space-y-3">
                {data.patterns.topIssues.map((issue, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-red-50 border border-red-200 rounded-lg hover:shadow-md transition-all"
                  >
                    <div className="flex-1">
                      <p className="text-amber-900 font-medium">{issue.title}</p>
                      <p className="text-sm text-amber-700 mt-1">{issue.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-red-600">{issue.count}</p>
                      <p className="text-xs text-amber-700">occurrences</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-amber-600">
                <p>No top issues data available</p>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
