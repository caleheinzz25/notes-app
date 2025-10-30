        // Initialize data
        let notes = JSON.parse(localStorage.getItem('smart-notes')) || [
            {
                id: '1',
                title: 'Welcome to Smart Notes',
                content: 'This is your first note. You can edit or delete it.',
                tags: ['welcome', 'example'],
                pinned: false,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: '2',
                title: 'Example Note with Tags',
                content: 'This note has some tags to help with organization.',
                tags: ['example', 'organization', 'tag'],
                pinned: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: '3',
                title: 'New Project Idea',
                content: 'Let\'s create something exciting with this note app!',
                tags: ['idea', 'project', 'future'],
                pinned: false,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];
        
        // Initialize if not present
        if (!localStorage.getItem('smart-notes')) {
            localStorage.setItem('smart-notes', JSON.stringify(notes));
        } else {
            notes = JSON.parse(localStorage.getItem('smart-notes'));
        }
        
        // Initialize global variables
        let editingNoteId = null;
        let currentTheme = localStorage.getItem('theme') || 'light';
        let searchQuery = '';
        
        // Initialize components
        document.addEventListener('DOMContentLoaded', function() {
            // Set initial theme
            setInitialTheme();
            
            // Render initial notes
            renderNotes();
            
            // Setup event listeners
            document.getElementById('addNoteBtn').addEventListener('click', openModalForNewNote);
            document.getElementById('createFirstNote').addEventListener('click', openModalForNewNote);
            document.getElementById('themeToggle').addEventListener('click', toggleTheme);
            
            // Handle form submission
            document.getElementById('noteForm').addEventListener('submit', function(e) {
                e.preventDefault();
                saveNote();
            });
            
            // Close modal handlers
            document.getElementById('cancelBtn').addEventListener('click', closeModal);
            document.getElementById('closeModal').addEventListener('click', closeModal);
            
            // Search functionality
            document.getElementById('searchInput').addEventListener('input', function(e) {
                searchQuery = e.target.value.toLowerCase().trim();
                renderNotes();
            });
        });
        
        // Function to set initial theme
        function setInitialTheme() {
            const savedTheme = localStorage.getItem('theme');
            const themeIcon = document.getElementById('themeIcon');
            
            if (savedTheme === 'dark') {
                document.documentElement.classList.add('dark');
                themeIcon.classList.remove('fa-moon');
                themeIcon.classList.add('fa-sun');
            } else {
                document.documentElement.classList.remove('dark');
                themeIcon.classList.remove('fa-sun');
                themeIcon.classList.add('fa-moon');
            }
        }
        
        // Function to render notes
        function renderNotes() {
            const notesContainer = document.getElementById('notesContainer');
            const emptyState = document.getElementById('emptyState');
            const noResultsState = document.getElementById('noResultsState');
            
            // Clear container first
            notesContainer.innerHTML = '';
            
            // Filter notes based on search
            let filteredNotes = notes;
            if (searchQuery) {
                filteredNotes = notes.filter(note => 
                    note.title.toLowerCase().includes(searchQuery) || 
                    note.content.toLowerCase().includes(searchQuery) ||
                    note.tags.some(tag => tag.toLowerCase().includes(searchQuery))
                );
            }
            
            // Show empty state if no notes
            if (notes.length === 0) {
                emptyState.classList.remove('hidden');
                noResultsState.classList.add('hidden');
                return;
            }
            
            emptyState.classList.add('hidden');
            
            // Show no results state if search finds nothing
            if (searchQuery && filteredNotes.length === 0) {
                noResultsState.classList.remove('hidden');
                return;
            }
            
            noResultsState.classList.add('hidden');
            
            // Render each note
            filteredNotes.forEach(note => {
                const noteElement = document.createElement('div');
                noteElement.className = 'note-card bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 hover:shadow-lg transition-all duration-300 cursor-pointer';
                noteElement.innerHTML = `
                    <div class="flex justify-between items-start mb-2">
                        <h3 class="font-semibold text-lg truncate">${note.title}</h3>
                        ${note.pinned ? '<span class="text-yellow-500"><i class="fas fa-thumbtack"></i></span>' : ''}
                    </div>
                    <p class="text-gray-600 dark:text-gray-300 mb-3">${note.content.substring(0, 100)}${note.content.length > 100 ? '...' : ''}</p>
                    <div class="flex flex-wrap gap-1 mb-3">
                        ${note.tags.map(tag => `<span class="text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-200 px-2 py-1 rounded-full">${tag}</span>`).join('')}
                    </div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">
                        ${formatDate(note.updatedAt)}
                    </div>
                    <div class="mt-4 flex space-x-2">
                        <button class="edit-btn px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition" data-id="${note.id}">
                            <i class="fas fa-edit mr-1"></i> Edit
                        </button>
                        <button class="delete-btn px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition" data-id="${note.id}">
                            <i class="fas fa-trash mr-1"></i> Delete
                        </button>
                    </div>
                `;
                
                // Add event listeners for edit and delete
                noteElement.querySelector('.edit-btn').addEventListener('click', function() {
                    openModalForEdit(note.id);
                });
                
                noteElement.querySelector('.delete-btn').addEventListener('click', function() {
                    deleteNote(note.id);
                });
                
                notesContainer.appendChild(noteElement);
            });
        }
        
        // Function to open modal
        function openModalForNewNote() {
            editingNoteId = null;
            document.getElementById('modalTitle').textContent = 'New Note';
            document.getElementById('noteForm').reset();
            document.getElementById('noteTitle').focus();
            document.getElementById('noteModal').classList.remove('hidden');
        }
        
        function openModalForEdit(noteId) {
            const note = notes.find(n => n.id === noteId);
            if (note) {
                editingNoteId = noteId;
                document.getElementById('modalTitle').textContent = 'Edit Note';
                document.getElementById('noteTitle').value = note.title;
                document.getElementById('noteContent').value = note.content;
                document.getElementById('noteTags').value = note.tags.join(', ');
                document.getElementById('noteModal').classList.remove('hidden');
            }
        }
        
        // Function to close modal
        function closeModal() {
            document.getElementById('noteModal').classList.add('hidden');
        }
        
        // Function to save note
        function saveNote() {
            const title = document.getElementById('noteTitle').value;
            const content = document.getElementById('noteContent').value;
            const tags = document.getElementById('noteTags').value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
            
            if (editingNoteId) {
                // Edit existing note
                const noteIndex = notes.findIndex(n => n.id === editingNoteId);
                if (noteIndex !== -1) {
                    notes[noteIndex] = {
                        ...notes[noteIndex],
                        title,
                        content,
                        tags,
                        updatedAt: new Date()
                    };
                }
            } else {
                // Add new note
                const newNote = {
                    id: Date.now().toString(),
                    title,
                    content,
                    tags,
                    pinned: false,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
                notes.push(newNote);
            }
            
            // Save to localStorage
            localStorage.setItem('smart-notes', JSON.stringify(notes));
            
            // Close modal and refresh
            closeModal();
            renderNotes();
        }
        
        // Function to delete note
        function deleteNote(noteId) {
            if (confirm('Are you sure you want to delete this note?')) {
                notes = notes.filter(note => note.id !== noteId);
                localStorage.setItem('smart-notes', JSON.stringify(notes));
                renderNotes();
            }
        }
        
        // Function to toggle theme
        function toggleTheme() {
            const html = document.documentElement;
            const themeIcon = document.getElementById('themeIcon');
            
            if (html.classList.contains('dark')) {
                html.classList.remove('dark');
                localStorage.setItem('theme', 'light');
                themeIcon.classList.remove('fa-sun');
                themeIcon.classList.add('fa-moon');
            } else {
                html.classList.add('dark');
                localStorage.setItem('theme', 'dark');
                themeIcon.classList.remove('fa-moon');
                themeIcon.classList.add('fa-sun');
            }
        }
        
        // Utility function to format date
        function formatDate(date) {
            const now = new Date();
            const targetDate = new Date(date);
            const diffInMs = now - targetDate;
            const diffInSeconds = Math.floor(diffInMs / 1000);
            const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
            const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
            const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
            
            if (diffInSeconds < 1) return 'Just now';
            if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
            if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
            if (diffInHours < 24) return `${diffInHours} hours ago`;
            if (diffInDays < 7) return `${diffInDays} days ago`;
            
            return targetDate.toLocaleDateString();
        }