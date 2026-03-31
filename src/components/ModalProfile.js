import React, { useState } from 'react';
import { Modal, Box, Typography, TextField, Button, CircularProgress } from '@mui/material';
import axios from 'axios';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

export default function ModalProfile({ open, onClose, onSuccess }) {
  const [profileName, setProfileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSave = async () => {
    if (!profileName.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post('http://localhost:3003/profiles', {
        businessName: profileName,
        status: 'active',
      });
      setProfileName('');
      if (onSuccess) onSuccess(res.data.response.data);
      onClose();
    } catch (err) {
      setError('Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setProfileName('');
    setError(null);
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style}>
        <Typography variant="h6" mb={2}>Create Profile</Typography>
        <TextField
          fullWidth
          label="Profile Name"
          value={profileName}
          onChange={e => setProfileName(e.target.value)}
          disabled={loading}
          autoFocus
        />
        {error && (
          <Typography color="error" mt={1}>{error}</Typography>
        )}
        <Box mt={3} display="flex" justifyContent="flex-end">
          <Button onClick={handleClose} disabled={loading} sx={{ mr: 1 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            disabled={loading || !profileName.trim()}
          >
            {loading ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
