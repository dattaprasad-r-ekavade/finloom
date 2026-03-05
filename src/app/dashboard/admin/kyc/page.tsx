'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  HourglassTop,
  VerifiedUser,
} from '@mui/icons-material';
import Navbar from '@/components/Navbar';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/lib/dateFormat';

interface KycRecord {
  id: string;
  status: string;
  fullName: string;
  phoneNumber: string;
  panNumber: string | null;
  dateOfBirth: string | null;
  address: string;
  rejectionReason: string | null;
  createdAt: string;
  approvedAt: string | null;
  rejectedAt: string | null;
  user: {
    id: string;
    email: string;
    name: string | null;
  };
}

const STATUS_COLORS: Record<string, 'warning' | 'success' | 'error' | 'default'> = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'error',
  AUTO_APPROVED: 'success',
};

export default function AdminKycPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const [records, setRecords] = useState<KycRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('PENDING');

  // Reject dialog
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectingKycId, setRejectingKycId] = useState<string | null>(null);
  const [rejectingName, setRejectingName] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      router.replace('/login');
    } else if (user.role !== 'ADMIN') {
      router.replace('/unauthorized');
    }
  }, [user, router]);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url =
        statusFilter === 'ALL'
          ? '/api/admin/kyc'
          : `/api/admin/kyc?status=${statusFilter}`;
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Failed to load KYC records.');
      } else {
        setRecords(data.data ?? []);
      }
    } catch {
      setError('Unable to connect to server.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handleApprove = async (kycId: string, name: string) => {
    setActionLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const res = await fetch('/api/admin/kyc', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kycId, action: 'APPROVE' }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Failed to approve KYC.');
      } else {
        setSuccessMessage(`KYC for ${name} approved.`);
        fetchRecords();
      }
    } catch {
      setError('Unable to connect to server.');
    } finally {
      setActionLoading(false);
    }
  };

  const openRejectDialog = (kycId: string, name: string) => {
    setRejectingKycId(kycId);
    setRejectingName(name);
    setRejectionReason('');
    setRejectDialogOpen(true);
  };

  const handleRejectConfirm = async () => {
    if (!rejectingKycId) return;
    setActionLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const res = await fetch('/api/admin/kyc', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kycId: rejectingKycId,
          action: 'REJECT',
          rejectionReason: rejectionReason || 'No reason provided',
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Failed to reject KYC.');
      } else {
        setSuccessMessage(`KYC for ${rejectingName} rejected.`);
        setRejectDialogOpen(false);
        fetchRecords();
      }
    } catch {
      setError('Unable to connect to server.');
    } finally {
      setActionLoading(false);
    }
  };

  const filters = ['PENDING', 'APPROVED', 'REJECTED', 'ALL'];

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Navbar />
      <Container maxWidth="xl" sx={{ py: { xs: 4, md: 6 } }}>
        <Stack spacing={4}>
          {/* Header */}
          <Stack spacing={1}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <VerifiedUser color="primary" />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                KYC Review Queue
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Review and approve trader KYC submissions. Target turnaround: 1–2 business days.
            </Typography>
          </Stack>

          {/* Filters */}
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {filters.map((f) => (
              <Chip
                key={f}
                label={f}
                onClick={() => setStatusFilter(f)}
                variant={statusFilter === f ? 'filled' : 'outlined'}
                color={statusFilter === f ? 'primary' : 'default'}
                sx={{ fontWeight: 600 }}
              />
            ))}
          </Stack>

          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {successMessage && (
            <Alert severity="success" onClose={() => setSuccessMessage(null)}>
              {successMessage}
            </Alert>
          )}

          {/* Table */}
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: (theme) => `1px solid ${theme.palette.divider}`,
              overflow: 'hidden',
            }}
          >
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                <CircularProgress />
              </Box>
            ) : records.length === 0 ? (
              <CardContent sx={{ py: 6, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  No {statusFilter === 'ALL' ? '' : statusFilter.toLowerCase()} KYC records found.
                </Typography>
              </CardContent>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Trader</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>PAN</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Date of Birth</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Phone</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Submitted</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Reason</TableCell>
                      <TableCell sx={{ fontWeight: 700 }} align="right">
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {records.map((rec) => (
                      <TableRow key={rec.id} hover>
                        <TableCell>
                          <Stack spacing={0}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {rec.fullName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {rec.user.email}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{ fontFamily: 'monospace', letterSpacing: 1 }}
                          >
                            {rec.panNumber ?? '—'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{rec.dateOfBirth ?? '—'}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{rec.phoneNumber}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{formatDate(rec.createdAt)}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={rec.status}
                            color={STATUS_COLORS[rec.status] ?? 'default'}
                            icon={
                              rec.status === 'PENDING' ? (
                                <HourglassTop fontSize="small" />
                              ) : rec.status === 'APPROVED' || rec.status === 'AUTO_APPROVED' ? (
                                <CheckCircle fontSize="small" />
                              ) : (
                                <Cancel fontSize="small" />
                              )
                            }
                            sx={{ fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" color="text.secondary">
                            {rec.rejectionReason ?? '—'}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          {(rec.status === 'PENDING' || rec.status === 'REJECTED') && (
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                              <Button
                                size="small"
                                variant="contained"
                                color="success"
                                disabled={actionLoading}
                                startIcon={<CheckCircle fontSize="small" />}
                                onClick={() => handleApprove(rec.id, rec.fullName)}
                                sx={{ fontWeight: 600 }}
                              >
                                Approve
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                disabled={actionLoading}
                                startIcon={<Cancel fontSize="small" />}
                                onClick={() => openRejectDialog(rec.id, rec.fullName)}
                                sx={{ fontWeight: 600 }}
                              >
                                Reject
                              </Button>
                            </Stack>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Card>

          {/* SLA reminder */}
          <Alert severity="info" icon={<HourglassTop />}>
            <strong>SLA reminder:</strong> Process pending KYC submissions within 1–2 business days.
            Approved traders need KYC clearance before paying and starting their challenge.
          </Alert>
        </Stack>
      </Container>

      {/* Rejection dialog */}
      <Dialog
        open={rejectDialogOpen}
        onClose={() => setRejectDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Reject KYC — {rejectingName}</DialogTitle>
        <Divider />
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Optionally provide a reason so the trader knows what to fix before resubmitting.
            </Typography>
            <TextField
              label="Rejection reason (optional)"
              multiline
              minRows={3}
              fullWidth
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. PAN number does not match ID proof, illegible document, incorrect DOB..."
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setRejectDialogOpen(false)} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleRejectConfirm}
            variant="contained"
            color="error"
            disabled={actionLoading}
            startIcon={actionLoading ? <CircularProgress size={16} /> : <Cancel />}
          >
            {actionLoading ? 'Rejecting…' : 'Confirm rejection'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
