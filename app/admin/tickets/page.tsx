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
import { Search, Filter, Download, Eye, Edit, Trash2, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import { adminApi } from '@/lib/admin-api';
import { toast } from 'sonner';

interface Ticket {
  _id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  resolver_group?: string;
  user: string;
  email: string;
  created_at: string;
  updated_at: string;
  ml_classification?: any;
}

export default function TicketsManagementPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [editingStatus, setEditingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    loadTickets();
  }, []);

  useEffect(() => {
    filterTickets();
  }, [tickets, searchQuery, statusFilter, priorityFilter, categoryFilter]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getAllTickets();
      setTickets(data || []);
    } catch (error) {
      console.error('Failed to load tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterTickets = () => {
    let filtered = [...tickets];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (ticket) =>
          ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ticket.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ticket.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((ticket) => ticket.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter((ticket) => ticket.priority === priorityFilter);
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter((ticket) => ticket.category === categoryFilter);
    }

    setFilteredTickets(filtered);
  };

  const handleUpdateStatus = async () => {
    if (!selectedTicket || !newStatus) return;

    try {
      await adminApi.updateTicket(selectedTicket._id, { status: newStatus });
      
      // Show success toast
      toast.success('Status Updated!', {
        description: `Ticket status changed to ${newStatus}`,
        duration: 3000,
        icon: <CheckCircle2 className="text-green-500" />,
        className: 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300',
      });
      
      // Reload tickets after update
      await loadTickets();
      setEditingStatus(false);
      setShowDetails(false);
      setNewStatus('');
    } catch (error) {
      console.error('Failed to update status:', error);
      
      // Show error toast
      toast.error('Update Failed', {
        description: 'Failed to update ticket status. Please try again.',
        duration: 4000,
        icon: <XCircle className="text-red-500" />,
        className: 'bg-gradient-to-r from-red-50 to-rose-50 border-red-300',
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      Critical: 'bg-gradient-to-r from-red-100 to-rose-100 text-red-700 border-red-300',
      High: 'bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 border-orange-300',
      Medium: 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-700 border-yellow-300',
      Low: 'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 border-emerald-300',
    };
    return colors[priority as keyof typeof colors] || 'bg-orange-100 text-amber-700';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      open: 'bg-gradient-to-r from-sky-100 to-blue-100 text-blue-700 border-blue-300',
      'in-progress': 'bg-gradient-to-r from-violet-100 to-purple-100 text-purple-700 border-purple-300',
      closed: 'bg-gradient-to-r from-emerald-100 to-green-100 text-green-700 border-green-300',
      pending: 'bg-gradient-to-r from-amber-100 to-yellow-100 text-yellow-700 border-yellow-300',
    };
    return colors[status as keyof typeof colors] || 'bg-orange-100 text-amber-700';
  };

  const exportToCSV = () => {
    const csv = [
      ['ID', 'Title', 'Category', 'Priority', 'Status', 'User', 'Created'],
      ...filteredTickets.map((t) => [
        t._id,
        t.title,
        t.category,
        t.priority,
        t.status,
        t.email,
        new Date(t.created_at).toLocaleString(),
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tickets_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-800 to-orange-700 bg-clip-text text-transparent mb-2">Tickets Management</h1>
          <p className="text-amber-700">View and manage all support tickets</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={loadTickets}
            variant="outline"
            className="bg-white border-orange-300 text-amber-700 hover:bg-orange-50"
          >
            <RefreshCw size={16} className="mr-2" />
            Refresh
          </Button>
          <Button
            onClick={exportToCSV}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md"
          >
            <Download size={16} className="mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-gradient-to-br from-white to-amber-50 border-orange-200 p-6 shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-600" size={18} />
            <Input
              placeholder="Search tickets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white border-orange-200 text-amber-900"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="bg-white border-orange-200 text-amber-900">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="bg-white border-orange-200 text-amber-900">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="Critical">Critical</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="bg-white border-orange-200 text-amber-900">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Hardware">Hardware</SelectItem>
              <SelectItem value="Software">Software</SelectItem>
              <SelectItem value="Network">Network</SelectItem>
              <SelectItem value="Access">Access</SelectItem>
              <SelectItem value="General">General</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="mt-4 text-sm text-amber-700">
          Showing {filteredTickets.length} of {tickets.length} tickets
        </div>
      </Card>

      {/* Tickets Table */}
      <Card className="bg-gradient-to-br from-white to-amber-50 border-orange-200 shadow-md">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin">
              <div className="w-12 h-12 border-4 border-orange-200 border-t-amber-600 rounded-full" />
            </div>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="text-center py-12">
            <Filter size={48} className="text-orange-300 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">No tickets found</p>
            <p className="text-slate-500 text-sm mt-2">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-orange-200 hover:bg-orange-50/50">
                  <TableHead className="text-amber-800">ID</TableHead>
                  <TableHead className="text-amber-800">Title</TableHead>
                  <TableHead className="text-amber-800">User</TableHead>
                  <TableHead className="text-amber-800">Category</TableHead>
                  <TableHead className="text-amber-800">Priority</TableHead>
                  <TableHead className="text-amber-800">Status</TableHead>
                  <TableHead className="text-amber-800">Created</TableHead>
                  <TableHead className="text-amber-800">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets.map((ticket) => (
                  <TableRow
                    key={ticket._id}
                    className="border-orange-100 hover:bg-orange-50/50"
                  >
                    <TableCell className="font-mono text-xs text-amber-700">
                      {ticket._id.slice(-8)}
                    </TableCell>
                    <TableCell className="text-amber-900 max-w-xs truncate">
                      {ticket.title}
                    </TableCell>
                    <TableCell className="text-amber-800">{ticket.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-orange-100 text-amber-800 border-orange-200">
                        {ticket.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getPriorityColor(ticket.priority)}>
                        {ticket.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(ticket.status)}>
                        {ticket.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-amber-700">
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-amber-600 hover:text-orange-700 hover:bg-orange-100"
                          onClick={() => {
                            setSelectedTicket(ticket);
                            setShowDetails(true);
                          }}
                        >
                          <Eye size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Ticket Details Dialog */}
      <Dialog 
        open={showDetails} 
        onOpenChange={(open) => {
          setShowDetails(open);
          if (!open) {
            setEditingStatus(false);
            setNewStatus('');
          }
        }}
      >
        <DialogContent className="bg-gradient-to-br from-white to-amber-50 border-orange-200 text-amber-900 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl text-amber-900">Ticket Details</DialogTitle>
            <DialogDescription className="text-amber-700">
              ID: {selectedTicket?._id}
            </DialogDescription>
          </DialogHeader>

          {selectedTicket && (
            <div className="space-y-4">
              <div>
                <label className="text-sm text-amber-700">Title</label>
                <p className="text-amber-900 font-medium mt-1">{selectedTicket.title}</p>
              </div>

              <div>
                <label className="text-sm text-amber-700">Description</label>
                <p className="text-amber-900 mt-1">{selectedTicket.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-amber-700">Category</label>
                  <p className="text-amber-900 mt-1">{selectedTicket.category}</p>
                </div>
                <div>
                  <label className="text-sm text-amber-700">Priority</label>
                  <Badge className={getPriorityColor(selectedTicket.priority) + ' mt-1'}>
                    {selectedTicket.priority}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-amber-700">Status</label>
                  {editingStatus ? (
                    <Select value={newStatus} onValueChange={setNewStatus}>
                      <SelectTrigger className="mt-1 bg-white border-orange-200 text-amber-900">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getStatusColor(selectedTicket.status)}>
                        {selectedTicket.status}
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-amber-600 hover:text-orange-700 hover:bg-orange-100 h-7 px-2"
                        onClick={() => {
                          setEditingStatus(true);
                          setNewStatus(selectedTicket.status);
                        }}
                      >
                        <Edit size={14} />
                      </Button>
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-sm text-amber-700">Resolver Group</label>
                  <p className="text-amber-900 mt-1">{selectedTicket.resolver_group || 'Not assigned'}</p>
                </div>
              </div>

              <div>
                <label className="text-sm text-amber-700">User Email</label>
                <p className="text-amber-900 mt-1">{selectedTicket.email}</p>
              </div>

              {selectedTicket.ml_classification && (
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <label className="text-sm text-amber-700">ML Classification</label>
                  <pre className="text-xs text-amber-800 mt-2 overflow-auto">
                    {JSON.stringify(selectedTicket.ml_classification, null, 2)}
                  </pre>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="text-amber-700">Created</label>
                  <p className="text-amber-900 mt-1">
                    {new Date(selectedTicket.created_at).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="text-amber-700">Updated</label>
                  <p className="text-amber-900 mt-1">
                    {new Date(selectedTicket.updated_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {editingStatus && (
            <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-orange-200">
              <Button
                variant="outline"
                onClick={() => {
                  setEditingStatus(false);
                  setNewStatus('');
                }}
                className="border-orange-300 text-amber-700 hover:bg-orange-50"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateStatus}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
              >
                Save Changes
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
