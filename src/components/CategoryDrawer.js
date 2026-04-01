import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Button,
  Modal,
} from '@mui/material';
import CategoryModal from './CategoryModal';

export default function CategoryDrawer({ open, onClose, onCategorySelect }) {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);

  const fetchCategories = async () => {
    if (!hasMore || loadingCategories) return;

    setLoadingCategories(true);
    try {
      const response = await fetch(
        `http://localhost:3003/categories?page=${page}&limit=20&search=${search}`
      );
      const data = await response.json();

      if (data.response.status === 'success') {
        setCategories((prev) => [...prev, ...data.response.data]);
        if (data.response.data.length < 20) {
          setHasMore(false);
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    if (open) {
      setSearch('');
      setPage(1);
      setCategories([]);
      setHasMore(true);
      fetchCategories();
    }
  }, [open]);

  useEffect(() => {
    fetchCategories();
  }, [page, search]);

  const handleCategoryClick = (category) => {
    onCategorySelect(category);
    onClose();
  };

  const handleNewCategory = () => {
    setCategoryModalOpen(true);
  };

  const handleCategoryCreated = (newCategory) => {
    setCategories((prev) => [newCategory, ...prev]);
    onCategorySelect(newCategory);
    setCategoryModalOpen(false);
  };

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="category-drawer-title">
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          right: '420px', // Position the modal next to the ProductDrawer
          width: 400,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 3,
          borderRadius: 2,
        }}
      >
        <Typography id="category-drawer-title" variant="h6" sx={{ mb: 2 }}>
          Select Category
        </Typography>
        <TextField
          label="Search Categories"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
            setCategories([]);
            setHasMore(true);
          }}
          fullWidth
          sx={{ mb: 2 }}
        />
        <List
          sx={{ flex: 1, overflow: 'auto', maxHeight: '300px' }}
          onScroll={(event) => {
            const listboxNode = event.currentTarget;
            if (
              listboxNode.scrollTop + listboxNode.clientHeight ===
              listboxNode.scrollHeight
            ) {
              setPage((prev) => prev + 1);
            }
          }}
        >
          {categories.map((category) => (
            <ListItem
              button
              key={category.id}
              onClick={() => handleCategoryClick(category)}
            >
              <ListItemText primary={category.name} secondary={category.description} />
            </ListItem>
          ))}
          {loadingCategories && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <CircularProgress />
            </Box>
          )}
        </List>
        <Button
          variant="outlined"
          color="primary"
          onClick={handleNewCategory}
          sx={{ mt: 2 }}
        >
          Add New Category
        </Button>
      </Box>
      <CategoryModal
        open={isCategoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        onCategoryCreated={handleCategoryCreated}
      />
    </Modal>
  );
}