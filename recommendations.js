import { renderHeader } from '/header.js';
import { createMovieCard } from '/MovieCard.js';

window.onload = async () => {
    document.body.prepend(renderHeader());
    const saved = JSON.parse(localStorage.getItem('savedMovies') || '[]');
    renderSaves(saved);
    if (saved.length > 0) {
        await Promise.all([
            renderGenreRecs(saved),
            renderYearRecs(saved)
        ]);
    }
};

function normalizeMovie(m) {
    return {
        id: m.id,
        title: m.title || m.original_title || 'Unknown',
        posterUrl: m.poster_path
            ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
            : (m.posterUrl || ''),
        avgRating: m.vote_average
            ? Number(m.vote_average).toFixed(1)
            : (m.avgRating || 'N/A'),
        releaseYear: (m.release_date || m.releaseYear || '').toString().slice(0, 4),
        genres: m.genres || []
    };
}

// saved movies
function renderSaves(saved) {
    const container = document.getElementById('savesList');
    container.innerHTML = '';

    if (!saved.length) {
        container.innerHTML = '<p class="rec-empty">No saved movies yet. Go to any movie page and click ♡ Save Movie.</p>';
        return;
    }

    saved.forEach(movie => {
        container.appendChild(createMovieCard(normalizeMovie(movie)));
    });
}

// recs based on saved movie genres
async function renderGenreRecs(saved) {
    const container = document.getElementById('genreList');
    container.innerHTML = '<p class="rec-empty">Loading...</p>';

    const savedIds = new Set(saved.map(m => m.id));

    const genreCount = {};
    saved.forEach(m => (m.genreIds || []).forEach(gid => {
        genreCount[gid] = (genreCount[gid] || 0) + 1;
    }));

    const topGenre = Object.entries(genreCount).sort((a, b) => b[1] - a[1])[0]?.[0];
    if (!topGenre) {
        container.innerHTML = '<p class="rec-empty">Genre data not available for saved movies.</p>';
        return;
    }

    try {
        const res = await fetch(`/api/movies/genre/${topGenre}`);
        const movies = await res.json();
        const filtered = movies.filter(m => !savedIds.has(m.id)).slice(0, 6);

        container.innerHTML = '';
        if (!filtered.length) {
            container.innerHTML = '<p class="rec-empty">No recommendations found.</p>';
            return;
        }
        filtered.forEach(m => container.appendChild(createMovieCard(normalizeMovie(m))));
    } catch {
        container.innerHTML = '<p class="rec-empty">Failed to load recommendations.</p>';
    }
}

// recs based on saved movie release years
async function renderYearRecs(saved) {
    const container = document.getElementById('yearList');
    container.innerHTML = '<p class="rec-empty">Loading...</p>';

    const savedIds = new Set(saved.map(m => m.id));

    const yearCount = {};
    saved.forEach(m => {
        const y = (m.releaseYear || '').toString().slice(0, 4);
        if (y) yearCount[y] = (yearCount[y] || 0) + 1;
    });
    const topYear = Object.entries(yearCount).sort((a, b) => b[1] - a[1])[0]?.[0];

    if (!topYear) {
        container.innerHTML = '<p class="rec-empty">Release year data not available for saved movies.</p>';
        return;
    }

    try {
        const res = await fetch(`/api/movies/year/${topYear}`);
        const movies = await res.json();
        const filtered = movies.filter(m => !savedIds.has(m.id)).slice(0, 6);

        container.innerHTML = '';
        if (!filtered.length) {
            container.innerHTML = '<p class="rec-empty">No recommendations found.</p>';
            return;
        }
        filtered.forEach(m => container.appendChild(createMovieCard(normalizeMovie(m))));
    } catch {
        container.innerHTML = '<p class="rec-empty">Failed to load recommendations.</p>';
    }
}
