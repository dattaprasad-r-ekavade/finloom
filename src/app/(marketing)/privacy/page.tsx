import { Alert, Box, Divider, Stack, Typography } from '@mui/material';
import { ContentPage } from '@/components/ui';

const sections = [
  {
    title: 'What this preview may collect',
    body: 'Account registration asks for a name, email address and password; passwords are stored as password hashes. If enabled in a local development environment, the identity form stores a phone number, PAN, date of birth and address. The product may also store simulated trade entries, assessment progress and technical logs. Do not submit sensitive identity information to a preview deployment.',
  },
  {
    title: 'Analytics and service providers',
    body: 'The application includes Vercel Analytics and Speed Insights. It is designed to run on Vercel and a PostgreSQL database. Paid checkout is disabled in this preview, and there is no live-data entitlement or simulated-profit payout. Provider roles, data locations, retention and deletion procedures must be documented for the launch service.',
  },
  {
    title: 'Before launch',
    body: 'Finloom must identify the responsible legal entity and privacy contact, document each purpose and legal basis, set retention and deletion schedules, review processor agreements, and publish a complete privacy policy and user-request process before collecting data from public paid users.',
  },
];

export default function PrivacyPolicy() {
  return (
    <ContentPage title="Privacy preview" meta="Preview notice · September 23, 2026">
      <Alert severity="warning" sx={{ my: 3 }}>
        This notice is not a final privacy policy. Do not enter real PAN, identity or address details in this preview. The data controller, support contact, retention rules and complete launch disclosures must be confirmed before public registration.
      </Alert>
      <Stack spacing={2.5} divider={<Divider flexItem />}>
        {sections.map((section) => (
          <Box key={section.title}>
            <Typography variant="h6" component="h2" sx={{ mb: 0.75 }}>{section.title}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>{section.body}</Typography>
          </Box>
        ))}
      </Stack>
    </ContentPage>
  );
}
