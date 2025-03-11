import { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Box,
  CircularProgress,
  Snackbar,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

const TypeList = () => {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [currentType, setCurrentType] = useState({ type: '' });
  const [typeToDelete, setTypeToDelete] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [monsterCounts, setMonsterCounts] = useState({});

  // Fetch types data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [typesResponse, monstersResponse] = await Promise.all([
          axios.get('http://localhost:3000/type'),
          axios.get('http://localhost:3000/pocket-monster')
        ]);
        
        setTypes(typesResponse.data);
        
        // Count monsters per type
        const counts = {};
        monstersResponse.data.forEach(monster => {
          if (monster.type_id) {
            counts[monster.type_id] = (counts[monster.type_id] || 0) + 1;
          }
        });
        setMonsterCounts(counts);
      } catch (error) {
        console.error('Error fetching data:', error);
        showSnackbar('Failed to load data', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (type = { type: '' }, isEdit = false) => {
    setCurrentType(type);
    setIsEditing(isEdit);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleOpenDeleteDialog = (type) => {
    setTypeToDelete(type);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setTypeToDelete(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentType(prev => ({ ...prev, [name]: value }));
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleSubmit = async () => {
    try {
      if (!currentType.type) {
        showSnackbar('Type name is required', 'error');
        return;
      }

      if (isEditing) {
        // Update existing type
        await axios.put(`http://localhost:3000/type/${currentType.id}`, currentType);
        setTypes(types.map(type => 
          type.id === currentType.id ? currentType : type
        ));
        showSnackbar('Type updated successfully');
      } else {
        // Create new type
        const response = await axios.post('http://localhost:3000/type', currentType);
        const newTypeId = response.data[0];
        setTypes([...types, { ...currentType, id: newTypeId }]);
        showSnackbar('Type added successfully');
      }
      
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving type:', error);
      showSnackbar('Failed to save type', 'error');
    }
  };

  const handleDelete = async () => {
    if (!typeToDelete) return;
    
    try {
      // Check if type has monsters
      if (monsterCounts[typeToDelete.id] && monsterCounts[typeToDelete.id] > 0) {
        showSnackbar(`Cannot delete type: ${monsterCounts[typeToDelete.id]} monsters are using this type`, 'error');
        handleCloseDeleteDialog();
        return;
      }
      
      await axios.delete(`http://localhost:3000/type/${typeToDelete.id}`);
      setTypes(types.filter(type => type.id !== typeToDelete.id));
      showSnackbar('Type deleted successfully');
      handleCloseDeleteDialog();
    } catch (error) {
      console.error('Error deleting type:', error);
      showSnackbar('Failed to delete type', 'error');
    }
  };

  return (
    <Grid container spacing={3} className="fade-in">
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Monster Types</Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{ 
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
              transition: 'all 0.3s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 10px 2px rgba(33, 203, 243, .3)',
              }
            }}
          >
            Add Type
          </Button>
        </Box>
      </Grid>

      {loading ? (
        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Grid>
      ) : (
        <Grid item xs={12}>
          <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <TableContainer sx={{ maxHeight: 440 }}>
              <Table stickyHeader aria-label="sticky table">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Type Name</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Monsters Count</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {types
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((type) => (
                      <TableRow hover key={type.id} className="card">
                        <TableCell>{type.id}</TableCell>
                        <TableCell>{type.type}</TableCell>
                        <TableCell>{monsterCounts[type.id] || 0}</TableCell>
                        <TableCell>
                          <IconButton 
                            color="primary" 
                            onClick={() => handleOpenDialog(type, true)}
                            size="small"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton 
                            color="error" 
                            onClick={() => handleOpenDeleteDialog(type)}
                            size="small"
                            disabled={monsterCounts[type.id] > 0}
                            title={monsterCounts[type.id] > 0 ? "Cannot delete: type is in use" : "Delete type"}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  {types.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        No types found. Add your first type!
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={types.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Paper>
        </Grid>
      )}

      {/* Add/Edit Type Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{isEditing ? 'Edit Type' : 'Add New Type'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="type"
            label="Type Name"
            type="text"
            fullWidth
            variant="outlined"
            value={currentType.type}
            onChange={handleInputChange}
            required
            sx={{ mb: 2, mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {isEditing ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the type "{typeToDelete?.type}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Grid>
  );
};

export default TypeList;