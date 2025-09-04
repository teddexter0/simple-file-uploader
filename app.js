const express = require('express');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();

// Data files
const USERS_FILE = path.join(__dirname, 'data', 'users.json');
const FILES_FILE = path.join(__dirname, 'data', 'files.json');
const FOLDERS_FILE = path.join(__dirname, 'data', 'folders.json');

// Data helpers
function readJSON(file) {
  try {
    if (fs.existsSync(file)) {
      return JSON.parse(fs.readFileSync(file, 'utf8'));
    }
  } catch (err) {
    console.error(`Error reading ${file}:`, err.message);
  }
  return [];
}

function writeJSON(file, data) {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(`Error writing ${file}:`, err.message);
  }
}

// Passport setup
passport.use(new LocalStrategy(
  { usernameField: 'email' },
  async (email, password, done) => {
    const users = readJSON(USERS_FILE);
    const user = users.find(u => u.email === email);
    
    if (!user) {
      return done(null, false, { message: 'User not found' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      return done(null, user);
    } else {
      return done(null, false, { message: 'Wrong password' });
    }
  }
));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
  const users = readJSON(USERS_FILE);
  const user = users.find(u => u.id === id);
  done(null, user);
});

// Middleware
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: 'simple-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

app.use(passport.initialize());
app.use(passport.session());

// Multer setup
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    // Allow most file types
    const allowed = /\.(jpg|jpeg|png|gif|pdf|txt|doc|docx|zip)$/i;
    if (allowed.test(file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed'));
    }
  }
});

// Auth middleware

function requireAuth(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  // Store the original URL they were trying to access
  req.session.returnTo = req.originalUrl;
  res.redirect('/login');
}
// ROUTES
app.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect('/dashboard');
  } else {
    res.render('home');
  }
});

app.get('/login', (req, res) => {
  res.render('login', { error: null });
});


app.post('/login', passport.authenticate('local', {
  failureRedirect: '/login'
}), (req, res) => {
  // Redirect to where they were trying to go, or dashboard
  const redirectTo = req.session.returnTo || '/dashboard';
  delete req.session.returnTo; // Clean up
  res.redirect(redirectTo);
});

app.get('/register', (req, res) => {
  res.render('register', { error: null });
});

app.post('/register', async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const users = readJSON(USERS_FILE);
    
    // Check if user exists
    if (users.find(u => u.email === email)) {
      return res.render('register', { error: 'User already exists!' });
    }
    
    // Create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: uuidv4(),
      email,
      username,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    writeJSON(USERS_FILE, users);
    
    // Auto login
    req.login(newUser, (err) => {
      if (err) throw err;
      res.redirect('/dashboard');
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.render('register', { error: 'Registration failed!' });
  }
});

app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) console.error(err);
    res.redirect('/');
  });
});

app.get('/dashboard', requireAuth, (req, res) => {
  const files = readJSON(FILES_FILE).filter(f => f.userId === req.user.id);
  const folders = readJSON(FOLDERS_FILE).filter(f => f.userId === req.user.id);
  res.render('dashboard', { 
    user: req.user, 
    files, 
    folders,
    message: null 
  });
});

// File upload
app.post('/upload', requireAuth, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.redirect('/dashboard?error=no-file');
    }
    
    const files = readJSON(FILES_FILE);
    const newFile = {
      id: uuidv4(),
      filename: req.file.originalname,
      storedName: req.file.filename,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
      userId: req.user.id,
      uploadedAt: new Date().toISOString()
    };
    
    files.push(newFile);
    writeJSON(FILES_FILE, files);
    res.redirect('/dashboard?success=uploaded');
  } catch (error) {
    console.error('Upload error:', error);
    res.redirect('/dashboard?error=upload-failed');
  }
});

// File download
app.get('/download/:id', requireAuth, (req, res) => {
  const files = readJSON(FILES_FILE);
  const file = files.find(f => f.id === req.params.id && f.userId === req.user.id);
  
  if (!file || !fs.existsSync(file.path)) {
    return res.status(404).send('File not found');
  }
  
  res.download(file.path, file.filename);
});

// Delete file
app.post('/delete/:id', requireAuth, (req, res) => {
  const files = readJSON(FILES_FILE);
  const fileIndex = files.findIndex(f => f.id === req.params.id && f.userId === req.user.id);
  
  if (fileIndex === -1) {
    return res.redirect('/dashboard?error=file-not-found');
  }
  
  const file = files[fileIndex];
  
  // Delete physical file
  try {
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
  } catch (err) {
    console.error('Error deleting file:', err);
  }
  
  // Remove from data
  files.splice(fileIndex, 1);
  writeJSON(FILES_FILE, files);
  
  res.redirect('/dashboard?success=deleted');
});

// Create folder
app.post('/folder', requireAuth, (req, res) => {
  const { name } = req.body;
  if (!name || name.trim() === '') {
    return res.redirect('/dashboard?error=invalid-folder-name');
  }
  
  const folders = readJSON(FOLDERS_FILE);
  const newFolder = {
    id: uuidv4(),
    name: name.trim(),
    userId: req.user.id,
    createdAt: new Date().toISOString()
  };
  
  folders.push(newFolder);
  writeJSON(FOLDERS_FILE, folders);
  res.redirect('/dashboard?success=folder-created');
});
// View folder contents

app.get('/folder/:id', (req, res) => {
  // Check authentication manually with better error handling
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;
    return res.redirect('/login');
  }
  
  try {
    const folders = readJSON(FOLDERS_FILE);
    const files = readJSON(FILES_FILE);
    
    const folder = folders.find(f => f.id === req.params.id && f.userId === req.user.id);
    
    if (!folder) {
      return res.redirect('/dashboard?error=folder-not-found');
    }
    
    const folderFiles = files.filter(f => f.folderId === folder.id && f.userId === req.user.id);
    const subfolders = folders.filter(f => f.parentId === folder.id && f.userId === req.user.id);
    
    res.render('folder', { 
      user: req.user, 
      folder,
      files: folderFiles,
      subfolders,
      message: null 
    });
  } catch (error) {
    console.error('Folder access error:', error);
    res.redirect('/dashboard?error=folder-access-failed');
  }
});

// Upload file to specific folder
app.post('/upload/:folderId?', requireAuth, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      const redirectTo = req.params.folderId ? `/folder/${req.params.folderId}` : '/dashboard';
      return res.redirect(`${redirectTo}?error=no-file`);
    }
    
    const files = readJSON(FILES_FILE);
    const folderId = req.params.folderId || req.body.folderId || null;
    
    const newFile = {
      id: uuidv4(),
      filename: req.file.originalname,
      storedName: req.file.filename,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
      userId: req.user.id,
      folderId: folderId, // This is the key addition!
      uploadedAt: new Date().toISOString()
    };
    
    files.push(newFile);
    writeJSON(FILES_FILE, files);
    
    const redirectTo = folderId ? `/folder/${folderId}` : '/dashboard';
    res.redirect(`${redirectTo}?success=uploaded`);
  } catch (error) {
    console.error('Upload error:', error);
    const redirectTo = req.params.folderId ? `/folder/${req.params.folderId}` : '/dashboard';
    res.redirect(`${redirectTo}?error=upload-failed`);
  }
});

// Initialize data directory and files
function initializeData() {
  if (!fs.existsSync('data')) {
    fs.mkdirSync('data');
  }
  if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
  }
  
  // Create empty data files if they don't exist
  [USERS_FILE, FILES_FILE, FOLDERS_FILE].forEach(file => {
    if (!fs.existsSync(file)) {
      writeJSON(file, []);
    }
  });
}

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('');
  console.log('🚀 Simple File Uploader is running!');
  console.log(`📱 Visit: http://localhost:${PORT}`);
  console.log('');
  console.log('✅ Features working:');
  console.log('  - User registration & login');
  console.log('  - File upload & download');
  console.log('  - Folder creation');
  console.log('  - File management');
  console.log('');
  
  initializeData();
});
