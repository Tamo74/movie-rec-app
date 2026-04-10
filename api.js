// Client/js/api.js
// This connects to Katherine's backend

const BASE_URL = 'http://localhost:3000/api';

// Get trending movies (for home page)
export async function getTrendingMovies() {
    const response = await fetch(`${BASE_URL}/movies/trending`);
    const data = await response.json();
    return data;
}

// Get upcoming movies (for upcoming page)
export async function getUpcomingMovies() {
    const response = await fetch(`${BASE_URL}/movies/upcoming`);
    const data = await response.json();
    return data;
}

// Get all admin movies (for admin page)
export async function getAdminMovies() {
    const response = await fetch(`${BASE_URL}/admin/movies`);
    const data = await response.json();
    return data;
}

// Add a new movie (admin only)
export async function addMovie(movieData) {
    const response = await fetch(`${BASE_URL}/admin/movies`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(movieData)
    });
    const data = await response.json();
    return data;
}

// Update a movie (admin only)
export async function updateMovie(id, movieData) {
    const response = await fetch(`${BASE_URL}/admin/movies/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(movieData)
    });
    const data = await response.json();
    return data;
}

// Delete a movie (admin only)
export async function deleteMovie(id) {
    const response = await fetch(`${BASE_URL}/admin/movies/${id}`, {
        method: 'DELETE'
    });
    const data = await response.json();
    return data;
}

