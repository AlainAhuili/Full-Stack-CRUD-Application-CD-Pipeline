// Automatically use localhost:3000 for standard local development builds
const API_URL = 'http://localhost:3000/api/users';

const userForm = document.getElementById('userForm');
const userTableBody = document.getElementById('userTableBody');
const refreshBtn = document.getElementById('refreshBtn');

// Function to fetch users from backend and update the UI table
async function fetchUsers() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Network response was not ok');
        
        const users = await response.json();
        
        // Clear current content
        userTableBody.innerHTML = '';
        
        if (users.length === 0) {
            userTableBody.innerHTML = `
                <tr>
                    <td colspan="4" class="py-8 text-center text-slate-400">No records found. Use the form to insert the first record!</td>
                </tr>`;
            return;
        }

        // Render rows dynamically
        users.forEach(user => {
            const formattedDate = new Date(user.created_at).toLocaleString();
            const row = document.createElement('tr');
            row.className = 'hover:bg-slate-50/80 transition-colors';
            row.innerHTML = `
                <td class="py-3 px-4 font-mono font-bold text-slate-400">${user.id}</td>
                <td class="py-3 px-4 font-medium text-slate-900">${escapeHtml(user.name)}</td>
                <td class="py-3 px-4 text-slate-600">${escapeHtml(user.email)}</td>
                <td class="py-3 px-4 text-slate-400 text-xs">${formattedDate}</td>
            `;
            userTableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        userTableBody.innerHTML = `
            <tr>
                <td colspan="4" class="py-8 text-center text-rose-500 font-medium">
                    Unable to stream data from backend API layer. Is the server container active?
                </td>
            </tr>`;
    }
}

// Intercept form submission
userForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const nameInput = document.getElementById('userName');
    const emailInput = document.getElementById('userEmail');
    
    const payload = {
        name: nameInput.value,
        email: emailInput.value
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            // Clear inputs on success
            nameInput.value = '';
            emailInput.value = '';
            // Refresh table dynamically
            await fetchUsers();
        } else {
            const errData = await response.json();
            alert(`Error: ${errData.error || 'Failed to create user'}`);
        }
    } catch (error) {
        console.error('Submission failed:', error);
        alert('Server connectivity failure. Please verify backend status.');
    }
});

// Simple security sanitizer to prevent cross-site scripting (XSS) injection leaks
function escapeHtml(str) {
    return str.replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;")
              .replace(/'/g, "&#039;");
}

// Global Event Listeners
refreshBtn.addEventListener('click', fetchUsers);
document.addEventListener('DOMContentLoaded', fetchUsers);