import { Box, Typography, Paper } from '@mui/material';
import ConstructionIcon from '@mui/icons-material/Construction';

export default function DashboardV2() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant='h4'>Dashboard</Typography>
      <Paper
        sx={{
          p: 6,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 480,
          gap: 2,
          textAlign: 'center',
        }}
      >
        <ConstructionIcon sx={{ fontSize: 80, color: 'warning.main' }} />
        <Typography variant='h4' fontWeight={600}>
          Under Construction
        </Typography>
        <Typography variant='body1' color='text.secondary' maxWidth={480}>
          We're working hard to build a better dashboard experience. Check back soon!
        </Typography>
      </Paper>
    </Box>
  );
}
