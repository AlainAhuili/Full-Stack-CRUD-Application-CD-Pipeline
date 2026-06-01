document.addEventListener('DOMContentLoaded', () => {
    let isLoginMode = true;

    // DOM Elements Cache
    const authSection = document.getElementById('auth-section');
    const crudSection = document.getElementById('crud-section');
    const authForm = document.getElementById('auth-form');
    const authTitle = document.getElementById('auth-title');
    const authSubmitBtn = document.getElementById('auth-submit-btn');
    const switchAuthMode = document.getElementById('switch-auth-mode');
    const authSwitchText = document.getElementById('auth-switch-text');
    
    const itemForm = document.getElementById('item-form');
    const itemNameInput = document.getElementById('item-name');
    const itemsList = document.getElementById('items-list');
    const logoutBtn = document.getElementById('logout-btn');

    // UI View State Orchestration
    function renderView() {
        if (App.getToken()) {
            authSection.classList.add('hidden');
            crudSection.classList.remove('hidden');
            loadItems();
        } else {
            authSection.classList.remove('hidden');
            crudSection.classList.add('hidden');
            itemsList.innerHTML = '';
        }
    }

    // Toggle between Login and Registration UI modes
    switchAuthMode.addEventListener('click', () => {
        isLoginMode = !isLoginMode;
        if (isLoginMode) {
            authTitle.innerText = 'Login';
            authSubmitBtn.innerText = 'Login';
            authSwitchText.innerHTML = `Don't have an account? <span id="switch-auth-mode">Register here</span>`;
        } else {
            authTitle.innerText = 'Register';
            authSubmitBtn.innerText = 'Register';
            authSwitchText.innerHTML = `Already have an account? <span id="switch-auth-mode">Login here</span>`;
        }
        // Re-attach listener to newly appended innerHTML span element dynamically
        document.getElementById('switch-auth-mode').addEventListener('click', () => switchAuthMode.click());
    });

    // Auth Submission Handling
    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;

        try {
            if (isLoginMode) {
                await App.login(username, password);
                alert('Logged in successfully!');
            } else {
                await App.register(username, password);
                alert('Registration successful! Please login.');
                switchAuthMode.click(); // Flip back to login mode automatically
            }
            authForm.reset();
            renderView();
        } catch (err) {
            alert(err.message);
        }
    });

    // Load and Display User Items
    async function loadItems() {
        try {
            const items = await App.getItems();
            if (items === null) {
                renderView();
                return;
            }
            itemsList.innerHTML = '';
            items.forEach(item => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <span>${item.name}</span>
                    <button onclick="handleDeleteItem(${item.id})" style="background: #DC3545; padding: 4px 10px;">X</button>
                `;
                itemsList.appendChild(li);
            });
        } catch (err) {
            console.error(err.message);
        }
    }

    // Create New Item Handler
    itemForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = itemNameInput.value.trim();
        try {
            await App.createItem(name);
            itemNameInput.value = '';
            loadItems();
        } catch (err) {
            alert(err.message);
        }
    });

    // Delete Target Item Function made visible globally to window scope context for inline HTML handler execution
    window.handleDeleteItem = async (id) => {
        try {
            await App.deleteItem(id);
            loadItems();
        } catch (err) {
            alert(err.message);
        }
    };

    // Logout Trigger Event
    logoutBtn.addEventListener('click', () => {
        App.clearToken();
        renderView();
    });

    // Initial load execution trace entry gatepoint
    renderView();
});
