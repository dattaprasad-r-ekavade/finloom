import { Alert, Typography } from '@mui/material';
import { ContentPage } from '@/components/ui';

export default function RefundPolicy() {
  return (
    <ContentPage title="Payment and refund preview" meta="Preview notice · September 23, 2026">
      <Alert severity="info" sx={{ my: 3 }}>
        Paid checkout is disabled in this deployment. No purchase is available here.
      </Alert>
      <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.85 }}>
        Before any paid assessment opens, Finloom will publish the exact fee and billing period, renewal and cancellation steps, what each subscription includes, attempt and retry rules, refund eligibility, platform-outage remedies, taxes, payment provider, invoice details and a working support channel. Those conditions will be shown before payment and reviewed for the Indian launch. The placeholder prices and legacy wording elsewhere in this development branch are not an offer to sell a service.
      </Typography>
    </ContentPage>
  );
}
