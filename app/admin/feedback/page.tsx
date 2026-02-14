'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  CheckCircle,
  Eye,
  TrendingUp,
} from 'lucide-react';
import { adminApi } from '@/lib/admin-api';

interface FeedbackItem {
  id: string;
  ticket_id: string;
  ticket_title: string;
  timestamp: string;
  decision_type: string;
  original_prediction: any;
  user_correction: any;
  feedback_type: 'accepted' | 'rejected' | 'corrected';
  user_comment?: string;
  status: 'pending' | 'reviewed' | 'applied';
  reviewer?: string;
}

interface FeedbackStats {
  totalFeedback: number;
  acceptanceRate: number;
  improvementOpportunities: number;
}

export default function FeedbackManagementPage() {
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<FeedbackItem[]>([]);
  const [stats, setStats] = useState<FeedbackStats>({
    totalFeedback: 0,
    acceptanceRate: 0,
    improvementOpportunities: 0,
  });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [feedbackTypeFilter, setFeedbackTypeFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState<FeedbackItem | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [reviewNote, setReviewNote] = useState('');

  useEffect(() => {
    loadFeedbackData();
  }, []);

  useEffect(() => {
    filterItems();
  }, [feedbackItems, statusFilter, feedbackTypeFilter]);

  const loadFeedbackData = async () => {
    try {
      setLoading(true);
      const [feedback, statistics] = await Promise.all([
        adminApi.getFeedback(),
        adminApi.getFeedbackStats(),
      ]);
      setFeedbackItems(feedback || []);
      setStats(statistics || stats);
    } catch (error) {
      console.error('Failed to load feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = [...feedbackItems];

    if (statusFilter !== 'all') {
      filtered = filtered.filter((item) => item.status === statusFilter);
    }

    if (feedbackTypeFilter !== 'all') {
      filtered = filtered.filter((item) => item.feedback_type === feedbackTypeFilter);
    }

    setFilteredItems(filtered);
  };

  const handleReview = async (itemId: string, action: 'approve' | 'reject') => {
    try {
      await adminApi.reviewFeedback(itemId, action, reviewNote);
      await loadFeedbackData();
      setShowDetails(false);
      setReviewNote('');
    } catch (error) {
      console.error('Failed to review feedback:', error);
    }
  };

  const applyCorrection = async (itemId: string) => {
    if (
      confirm(
        'This will apply the correction to the ML model. The model will be retrained with this feedback. Continue?'
      )
    ) {
      try {
        await adminApi.applyFeedbackCorrection(itemId);
        await loadFeedbackData();
        setShowDetails(false);
      } catch (error) {
        console.error('Failed to apply correction:', error);
      }
    }
  };

  const getFeedbackTypeColor = (type: string) => {
    const colors = {
      accepted: 'bg-gradient-to-r from-emerald-100 to-green-100 text-green-700 border-green-300',
      rejected: 'bg-gradient-to-r from-red-100 to-rose-100 text-red-700 border-red-300',
      corrected: 'bg-gradient-to-r from-amber-100 to-yellow-100 text-yellow-700 border-yellow-300',
    };
    return colors[type as keyof typeof colors] || 'bg-orange-100 text-amber-700';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-gradient-to-r from-sky-100 to-blue-100 text-blue-700 border-blue-300',
      reviewed: 'bg-gradient-to-r from-violet-100 to-purple-100 text-purple-700 border-purple-300',
      applied: 'bg-gradient-to-r from-emerald-100 to-green-100 text-green-700 border-green-300',
    };
    return colors[status as keyof typeof colors] || 'bg-orange-100 text-amber-700';
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-800 to-orange-700 bg-clip-text text-transparent mb-2">Feedback Management</h1>
        <p className="text-amber-700">Review and apply human corrections to improve AI accuracy</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-white to-blue-50 border-blue-200 p-6 shadow-md">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center shadow-sm">
              <MessageSquare size={20} className="text-white" />
            </div>
            <h3 className="text-amber-800 font-medium">Total Feedback</h3>
          </div>
          <p className="text-3xl font-bold text-amber-900">{stats.totalFeedback}</p>
          <p className="text-xs text-amber-700 mt-1">All time</p>
        </Card>

        <Card className="bg-gradient-to-br from-white to-emerald-50 border-emerald-200 p-6 shadow-md">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-sm">
              <ThumbsUp size={20} className="text-white" />
            </div>
            <h3 className="text-amber-800 font-medium">Acceptance Rate</h3>
          </div>
          <p className="text-3xl font-bold text-amber-900">{stats.acceptanceRate}%</p>
          <p className="text-xs text-amber-700 mt-1">AI decisions accepted</p>
        </Card>

        <Card className="bg-gradient-to-br from-white to-amber-50 border-amber-200 p-6 shadow-md">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-sm">
              <AlertTriangle size={20} className="text-white" />
            </div>
            <h3 className="text-amber-800 font-medium">Needs Review</h3>
          </div>
          <p className="text-3xl font-bold text-amber-900">{stats.improvementOpportunities}</p>
          <p className="text-xs text-amber-700 mt-1">Pending corrections</p>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="bg-gradient-to-r from-amber-100 to-orange-100 border border-orange-200">
          <TabsTrigger
            value="pending"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white"
          >
            Pending Review
          </TabsTrigger>
          <TabsTrigger
            value="all"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white"
          >
            All Feedback
          </TabsTrigger>
          <TabsTrigger
            value="insights"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white"
          >
            Insights
          </TabsTrigger>
        </TabsList>

        {/* Pending Review Tab */}
        <TabsContent value="pending" className="space-y-6">
          <Card className="bg-gradient-to-br from-white to-amber-50 border-orange-200 p-6 shadow-md">
            <h3 className="text-lg font-semibold text-amber-900 mb-4">Feedback Requiring Action</h3>
            
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin">
                  <div className="w-8 h-8 border-4 border-orange-200 border-t-amber-600 rounded-full" />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {feedbackItems
                  .filter((item) => item.status === 'pending')
                  .map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start justify-between p-4 bg-gradient-to-r from-amber-100 to-orange-100 border border-orange-200 rounded-lg hover:from-amber-200 hover:to-orange-200 transition-colors shadow-sm"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge variant="outline" className={getFeedbackTypeColor(item.feedback_type)}>
                            {item.feedback_type}
                          </Badge>
                          <span className="text-amber-700 text-sm font-medium">{item.decision_type}</span>
                        </div>
                        <p className="text-amber-900 font-semibold mb-1">{item.ticket_title}</p>
                        <p className="text-sm text-amber-700">
                          {new Date(item.timestamp).toLocaleString()}
                        </p>
                        {item.user_comment && (
                          <p className="text-sm text-amber-800 mt-2 italic">
                            "{item.user_comment}"
                          </p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedItem(item);
                          setShowDetails(true);
                        }}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Eye size={16} className="mr-2" />
                        Review
                      </Button>
                    </div>
                  ))}
              </div>
            )}
          </Card>
        </TabsContent>

        {/* All Feedback Tab */}
        <TabsContent value="all" className="space-y-6">
          {/* Filters */}
          <Card className="bg-gradient-to-br from-white to-amber-50 border-orange-200 p-6 shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-white border-orange-200 text-amber-900">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                  <SelectItem value="applied">Applied</SelectItem>
                </SelectContent>
              </Select>

              <Select value={feedbackTypeFilter} onValueChange={setFeedbackTypeFilter}>
                <SelectTrigger className="bg-white border-orange-200 text-amber-900">
                  <SelectValue placeholder="Feedback Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="corrected">Corrected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="mt-4 text-sm text-amber-700">
              Showing {filteredItems.length} of {feedbackItems.length} items
            </div>
          </Card>

          {/* Feedback Table */}
          <Card className="bg-gradient-to-br from-white to-amber-50 border-orange-200 shadow-md">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin">
                  <div className="w-12 h-12 border-4 border-orange-200 border-t-amber-600 rounded-full" />
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-orange-200 bg-gradient-to-r from-amber-50 to-orange-50">
                      <TableHead className="text-amber-900 font-semibold">Timestamp</TableHead>
                      <TableHead className="text-amber-900 font-semibold">Ticket</TableHead>
                      <TableHead className="text-amber-900 font-semibold">Decision Type</TableHead>
                      <TableHead className="text-amber-900 font-semibold">Feedback</TableHead>
                      <TableHead className="text-amber-900 font-semibold">Status</TableHead>
                      <TableHead className="text-amber-900 font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.map((item) => (
                      <TableRow key={item.id} className="border-orange-200 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 transition-colors">
                        <TableCell className="text-amber-800 text-sm">
                          {new Date(item.timestamp).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-amber-900 font-medium max-w-xs truncate">
                          {item.ticket_title}
                        </TableCell>
                        <TableCell className="text-amber-800">{item.decision_type}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getFeedbackTypeColor(item.feedback_type)}>
                            {item.feedback_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusColor(item.status)}>
                            {item.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-amber-600 hover:text-amber-800 hover:bg-amber-100"
                            onClick={() => {
                              setSelectedItem(item);
                              setShowDetails(true);
                            }}
                          >
                            <Eye size={16} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-white to-amber-50 border-orange-200 p-6 shadow-md">
              <h3 className="text-lg font-semibold text-amber-900 mb-4">
                Top Improvement Areas
              </h3>
              <div className="space-y-3">
                <div className="p-3 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-amber-900 font-medium">Category Classification</span>
                    <span className="text-red-600 font-semibold">23 corrections</span>
                  </div>
                  <div className="w-full bg-red-100 rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full" style={{ width: '75%' }} />
                  </div>
                </div>
                <div className="p-3 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-amber-900 font-medium">Priority Assignment</span>
                    <span className="text-yellow-600 font-semibold">15 corrections</span>
                  </div>
                  <div className="w-full bg-yellow-100 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '50%' }} />
                  </div>
                </div>
                <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-amber-900 font-medium">Routing Decisions</span>
                    <span className="text-green-600 font-semibold">8 corrections</span>
                  </div>
                  <div className="w-full bg-green-100 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '25%' }} />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-white to-amber-50 border-orange-200 p-6 shadow-md">
              <h3 className="text-lg font-semibold text-amber-900 mb-4">
                Learning Progress
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-amber-700 text-sm mb-2">Model Accuracy Improvement</p>
                  <p className="text-3xl font-bold text-amber-900 mb-1">+12.3%</p>
                  <p className="text-xs text-green-600 font-medium">Since last retrain</p>
                </div>
                <div className="pt-4 border-t border-orange-200">
                  <p className="text-amber-700 text-sm mb-2">Last Retrain</p>
                  <p className="text-amber-900 font-medium">3 days ago</p>
                </div>
                <div className="pt-4 border-t border-orange-200">
                  <p className="text-amber-700 text-sm mb-2">Next Scheduled Retrain</p>
                  <p className="text-amber-900 font-medium">In 4 days</p>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Feedback Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="bg-gradient-to-br from-white to-amber-50 border-orange-200 text-amber-900 max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Feedback Review</DialogTitle>
            <DialogDescription className="text-slate-400">
              Review and apply user corrections
            </DialogDescription>
          </DialogHeader>

          {selectedItem && (
            <div className="space-y-4">
              <div>
                <label className="text-sm text-amber-700">Ticket</label>
                <p className="text-amber-900 font-medium mt-1">{selectedItem.ticket_title}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-amber-700">Decision Type</label>
                  <p className="text-amber-900 mt-1 font-medium">{selectedItem.decision_type}</p>
                </div>
                <div>
                  <label className="text-sm text-amber-700">Feedback Type</label>
                  <Badge className={getFeedbackTypeColor(selectedItem.feedback_type) + ' mt-1'}>
                    {selectedItem.feedback_type}
                  </Badge>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-amber-100 to-orange-100 border border-orange-200 rounded-lg">
                <label className="text-sm text-amber-700 font-medium">Original AI Prediction</label>
                <pre className="text-xs text-amber-900 mt-2 overflow-auto">
                  {JSON.stringify(selectedItem.original_prediction, null, 2)}
                </pre>
              </div>

              {selectedItem.user_correction && (
                <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-300 rounded-lg">
                  <label className="text-sm text-blue-700 font-medium">User Correction</label>
                  <pre className="text-xs text-blue-900 mt-2 overflow-auto">
                    {JSON.stringify(selectedItem.user_correction, null, 2)}
                  </pre>
                </div>
              )}

              {selectedItem.user_comment && (
                <div>
                  <label className="text-sm text-amber-700">User Comment</label>
                  <p className="text-amber-900 mt-1 p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-orange-200 rounded-lg">
                    {selectedItem.user_comment}
                  </p>
                </div>
              )}

              {selectedItem.status === 'pending' && (
                <>
                  <div>
                    <label className="text-sm text-amber-700">Review Note (Optional)</label>
                    <Textarea
                      value={reviewNote}
                      onChange={(e) => setReviewNote(e.target.value)}
                      placeholder="Add notes about this feedback..."
                      className="bg-white border-orange-200 text-amber-900 mt-1"
                      rows={3}
                    />
                  </div>

                  <DialogFooter className="gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleReview(selectedItem.id, 'reject')}
                      className="border-orange-300 text-amber-900 hover:bg-orange-50"
                    >
                      <ThumbsDown size={16} className="mr-2" />
                      Reject
                    </Button>
                    <Button
                      onClick={() => applyCorrection(selectedItem.id)}
                      className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                    >
                      <CheckCircle size={16} className="mr-2" />
                      Apply Correction
                    </Button>
                  </DialogFooter>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
