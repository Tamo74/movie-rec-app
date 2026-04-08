const API_BASE_URL = 'http://localhost:3000/api';

export const api = {
    get: async (endpoint, token = null) => {
        const headers = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        
        const response = await fetch(`${API_BASE_URL}${endpoint}`, { headers });
        return response.json();
    },
    
    post: async (endpoint, data, token = null) => {
        const headers = {
            'Content-Type': 'application/json'
        };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers,
            body: JSON.stringify(data)
        });
        return response.json();
    },
    
    put: async (endpoint, data, token) => {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        return response.json();
    },
    
    delete: async (endpoint, token) => {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.json();
    }
};

export async function getUpcomingMovies() {
        const res = await fetch("http://localhost:3000/api/movies/upcoming");
        return res.json();
    }
