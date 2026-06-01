const API_URL = window.location.origin.includes('localhost') 
    ? 'http://localhost:3001/api' 
    : '/api';

const App = {
    // Auth Token Storage Management
    getToken() {
        return localStorage.getItem('token');
    },

    setToken(token) {
        localStorage.setItem('token', token);
    },

    clearToken() {
        localStorage.removeItem('token');
    },

    getHeaders() {
        const headers = { 'Content-Type': 'application/json' };
        const token = this.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
    },

    // Authentication Endpoints
    async register(username, password) {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        if (!res.ok) throw new Error('Registration failed');
        return res.json();
    },

    async login(username, password) {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        if (!res.ok) throw new Error('Invalid credentials');
        const data = await res.json();
        this.setToken(data.token);
        return data;
    },

    // Protected CRUD Resource Endpoints
    async getItems() {
        const res = await fetch(`${API_URL}/items`, {
            method: 'GET',
            headers: this.getHeaders()
        });
        if (res.status === 401 || res.status === 403) {
            this.clearToken();
            return null;
        }
        if (!res.ok) throw new Error('Failed to fetch items');
        return res.json();
    },

    async createItem(name) {
        const res = await fetch(`${API_URL}/items`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ name })
        });
        if (!res.ok) throw new Error('Failed to create item');
        return res.json();
    },

    async deleteItem(id) {
        const res = await fetch(`${API_URL}/items/${id}`, {
            method: 'DELETE',
            headers: this.getHeaders()
        });
        if (!res.ok) throw new Error('Failed to delete item');
        return res.json();
    }
};
