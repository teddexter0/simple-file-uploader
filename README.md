# Simple File Uploader

A basic file upload and management system built with Node.js and Express - perfect for learning web development!

## 🚀 Quick Start

```bash
# Navigate to project directory
cd simple-file-uploader

# Install dependencies
npm install

# Start the server
npm run dev

# Open your browser
http://localhost:3000
```

## ✨ What This App Does

- **👤 User Accounts**: Register and login with email/password
- **📁 Create Folders**: Organize your files in folders
- **📤 Upload Files**: Drag & drop or click to upload files
- **📥 Download Files**: Download your files anytime
- **🗑️ Delete Files**: Remove files you no longer need
- **📱 Mobile Friendly**: Works on phones and tablets

## 🛠️ Tech Stack

- **Backend**: Node.js + Express.js
- **Authentication**: Passport.js (username/password)
- **File Upload**: Multer (handles file uploads)
- **Templates**: EJS (renders HTML pages)
- **Storage**: JSON files (no database needed!)
- **Styling**: Custom CSS with modern design

## 📁 Project Structure

```
simple-file-uploader/
├── app.js              # Main server file
├── package.json        # Dependencies and scripts
├── data/               # JSON files (our "database")
│   ├── users.json      # User accounts
│   ├── files.json      # File information
│   └── folders.json    # Folder information
├── uploads/            # Where uploaded files are stored
├── views/              # HTML templates
│   ├── home.ejs        # Landing page
│   ├── login.ejs       # Login form
│   ├── register.ejs    # Sign up form
│   ├── dashboard.ejs   # Main file manager
│   └── folder.ejs      # Individual folder view
└── public/             # CSS, JavaScript, images
    ├── css/style.css   # All the styling
    └── js/main.js      # Interactive features
```

## 🎯 How to Use

### 1. First Time Setup
1. Visit `http://localhost:3000`
2. Click "Sign Up" 
3. Create account with email and password
4. You'll be automatically logged in

### 2. Upload Files
1. On dashboard, click "Choose File" or drag & drop
2. Select any file (images, PDFs, documents, etc.)
3. Click "Upload File"
4. File appears in your dashboard

### 3. Create Folders
1. Type a folder name in the "Create Folder" section
2. Click "Create Folder"
3. Folder appears in your dashboard
4. Click "Open Folder" to go inside it

### 4. Upload to Folders
1. Open any folder
2. Use the upload form inside the folder
3. Files will be saved inside that specific folder

### 5. Download & Delete
- Click "Download" to get a copy of your file
- Click "Delete" to remove files (asks for confirmation)

## 🔧 Configuration

The app works out of the box with these default settings:

- **Port**: 3000
- **File Size Limit**: 10 MB per file
- **Allowed File Types**: jpg, jpeg, png, gif, pdf, txt, doc, docx, zip
- **Session Length**: 24 hours

To change these, edit the values in `app.js`.

## 📊 How Data is Stored

Instead of a complex database, this app uses simple JSON files:

**users.json** - Stores user accounts:
```json
[
  {
    "id": "abc-123",
    "email": "user@example.com", 
    "username": "johndoe",
    "password": "hashed_password",
    "createdAt": "2024-09-04T17:30:00.000Z"
  }
]
```

**files.json** - Stores file information:
```json
[
  {
    "id": "def-456",
    "filename": "my-document.pdf",
    "storedName": "upload_12345.pdf",
    "path": "uploads/upload_12345.pdf",
    "size": 1048576,
    "mimetype": "application/pdf",
    "userId": "abc-123",
    "folderId": "ghi-789",
    "uploadedAt": "2024-09-04T17:35:00.000Z"
  }
]
```

**folders.json** - Stores folder information:
```json
[
  {
    "id": "ghi-789",
    "name": "My Documents",
    "userId": "abc-123", 
    "createdAt": "2024-09-04T17:32:00.000Z"
  }
]
```

## 🔐 Security Features

- **Password Hashing**: Uses bcrypt to securely hash passwords
- **Session Authentication**: Keeps you logged in securely
- **User Isolation**: You can only see your own files and folders
- **File Type Validation**: Only allows safe file types
- **File Size Limits**: Prevents huge file uploads

## 🚨 Troubleshooting

### App Won't Start?
```bash
# Make sure you're in the right directory
pwd  # Should show path ending in /simple-file-uploader

# Install dependencies again
npm install

# Check if port 3000 is free
lsof -i :3000  # Mac/Linux
netstat -ano | findstr :3000  # Windows
```

### Can't Upload Files?
- Check file size (must be under 10MB)
- Check file type (jpg, png, pdf, txt, doc, etc.)
- Make sure `uploads/` folder exists

### Getting Logged Out?
- This can happen during development
- Just log back in - your files are still there
- Clear browser cookies if it keeps happening

### Files Not Showing?
- Check the `data/` folder exists
- Look in `data/files.json` to see if file was saved
- Try refreshing the page

## 🎓 Learning Notes

This project teaches you:

### Frontend Skills
- **HTML Forms**: File uploads, user input
- **CSS Layout**: Responsive design, grid layouts  
- **JavaScript**: Drag & drop, form validation
- **User Experience**: Loading states, error messages

### Backend Skills
- **Express.js**: Routes, middleware, templates
- **Authentication**: Login/logout, password hashing
- **File Handling**: Upload, storage, download
- **Session Management**: Keeping users logged in
- **Data Storage**: JSON file operations

### Web Development Concepts
- **MVC Pattern**: Models (data), Views (templates), Controllers (routes)
- **RESTful Routes**: GET/POST for different actions
- **Security**: Authentication, input validation
- **Error Handling**: Try/catch, user-friendly messages

## 🎯 Perfect For

- **Learning Web Development**: Simple, complete example
- **Odin Project Assignment**: Meets all requirements
- **Personal File Storage**: Actually useful!
- **Portfolio Project**: Shows full-stack skills

## 🚀 Next Steps

Once you understand this app, you could:

1. **Add a real database** (PostgreSQL + Prisma)
2. **Deploy to the web** (Heroku, Railway, Vercel)
3. **Add file sharing** (share links with friends)
4. **Add file previews** (view images, PDFs in browser)
5. **Move to Next.js** (same concepts, React components)

## 📝 Commands Reference

```bash
# Development
npm run dev          # Start with auto-restart
npm start           # Start normally

# Dependencies  
npm install         # Install all packages
npm update          # Update packages

# Debugging
node app.js         # Start without nodemon
```

## 🤝 Need Help?

This is a learning project! If something isn't working:

1. **Check the terminal** for error messages
2. **Check browser console** (F12 → Console)
3. **Look in the `data/` folder** to see what's stored
4. **Try restarting** the server (`Ctrl+C` then `npm run dev`)

---

**Built for learning web development** - Simple, functional, and easy to understand! 🎉