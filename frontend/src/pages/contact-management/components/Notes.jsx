import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import Icon from 'components/AppIcon';
import { notesService } from '../../../services/notesService';
import { useAuth } from '../../../contexts/AuthContext';

const Notes = ({ contact, onNotesCountChange }) => {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [newNote, setNewNote] = useState({ title: '', content: '' });

  // Update notes count whenever notes change
  useEffect(() => {
    if (onNotesCountChange) {
      onNotesCountChange(notes.length);
    }
  }, [notes.length, onNotesCountChange]);

  // Load notes for this contact
  useEffect(() => {
    const loadNotes = async () => {
      if (!contact?.id) return;
      
      try {
        setLoading(true);
        setError('');
        const notesData = await notesService.getContactNotes(contact.id);
        setNotes(notesData);
      } catch (err) {
        console.error('Error loading notes:', err);
        setError('Failed to load notes. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadNotes();
  }, [contact?.id]);

  const handleAddNote = async () => {
    if (!newNote.content.trim()) {
      setError('Note content is required');
      return;
    }

    try {
      setError('');
      const noteData = {
        title: newNote.title.trim() || null,
        content: newNote.content.trim(),
        contact_id: contact.id
      };

      const createdNote = await notesService.createNote(noteData);
      setNotes([createdNote, ...notes]);
      setNewNote({ title: '', content: '' });
      setIsAddingNote(false);
    } catch (err) {
      console.error('Error creating note:', err);
      setError('Failed to create note. Please try again.');
    }
  };

  const handleEditNote = async () => {
    if (!editingNote.content.trim()) {
      setError('Note content is required');
      return;
    }

    try {
      setError('');
      const updates = {
        title: editingNote.title.trim() || null,
        content: editingNote.content.trim()
      };

      const updatedNote = await notesService.updateNote(editingNote.id, updates);
      setNotes(notes.map(note => 
        note.id === editingNote.id ? updatedNote : note
      ));
      setEditingNote(null);
    } catch (err) {
      console.error('Error updating note:', err);
      setError('Failed to update note. Please try again.');
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) {
      return;
    }

    try {
      setError('');
      await notesService.deleteNote(noteId);
      setNotes(notes.filter(note => note.id !== noteId));
    } catch (err) {
      console.error('Error deleting note:', err);
      setError('Failed to delete note. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy • h:mm a');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const canEditNote = (note) => {
    return user?.id === note.created_by;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-3 text-text-secondary">Loading notes...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="bg-error-50 border border-error-200 text-error p-4 rounded-lg flex items-center space-x-2">
          <Icon name="AlertCircle" size={20} />
          <span>{error}</span>
          <button
            onClick={() => setError('')}
            className="ml-auto text-error hover:text-error-600"
          >
            <Icon name="X" size={16} />
          </button>
        </div>
      )}

      {/* Add Note Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-text-primary">
          Notes ({notes.length})
        </h3>
        <button
          onClick={() => setIsAddingNote(true)}
          className="btn-primary inline-flex items-center space-x-2"
        >
          <Icon name="Plus" size={16} />
          <span>Add Note</span>
        </button>
      </div>

      {/* Add Note Form */}
      {isAddingNote && (
        <div className="card p-4 border-2 border-primary-200">
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Note title (optional)"
              value={newNote.title}
              onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
              className="input-field"
            />
            <textarea
              placeholder="Write your note here..."
              value={newNote.content}
              onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
              className="input-field h-32 resize-none"
              autoFocus
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsAddingNote(false);
                  setNewNote({ title: '', content: '' });
                  setError('');
                }}
                className="px-4 py-2 border border-border rounded-lg text-text-secondary hover:text-text-primary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddNote}
                className="btn-primary"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notes List */}
      {notes.length === 0 ? (
        <div className="text-center py-8">
          <Icon name="FileText" size={32} className="text-text-tertiary mx-auto mb-3" />
          <p className="text-text-secondary">No notes available</p>
          <p className="text-text-tertiary text-sm mt-1">
            Add a note to keep track of important information about this contact
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {notes.map((note) => (
            <div key={note.id} className="card p-4">
              {editingNote?.id === note.id ? (
                // Edit Mode
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Note title (optional)"
                    value={editingNote.title || ''}
                    onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
                    className="input-field"
                  />
                  <textarea
                    placeholder="Write your note here..."
                    value={editingNote.content}
                    onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                    className="input-field h-32 resize-none"
                  />
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => {
                        setEditingNote(null);
                        setError('');
                      }}
                      className="px-4 py-2 border border-border rounded-lg text-text-secondary hover:text-text-primary transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleEditNote}
                      className="btn-primary"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                // View Mode
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      {note.title && (
                        <h4 className="font-medium text-text-primary mb-1">
                          {note.title}
                        </h4>
                      )}
                      <div className="flex items-center text-sm text-text-secondary">
                        <span>
                          {note.author ? 
                            `${note.author.first_name} ${note.author.last_name}` : 
                            'Unknown User'
                          }
                        </span>
                        <span className="mx-2">•</span>
                        <span>{formatDate(note.created_at)}</span>
                        {note.updated_at !== note.created_at && (
                          <>
                            <span className="mx-2">•</span>
                            <span className="text-text-tertiary">edited</span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {canEditNote(note) && (
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => setEditingNote({ ...note })}
                          className="text-text-tertiary hover:text-primary transition-colors"
                          title="Edit note"
                        >
                          <Icon name="Edit" size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className="text-text-tertiary hover:text-error transition-colors"
                          title="Delete note"
                        >
                          <Icon name="Trash2" size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-text-primary whitespace-pre-wrap">
                    {note.content}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notes;