// Simple JavaScript for enhanced UX
document.addEventListener('DOMContentLoaded', function() {
    
    // File upload drag & drop enhancement
    const fileInput = document.getElementById('file');
    const fileLabel = document.querySelector('.file-label');
    
    if (fileInput && fileLabel) {
        // Update label when file is selected
        fileInput.addEventListener('change', function() {
            if (this.files && this.files.length > 0) {
                const fileName = this.files[0].name;
                fileLabel.innerHTML = `<span class="file-icon">📎</span>Selected: ${fileName}`;
                fileLabel.style.background = '#d4edda';
                fileLabel.style.borderColor = '#28a745';
            }
        });
        
        // Drag and drop functionality
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            fileLabel.addEventListener(eventName, preventDefaults, false);
        });
        
        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        ['dragenter', 'dragover'].forEach(eventName => {
            fileLabel.addEventListener(eventName, highlight, false);
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            fileLabel.addEventListener(eventName, unhighlight, false);
        });
        
        function highlight(e) {
            fileLabel.style.background = '#f0f4ff';
            fileLabel.style.borderColor = '#667eea';
        }
        
        function unhighlight(e) {
            fileLabel.style.background = '#f8f9fa';
            fileLabel.style.borderColor = '#ccc';
        }
        
        // Handle dropped files
        fileLabel.addEventListener('drop', handleDrop, false);
        
        function handleDrop(e) {
            const dt = e.dataTransfer;
            const files = dt.files;
            
            if (files.length > 0) {
                fileInput.files = files;
                const fileName = files[0].name;
                fileLabel.innerHTML = `<span class="file-icon">📎</span>Ready to upload: ${fileName}`;
                fileLabel.style.background = '#d4edda';
                fileLabel.style.borderColor = '#28a745';
            }
        }
    }
    
    // Show success/error messages from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const successParam = urlParams.get('success');
    const errorParam = urlParams.get('error');
    
    if (successParam) {
        showMessage(getSuccessMessage(successParam), 'success');
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    if (errorParam) {
        showMessage(getErrorMessage(errorParam), 'error');
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    function getSuccessMessage(type) {
        const messages = {
            'uploaded': '✅ File uploaded successfully!',
            'deleted': '🗑️ File deleted successfully!',
            'folder-created': '📁 Folder created successfully!'
        };
        return messages[type] || '✅ Operation completed successfully!';
    }
    
    function getErrorMessage(type) {
        const messages = {
            'no-file': '❌ Please select a file to upload.',
            'upload-failed': '❌ File upload failed. Please try again.',
            'file-not-found': '❌ File not found.',
            'invalid-folder-name': '❌ Please enter a valid folder name.'
        };
        return messages[type] || '❌ An error occurred. Please try again.';
    }
    
    function showMessage(text, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type === 'success' ? 'success' : 'error'}`;
        messageDiv.textContent = text;
        messageDiv.style.position = 'fixed';
        messageDiv.style.top = '20px';
        messageDiv.style.right = '20px';
        messageDiv.style.zIndex = '1000';
        messageDiv.style.minWidth = '300px';
        messageDiv.style.animation = 'slideIn 0.3s ease';
        
        document.body.appendChild(messageDiv);
        
        // Remove message after 3 seconds
        setTimeout(() => {
            messageDiv.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.parentNode.removeChild(messageDiv);
                }
            }, 300);
        }, 3000);
    }
    
    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        
        .message.error {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
    `;
    document.head.appendChild(style);
    
    // Add loading states to forms
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function() {
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                const originalText = submitBtn.textContent;
                submitBtn.textContent = 'Processing...';
                submitBtn.disabled = true;
                
                // Re-enable after 3 seconds as fallback
                setTimeout(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                }, 3000);
            }
        });
    });
});
