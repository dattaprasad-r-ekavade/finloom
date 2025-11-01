'use client';

import React, { useEffect, useState } from 'react';
import { formatDate } from '@/lib/dateFormat';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Stack,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Pagination,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Menu,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { 
  Search, 
  Refresh, 
  MoreVert, 
  Edit, 
  Delete, 
  CheckCircle, 
  Cancel,
  Person,
} from '@mui/icons-material';
import Navbar from '@/components/Navbar';
import { robotoMonoFontFamily } from '@/theme/theme';

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
  kycStatus: string;
  kycApprovedAt: string | null;
  activeChallengesCount: number;
  passedChallengesCount: number;
  failedChallengesCount: number;
  totalChallenges: number;
  totalSpent: number;
  activeChallenges: Array<{
    id: string;
    planName: string;
    level: number;
  }>;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [kycFilter, setKycFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  // Dialog states
  const [editDialog, setEditDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editFormData, setEditFormData] = useState({ name: '', email: '', role: 'TRADER' });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuUserId, setMenuUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, roleFilter, kycFilter, activeFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (search) params.append('search', search);
      if (roleFilter) params.append('role', roleFilter);
      if (kycFilter) params.append('kycStatus', kycFilter);
      if (activeFilter) params.append('hasActiveChallenge', activeFilter);

      const response = await fetch(`/api/admin/users?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        setUsers(result.data);
        setPagination(result.pagination);
      } else {
        setError(result.error || 'Failed to fetch users');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchUsers();
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPagination((prev) => ({ ...prev, page: value }));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, userId: string) => {
    setAnchorEl(event.currentTarget);
    setMenuUserId(userId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuUserId(null);
  };

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setEditFormData({
      name: user.name || '',
      email: user.email,
      role: user.role,
    });
    setEditDialog(true);
    handleMenuClose();
  };

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setDeleteDialog(true);
    handleMenuClose();
  };

  const handleEditSubmit = async () => {
    if (!selectedUser) return;

    try {
      setLoading(true);
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser.id,
          ...editFormData,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess('User updated successfully');
        setEditDialog(false);
        fetchUsers();
      } else {
        setError(result.error || 'Failed to update user');
      }
    } catch (err) {
      setError('Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/admin/users?userId=${selectedUser.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        setSuccess('User deleted successfully');
        setDeleteDialog(false);
        fetchUsers();
      } else {
        setError(result.error || 'Failed to delete user');
      }
    } catch (err) {
      setError('Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  const handleKycApproval = async (user: User, action: 'APPROVE' | 'REJECT') => {
    try {
      // First, get the KYC ID for this user
      const kycResponse = await fetch(`/api/admin/kyc?userId=${user.id}`);
      const kycData = await kycResponse.json();
      
      if (!kycData.success || !kycData.data) {
        setError('KYC record not found for this user');
        return;
      }

      const response = await fetch('/api/admin/kyc', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kycId: kycData.data.id,
          action,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(`KYC ${action === 'APPROVE' ? 'approved' : 'rejected'} successfully`);
        fetchUsers();
      } else {
        setError(result.error || 'Failed to update KYC status');
      }
    } catch (err) {
      setError('Failed to update KYC status');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Navbar />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Stack spacing={3}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
                User Management
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Monitor and manage all platform users
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={fetchUsers}
              disabled={loading}
            >
              Refresh
            </Button>
          </Stack>

          {/* Filters */}
          <Card>
            <CardContent>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField
                  fullWidth
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') handleSearch();
                  }}
                  InputProps={{
                    startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
                <FormControl sx={{ minWidth: 150 }}>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={roleFilter}
                    label="Role"
                    onChange={(e) => setRoleFilter(e.target.value)}
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="TRADER">Trader</MenuItem>
                    <MenuItem value="ADMIN">Admin</MenuItem>
                  </Select>
                </FormControl>
                <FormControl sx={{ minWidth: 150 }}>
                  <InputLabel>KYC Status</InputLabel>
                  <Select
                    value={kycFilter}
                    label="KYC Status"
                    onChange={(e) => setKycFilter(e.target.value)}
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="APPROVED">Approved</MenuItem>
                    <MenuItem value="PENDING">Pending</MenuItem>
                  </Select>
                </FormControl>
                <FormControl sx={{ minWidth: 180 }}>
                  <InputLabel>Active Challenge</InputLabel>
                  <Select
                    value={activeFilter}
                    label="Active Challenge"
                    onChange={(e) => setActiveFilter(e.target.value)}
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="true">Has Active</MenuItem>
                    <MenuItem value="false">No Active</MenuItem>
                  </Select>
                </FormControl>
                <Button variant="contained" onClick={handleSearch} disabled={loading}>
                  Search
                </Button>
              </Stack>
            </CardContent>
          </Card>

          {/* Alerts */}
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" onClose={() => setSuccess(null)}>
              {success}
            </Alert>
          )}

          {/* Users Table */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Paper sx={{ borderRadius: 3, border: (theme) => `1px solid ${theme.palette.divider}` }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>User</strong></TableCell>
                      <TableCell><strong>Role</strong></TableCell>
                      <TableCell><strong>KYC Status</strong></TableCell>
                      <TableCell><strong>Challenges</strong></TableCell>
                      <TableCell><strong>Total Spent</strong></TableCell>
                      <TableCell><strong>Joined</strong></TableCell>
                      <TableCell align="center"><strong>Actions</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center">
                          <Typography color="text.secondary" py={4}>
                            No users found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((user) => (
                        <TableRow key={user.id} hover>
                          <TableCell>
                            <Box>
                              <Typography variant="body2" fontWeight={600}>
                                {user.name || 'Unnamed User'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {user.email}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={user.role}
                              size="small"
                              color={user.role === 'ADMIN' ? 'secondary' : 'default'}
                            />
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Chip
                                label={user.kycStatus}
                                size="small"
                                color={user.kycStatus === 'APPROVED' ? 'success' : 'warning'}
                              />
                              {user.kycStatus === 'PENDING' && (
                                <Stack direction="row" spacing={0.5}>
                                  <IconButton
                                    size="small"
                                    color="success"
                                    onClick={() => handleKycApproval(user, 'APPROVE')}
                                    title="Approve KYC"
                                  >
                                    <CheckCircle fontSize="small" />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleKycApproval(user, 'REJECT')}
                                    title="Reject KYC"
                                  >
                                    <Cancel fontSize="small" />
                                  </IconButton>
                                </Stack>
                              )}
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Chip
                                label={`${user.activeChallengesCount} Active`}
                                size="small"
                                color="success"
                                variant={user.activeChallengesCount > 0 ? 'filled' : 'outlined'}
                              />
                              <Chip
                                label={`${user.passedChallengesCount} Passed`}
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                              <Chip
                                label={`${user.failedChallengesCount} Failed`}
                                size="small"
                                color="error"
                                variant="outlined"
                              />
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Typography
                              sx={{
                                fontFamily: robotoMonoFontFamily,
                                fontWeight: 600,
                              }}
                            >
                              {formatCurrency(user.totalSpent)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {formatDate(user.createdAt)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              onClick={(e) => handleMenuOpen(e, user.id)}
                            >
                              <MoreVert />
                            </IconButton>
                            <Menu
                              anchorEl={anchorEl}
                              open={Boolean(anchorEl) && menuUserId === user.id}
                              onClose={handleMenuClose}
                            >
                              <MenuItem onClick={() => handleEditClick(user)}>
                                <ListItemIcon>
                                  <Edit fontSize="small" />
                                </ListItemIcon>
                                <ListItemText>Edit User</ListItemText>
                              </MenuItem>
                              <MenuItem onClick={() => handleDeleteClick(user)}>
                                <ListItemIcon>
                                  <Delete fontSize="small" color="error" />
                                </ListItemIcon>
                                <ListItemText sx={{ color: 'error.main' }}>Delete User</ListItemText>
                              </MenuItem>
                            </Menu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              
              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                  <Pagination
                    count={pagination.totalPages}
                    page={pagination.page}
                    onChange={handlePageChange}
                    color="primary"
                  />
                </Box>
              )}
            </Paper>
          )}

          {/* Stats Summary */}
          {!loading && users.length > 0 && (
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Showing {users.length} of {pagination.total} total users
                </Typography>
              </CardContent>
            </Card>
          )}
        </Stack>
      </Container>

      {/* Edit User Dialog */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" spacing={1} alignItems="center">
            <Person />
            <Typography variant="h6">Edit User</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Name"
              value={editFormData.name}
              onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={editFormData.email}
              onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
            />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={editFormData.role}
                label="Role"
                onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
              >
                <MenuItem value="TRADER">Trader</MenuItem>
                <MenuItem value="ADMIN">Admin</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>Cancel</Button>
          <Button onClick={handleEditSubmit} variant="contained" disabled={loading}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" spacing={1} alignItems="center">
            <Delete color="error" />
            <Typography variant="h6">Delete User</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This action cannot be undone. All user data including challenges, payments, and KYC information will be permanently deleted.
          </Alert>
          {selectedUser && (
            <Typography variant="body1">
              Are you sure you want to delete user <strong>{selectedUser.name || selectedUser.email}</strong>?
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} variant="contained" color="error" disabled={loading}>
            Delete User
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
