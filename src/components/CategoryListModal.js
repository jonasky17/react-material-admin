import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  Box,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
} from '@mui/material';
import CategoryModal from './CategoryModal';

const DRAWER_WIDTH = 400;
const LIST_MODAL_WIDTH = 400;
const CREATE_MODAL_WIDTH = 360;
const HEADER_HEIGHT = 64;

const CategoryListModal = ({ open, onClose, onSelectCategory, onCategoryCreated }) => {
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const listRef = useRef(null);

  const fetchCategories = async (targetPage, replace = false) => {
    if (loading) return;

    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3003/categories?page=${targetPage}&limit=20&search=${encodeURIComponent(search)}`
      );
      const data = await response.json();

      if (data.response.status === 'success') {
        const nextCategories = data.response.data || [];
        setCategories((prev) => (replace ? nextCategories : [...prev, ...nextCategories]));
        setHasMore(nextCategories.length === 20);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;

    setCategories([]);
    setPage(1);
    setHasMore(true);
    if (listRef.current) {
      listRef.current.scrollTop = 0;
    }

    fetchCategories(1, true);
  }, [open, search]);

  useEffect(() => {
    if (!open || page === 1 || !hasMore) return;
    fetchCategories(page);
  }, [open, page]);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollHeight - scrollTop - clientHeight < 5 && hasMore && !loading) {
      setPage((prev) => prev + 1);
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleCategoryCreated = (newCategory) => {
    setCategories((prev) => [newCategory, ...prev]);
    if (typeof onCategoryCreated === 'function') {
      onCategoryCreated(newCategory);
    }
    setCreateModalOpen(false);
  };

  return (
    <>
      <Modal open={open} onClose={onClose}>
        <Box
          sx={{
            position: 'fixed',
            top: `${HEADER_HEIGHT}px`,
            right: `${DRAWER_WIDTH}px`,
            width: 400,
            height: `calc(100vh - ${HEADER_HEIGHT}px)`,
            display: 'flex',
            flexDirection: 'column',
            bgcolor: 'background.paper',
            borderRadius: '8px 0 0 0',
            boxShadow: 3,
            overflow: 'hidden',
          }}
        >
          <Box sx={{ p: 3, pb: 0 }}>
            <Button
              variant="contained"
              fullWidth
              sx={{ textTransform: 'none', mb: 2 }}
              onClick={() => setCreateModalOpen(true)}
            >
              Add New Category
            </Button>
            <TextField
              label="Search"
              value={search}
              onChange={handleSearchChange}
              fullWidth
              sx={{ mb: 2 }}
            />
          </Box>
          <Box ref={listRef} sx={{ flex: 1, overflowY: 'auto' }} onScroll={handleScroll}>
            <List>
              {categories.map((category) => (
                <ListItem
                  key={category.id}
                  onClick={() => {
                    onSelectCategory(category);
                    onClose();
                  }}
                  sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                >
                  <ListItemText primary={category.name} />
                </ListItem>
              ))}
              {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              )}
            </List>
          </Box>
        </Box>
      </Modal>
      <CategoryModal
        open={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCategoryCreated={handleCategoryCreated}
        modalProps={{ hideBackdrop: true }}
        panelSx={{
          position: 'fixed',
          top: `${HEADER_HEIGHT}px`,
          right: `${DRAWER_WIDTH + LIST_MODAL_WIDTH}px`,
          transform: 'none',
          left: 'auto',
          width: CREATE_MODAL_WIDTH,
          height: `calc(100vh - ${HEADER_HEIGHT}px)`,
          borderRadius: '8px 0 0 0',
          p: 3,
          overflowY: 'auto',
        }}
      />
    </>
  );
};

export default CategoryListModal;