
import React, { useEffect, useState } from 'react';
import { Typography, Container, Box, Button, List, ListItem, ListItemText, Paper, CircularProgress, TextField, InputAdornment, IconButton, useTheme } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import { fetchActiveProfiles, setActiveProfile } from '../../utils/profile';
import ModalProfile from '../../components/ModalProfile';

export default function Landing() {
  const theme = useTheme();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchActiveProfiles()
      .then(setProfiles)
      .catch(() => setError('Failed to load profiles'))
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = (id, name) => {
    setActiveProfile(id, name);
    window.location.href = '/app/dashboard';
  };

  const filteredProfiles = profiles.filter(profile =>
    profile.businessName.toLowerCase().includes(search.toLowerCase())
  );

  const elementWidth = { width: 400, maxWidth: '100%', margin: '0 auto' };

  return (
    <Container maxWidth="sm" style={{ marginTop: 64 }}>
      <Box textAlign="center" py={8}>
        <Typography variant="h2" gutterBottom>
          Welcome
        </Typography>
        <Box style={elementWidth} mb={2}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            fullWidth
            onClick={() => setModalOpen(true)}
          >
            Create Profile
          </Button>
        </Box>
        <ModalProfile
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSuccess={profile => {
            setProfiles(prev => [profile, ...prev]);
          }}
        />
        <Typography variant="body1" color="textSecondary" style={{ margin: '16px 0' }}>
          or
        </Typography>
        <Paper elevation={2} style={elementWidth}>
          <Box p={2} pb={0}>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              placeholder="Search profiles..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              InputProps={{
                endAdornment: search ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearch('')}>
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              }}
            />
          </Box>
          {loading ? (
            <Box py={4}><CircularProgress /></Box>
          ) : error ? (
            <Typography color="error" py={4}>{error}</Typography>
          ) : (
            <List>
              {filteredProfiles.map((profile, idx) => (
                <ListItem
                  button
                  key={profile.id}
                  onClick={() => handleSelect(profile.id, profile.businessName)}
                  style={{
                    backgroundColor:
                      idx % 2 === 0
                        ? theme.palette.background.default
                        : theme.palette.background.light,
                    color: theme.palette.text.primary,
                  }}
                >
                  <ListItemText primary={profile.businessName} />
                </ListItem>
              ))}
            </List>
          )}
        </Paper>
      </Box>
    </Container>
  );
}
