import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Menu,
  MenuItem,
  InputAdornment,
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  GetApp as ExportIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import courseService from '../../../services/courseService';

const LessonNotes = ({ courseId, lessonId }) => {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [editingNote, setEditingNote] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [exportAnchorEl, setExportAnchorEl] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const notesData = await courseService.getLessonNotes(courseId, lessonId);
        setNotes(notesData);
        setFilteredNotes(notesData);
      } catch (error) {
        setError('Failed to fetch notes');
      }
    };

    fetchNotes();
  }, [courseId, lessonId]);

  useEffect(() => {
    // Apply search filter
    let filtered = [...notes];
    if (searchQuery) {
      filtered = filtered.filter(note =>
        note.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredNotes(filtered);
  }, [notes, searchQuery]);

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    try {
      const response = await courseService.addLessonNote(courseId, lessonId, {
        content: newNote,
        timestamp: new Date().toISOString(),
      });
      setNotes([...notes, response]);
      setNewNote('');
    } catch (err) {
      setError('Failed to add note');
    }
  };

  const handleEditNote = async (note) => {
    try {
      const response = await courseService.updateLessonNote(courseId, lessonId, note.id, {
        content: editingNote.content,
      });
      setNotes(notes.map((n) => (n.id === note.id ? response : n)));
      setEditingNote(null);
    } catch (err) {
      setError('Failed to update note');
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await courseService.deleteLessonNote(courseId, lessonId, noteId);
      setNotes(notes.filter((n) => n.id !== noteId));
      setDeleteDialogOpen(false);
    } catch (err) {
      setError('Failed to delete note');
    }
  };

  const handleExportClick = (event) => {
    setExportAnchorEl(event.currentTarget);
  };

  const handleExportClose = () => {
    setExportAnchorEl(null);
  };

  const handleExport = async (format) => {
    try {
      const response = await courseService.exportNotes(courseId, lessonId, format);
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `notes-${new Date().toISOString().split('T')[0]}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      handleExportClose();
    } catch (error) {
      setError('Failed to export notes');
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Paper sx={{ p: 2, borderRadius: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Lesson Notes
          </Typography>
          <Button
            startIcon={<ExportIcon />}
            onClick={handleExportClick}
            size="small"
          >
            Export
          </Button>
        </Box>

        <TextField
          fullWidth
          size="small"
          placeholder="Search notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
        <List>
          {filteredNotes.map((note) => (
            <Paper key={note.id} sx={{ mb: 2 }}>
              <ListItem>
                {editingNote?.id === note.id ? (
                  <Box sx={{ width: '100%' }}>
                    <TextField
                      fullWidth
                      multiline
                      value={editingNote.content}
                      onChange={(e) =>
                        setEditingNote({
                          ...editingNote,
                          content: e.target.value,
                        })
                      }
                      sx={{ mb: 1 }}
                    />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => handleEditNote(note)}
                        startIcon={<SaveIcon />}
                      >
                        Save
                      </Button>
                      <Button
                        size="small"
                        onClick={() => setEditingNote(null)}
                        startIcon={<CancelIcon />}
                      >
                        Cancel
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <>
                    <ListItemText
                      primary={note.content}
                      secondary={new Date(note.timestamp).toLocaleString()}
                    />
                    <IconButton
                      edge="end"
                      onClick={() => {
                        setSelectedNote(note);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </>
                )}
              </ListItem>
            </Paper>
          ))}
        </List>
      </Box>

      <Divider />

      <Box sx={{ p: 2 }}>
        <TextField
          fullWidth
          multiline
          rows={3}
          placeholder="Add a new note..."
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          sx={{ mb: 1 }}
        />
        <Button
          fullWidth
          variant="contained"
          onClick={handleAddNote}
          disabled={!newNote.trim()}
          startIcon={<SaveIcon />}
        >
          Add Note
        </Button>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Note</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this note?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={() => handleDeleteNote(selectedNote?.id)} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Export Menu */}
      <Menu
        anchorEl={exportAnchorEl}
        open={Boolean(exportAnchorEl)}
        onClose={handleExportClose}
      >
        <MenuItem onClick={() => handleExport('json')}>Export as JSON</MenuItem>
        <MenuItem onClick={() => handleExport('csv')}>Export as CSV</MenuItem>
      </Menu>

      {error && (
        <Typography color="error" sx={{ p: 2 }}>
          {error}
        </Typography>
      )}
    </Box>
  );
};

export default LessonNotes; 