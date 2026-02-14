'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Search, Filter, Download, Eye, FileText, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { adminApi } from '@/lib/admin-api';

interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  decision_type: 'classification' | 'routing' | 'priority' | 'duplicate_detection';
  ticket_id: string;
  ticket_title: string;
  input: any;
  output: any;
  confidence: number;
  model_version: string;
  processing_time_ms: number;
  user_feedback?: 'accepted' | 'rejected' | 'corrected';
  correction?: any;
}

export default function AuditTrailPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [decisionFilter, setDecisionFilter] = useState('all');
  const [feedbackFilter, setFeedbackFilter] = useState('all');
  const [selectedEntry, setSelectedEntry] = useState<AuditEntry | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadAuditTrail();
  }, []);

  useEffect(() => {
    filterEntries();
  }, [entries, searchQuery, decisionFilter, feedbackFilter]);

  const loadAuditTrail = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getAuditTrail();
      setEntries(data || []);
    } catch (error) {
      console.error('Failed to load audit trail:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterEntries = () => {
    let filtered = [...entries];

    if (searchQuery) {
      filtered = filtered.filter(
        (entry) =>
          entry.ticket_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          entry.ticket_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          entry.action.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (decisionFilter !== 'all') {
      filtered = filtered.filter((entry) => entry.decision_type === decisionFilter);
    }

    if (feedbackFilter !== 'all') {
      if (feedbackFilter === 'no_feedback') {
        filtered = filtered.filter((entry) => !entry.user_feedback);
      } else {
        filtered = filtered.filter((entry) => entry.user_feedback === feedbackFilter);
      }
    }

    setFilteredEntries(filtered);
  };

  const getDecisionTypeColor = (type: string) => {
    const colors = {
      classification: 'bg-gradient-to-r from-sky-100 to-blue-100 text-blue-700 border-blue-300',
      routing: 'bg-gradient-to-r from-violet-100 to-purple-100 text-purple-700 border-purple-300',
      priority: 'bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 border-orange-300',
      duplicate_detection: 'bg-gradient-to-r from-emerald-100 to-green-100 text-green-700 border-green-300',
    };
    return colors[type as keyof typeof colors] || 'bg-orange-100 text-amber-700';
  };

  const getFeedbackIcon = (feedback?: string) => {
    if (!feedback) return <AlertTriangle size={14} className="text-amber-600" />;
    if (feedback === 'accepted') return <CheckCircle size={14} className="text-emerald-600" />;
    if (feedback === 'rejected') return <XCircle size={14} className="text-red-600" />;
    if (feedback === 'corrected') return <AlertTriangle size={14} className="text-orange-600" />;
    return null;
  };

  const exportAuditLog = () => {
    const csv = [
      ['Timestamp', 'Action', 'Decision Type', 'Ticket ID', 'Confidence', 'Feedback', 'Processing Time'],
      ...filteredEntries.map((e) => [
        new Date(e.timestamp).toLocaleString(),
        e.action,
        e.decision_type,
        e.ticket_id,
        `${e.confidence}%`,
        e.user_feedback || 'None',
        `${e.processing_time_ms}ms`,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_trail_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-800 to-orange-700 bg-clip-text text-transparent mb-2">Audit Trail</h1>
          <p className="text-amber-700">Track all AI decisions and system actions</p>
        </div>
        <Button onClick={exportAuditLog} className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md">
          <Download size={16} className="mr-2" />
          Export Log
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-white to-blue-50 border-blue-200 p-6 shadow-md">
          <div className="flex items-center gap-3 mb-2">
            <FileText size={20} className="text-blue-600" />
            <h3 className="text-amber-800 font-medium">Total Decisions</h3>
          </div>
          <p className="text-3xl font-bold text-amber-900">{entries.length}</p>
        </Card>

        <Card className="bg-gradient-to-br from-white to-emerald-50 border-emerald-200 p-6 shadow-md">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle size={20} className="text-emerald-600" />
            <h3 className="text-amber-800 font-medium">Accepted</h3>
          </div>
          <p className="text-3xl font-bold text-amber-900">
            {entries.filter((e) => e.user_feedback === 'accepted').length}
          </p>
        </Card>

        <Card className="bg-gradient-to-br from-white to-red-50 border-red-200 p-6 shadow-md">
          <div className="flex items-center gap-3 mb-2">
            <XCircle size={20} className="text-red-600" />
            <h3 className="text-amber-800 font-medium">Rejected</h3>
          </div>
          <p className="text-3xl font-bold text-amber-900">
            {entries.filter((e) => e.user_feedback === 'rejected').length}
          </p>
        </Card>

        <Card className="bg-gradient-to-br from-white to-amber-50 border-amber-200 p-6 shadow-md">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle size={20} className="text-amber-600" />
            <h3 className="text-amber-800 font-medium">Corrected</h3>
          </div>
          <p className="text-3xl font-bold text-amber-900">
            {entries.filter((e) => e.user_feedback === 'corrected').length}
          </p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-gradient-to-br from-white to-amber-50 border-orange-200 p-6 shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-600" size={18} />
            <Input
              placeholder="Search by ticket ID or action..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white border-orange-200 text-amber-900"
            />
          </div>

          <Select value={decisionFilter} onValueChange={setDecisionFilter}>
            <SelectTrigger className="bg-white border-orange-200 text-amber-900">
              <SelectValue placeholder="Decision Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Decisions</SelectItem>
              <SelectItem value="classification">Classification</SelectItem>
              <SelectItem value="routing">Routing</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
              <SelectItem value="duplicate_detection">Duplicate Detection</SelectItem>
            </SelectContent>
          </Select>

          <Select value={feedbackFilter} onValueChange={setFeedbackFilter}>
            <SelectTrigger className="bg-white border-orange-200 text-amber-900">
              <SelectValue placeholder="Feedback Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Feedback</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="corrected">Corrected</SelectItem>
              <SelectItem value="no_feedback">No Feedback</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="mt-4 text-sm text-amber-700">
          Showing {filteredEntries.length} of {entries.length} entries
        </div>
      </Card>

      {/* Audit Log Table */}
      <Card className="bg-gradient-to-br from-white to-amber-50 border-orange-200 shadow-md">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin">
              <div className="w-12 h-12 border-4 border-slate-700 border-t-blue-600 rounded-full" />
            </div>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="text-center py-12">
            <FileText size={48} className="text-slate-700 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">No audit entries found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800">
                  <TableHead className="text-slate-300">Timestamp</TableHead>
                  <TableHead className="text-slate-300">Action</TableHead>
                  <TableHead className="text-slate-300">Decision Type</TableHead>
                  <TableHead className="text-slate-300">Ticket</TableHead>
                  <TableHead className="text-slate-300">Confidence</TableHead>
                  <TableHead className="text-slate-300">Time</TableHead>
                  <TableHead className="text-slate-300">Feedback</TableHead>
                  <TableHead className="text-slate-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.map((entry) => (
                  <TableRow key={entry.id} className="border-orange-200 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 transition-colors">
                    <TableCell className="text-amber-800 text-sm">
                      {new Date(entry.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-amber-900 font-medium">{entry.action}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getDecisionTypeColor(entry.decision_type)}>
                        {entry.decision_type.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-amber-800 max-w-xs truncate">
                      {entry.ticket_title}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-orange-200 rounded-full h-2 max-w-[60px]">
                          <div
                            className={`h-2 rounded-full ${
                              entry.confidence >= 80
                                ? 'bg-green-500'
                                : entry.confidence >= 60
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${entry.confidence}%` }}
                          />
                        </div>
                        <span className="text-amber-800 text-sm font-medium">{entry.confidence}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-amber-700 text-sm">
                      {entry.processing_time_ms}ms
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getFeedbackIcon(entry.user_feedback)}
                        <span className="text-sm text-slate-300 capitalize">
                          {entry.user_feedback || 'Pending'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-blue-400 hover:text-blue-300 hover:bg-blue-600/20"
                        onClick={() => {
                          setSelectedEntry(entry);
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

      {/* Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="bg-gradient-to-br from-white to-amber-50 border-orange-200 text-amber-900 max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Audit Entry Details</DialogTitle>
            <DialogDescription className="text-slate-400">
              ID: {selectedEntry?.id}
            </DialogDescription>
          </DialogHeader>

          {selectedEntry && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-400">Timestamp</label>
                  <p className="text-white mt-1">
                    {new Date(selectedEntry.timestamp).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-slate-400">Processing Time</label>
                  <p className="text-white mt-1">{selectedEntry.processing_time_ms}ms</p>
                </div>
              </div>

              <div>
                <label className="text-sm text-slate-400">Action</label>
                <p className="text-white font-medium mt-1">{selectedEntry.action}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-400">Decision Type</label>
                  <Badge className={getDecisionTypeColor(selectedEntry.decision_type) + ' mt-1'}>
                    {selectedEntry.decision_type.replace('_', ' ')}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm text-slate-400">Confidence Score</label>
                  <p className="text-white mt-1">{selectedEntry.confidence}%</p>
                </div>
              </div>

              <div>
                <label className="text-sm text-amber-700">Ticket</label>
                <p className="text-amber-900 font-medium mt-1">{selectedEntry.ticket_title}</p>
                <p className="text-xs text-amber-600 mt-1">ID: {selectedEntry.ticket_id}</p>
              </div>

              <div>
                <label className="text-sm text-amber-700">Model Version</label>
                <p className="text-amber-900 font-medium mt-1">{selectedEntry.model_version}</p>
              </div>

              <div className="p-4 bg-gradient-to-r from-amber-100 to-orange-100 border border-orange-200 rounded-lg">
                <label className="text-sm text-amber-700 font-medium">Input Data</label>
                <pre className="text-xs text-amber-900 mt-2 overflow-auto max-h-40">
                  {JSON.stringify(selectedEntry.input, null, 2)}
                </pre>
              </div>

              <div className="p-4 bg-gradient-to-r from-amber-100 to-orange-100 border border-orange-200 rounded-lg">
                <label className="text-sm text-amber-700 font-medium">Output/Decision</label>
                <pre className="text-xs text-amber-900 mt-2 overflow-auto max-h-40">
                  {JSON.stringify(selectedEntry.output, null, 2)}
                </pre>
              </div>

              {selectedEntry.user_feedback && (
                <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-300 rounded-lg">
                  <label className="text-sm text-blue-700 font-medium">User Feedback</label>
                  <div className="flex items-center gap-2 mt-2">
                    {getFeedbackIcon(selectedEntry.user_feedback)}
                    <span className="text-blue-900 font-medium capitalize">{selectedEntry.user_feedback}</span>
                  </div>
                  {selectedEntry.correction && (
                    <div className="mt-3">
                      <label className="text-xs text-blue-700">Correction Details:</label>
                      <pre className="text-xs text-blue-900 mt-1">
                        {JSON.stringify(selectedEntry.correction, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
