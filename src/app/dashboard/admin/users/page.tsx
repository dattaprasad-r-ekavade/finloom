'use client';

import React, { useEffect, useState } from 'react';
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
} from '@mui/material';
import { Search, Refresh } from '@mui/icons-material';
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

          {/* Users Table */}
          {error ? (
            <Alert severity="error">{error}</Alert>
          ) : loading ? (
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
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
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
                            <Chip
                              label={user.kycStatus}
                              size="small"
                              color={user.kycStatus === 'APPROVED' ? 'success' : 'warning'}
                            />
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
                              {new Date(user.createdAt).toLocaleDateString()}
                            </Typography>
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
    </Box>
  );
}
