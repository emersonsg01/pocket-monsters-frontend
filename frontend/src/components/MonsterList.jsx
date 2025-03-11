import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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

const MonsterList = () => {
  const [monsters, setMonsters] = useState([]);
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [currentMonster, setCurrentMonster] = useState({ name: '', desc: '', type_id: '' });
  const [monsterToDelete, setMonsterToDelete] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Fetch monsters and types data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [monstersResponse, typesResponse] = await Promise.all([
          axios.get('http://localhost:3000/pocket-monster'),
          axios.get('http://localhost:3000/type')
        ]);
        
        setMonsters(monstersResponse.data);
        setTypes(typesResponse.data);
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

  const handleOpenDialog = (monster = { name: '', desc: '', type_id: '' }, isEdit = false) => {
    setCurrentMonster(monster);
    setIsEditing(isEdit);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleOpenDeleteDialog = (monster) => {
    setMonsterToDelete(monster);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setMonsterToDelete(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentMonster(prev => ({ ...prev, [name]: value }));
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleSubmit = async () => {
    try {
      if (!currentMonster.name) {
        showSnackbar('Monster name is required', 'error');
        return;
      }

      if (isEditing) {
        // Update existing monster
        await axios.put(`http://localhost:3000/pocket-monster/${currentMonster.id}`, currentMonster);
        setMonsters(monsters.map(monster => 
          monster.id === currentMonster.id ? currentMonster : monster
        ));
        showSnackbar('Monster updated successfully');
      } else {
        // Create new monster
        const response = await axios.post('http://localhost:3000/pocket-monster', currentMonster);
        const newMonsterId = response.data[0];
        setMonsters([...monsters, { ...currentMonster, id: newMonsterId }]);
        showSnackbar('Monster added successfully');
      }
      
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving monster:', error);
      showSnackbar('Failed to save monster', 'error');
    }
  };

  const handleDelete = async () => {
    if (!monsterToDelete) return;
    
    try {
      await axios.delete(`http://localhost:3000/pocket-monster/${monsterToDelete.id}`);
      setMonsters(monsters.filter(monster => monster.id !== monsterToDelete.id));
      showSnackbar('Monster deleted successfully');
      handleCloseDeleteDialog();
    } catch (error) {
      console.error('Error deleting monster:', error);
      showSnackbar('Failed to delete monster', 'error');
    }
  };

  const getTypeName = (typeId) => {
    const type = types.find(t => t.id === typeId);
    return type ? type.type : 'Unknown';
  };

  return (
    <Grid container spacing={3} className="fade-in">
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Pocket Monsters</Typography>
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
            Add Monster
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
                    <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {monsters
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((monster) => (
                      <TableRow hover key={monster.id} className="card">
                        <TableCell>{monster.id}</TableCell>
                        <TableCell>{monster.name}</TableCell>
                        <TableCell>{monster.desc || '-'}</TableCell>
                        <TableCell>{getTypeName(monster.type_id)}</TableCell>
                        <TableCell>
                          <IconButton 
                            color="primary" 
                            onClick={() => handleOpenDialog(monster, true)}
                            size="small"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton 
                            color="error" 
                            onClick={() => handleOpenDeleteDialog(monster)}
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  {monsters.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        No monsters found. Add your first monster!
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={monsters.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Paper>
        </Grid>
      )}

      {/* Add/Edit Monster Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{isEditing ? 'Edit Monster' : 'Add New Monster'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Monster Name"
            type="text"
            fullWidth
            variant="outlined"
            value={currentMonster.name}
            onChange={handleInputChange}
            required
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            margin="dense"
            name="desc"
            label="Description"
            type="text"
            fullWidth
            variant="outlined"
            value={currentMonster.desc || ''}
            onChange={handleInputChange}
            multiline
            rows={3}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="type-select-label">Type</InputLabel>
            <Select
              labelId="type-select-label"
              name="type_id"
              value={currentMonster.type_id || ''}
              label="Type"
              onChange={handleInputChange}
            >
              <MenuItem value=""><em>None</em></MenuItem>
              {types.map((type) => (
                <MenuItem key={type.id} value={type.id}>{type.type}</MenuItem>
              ))}
            </Select>
          </FormControl>
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
            Are you sure you want to delete the monster "{monsterToDelete?.name}"? This action cannot be undone.
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

export default MonsterList;