import { createMovieCard } from '/MovieCard.js';
import { renderHeader } from '/header.js';

function toMovieCardData(movie) {
    return {
        id: movie.id,
        title: movie.title,
        posterUrl: movie.poster_path
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : null,
        avgRating: movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A',
        releaseYear: movie.release_date ? movie.release_date.split('-')[0] : '',
        genres: []
    };
}

window.onload = async () => {
    const moviesContainer = document.getElementById("moviesContainer");
    const carouselInner = document.querySelector(".carousel-inner");

    document.body.prepend(renderHeader());
    loadCarousel(carouselInner);
    setupGenreButtons(moviesContainer);

    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q) {
        const input = document.getElementById('movie-search');
        if (input) input.value = q;
        await searchMovies(q, moviesContainer);
    } else {
        await loadPopularMovies(moviesContainer);
    }
};

async function loadPopularMovies(moviesContainer) {
    const sectionTitle = document.getElementById('moviesSectionTitle');
    if (sectionTitle) sectionTitle.textContent = 'Popular Movies';
    if (!moviesContainer) return;

    moviesContainer.innerHTML = '<p class="text-muted" style="padding:16px;">Loading movies...</p>';
    try {
        const res = await fetch("/api/movies/trending");
        if (!res.ok) {
            throw new Error(`Server returned ${res.status}`);
        }
        const movies = await res.json();
        if (!Array.isArray(movies) || movies.length === 0) {
            moviesContainer.innerHTML = '<p class="text-muted" style="padding:16px;">No movies found.</p>';
            return;
        }
        displayMovies(movies, moviesContainer);
    } catch (error) {
        console.error("Error loading movies:", error);
        moviesContainer.innerHTML = `<p class="text-muted" style="padding:16px;">Could not load movies: ${error.message}. <a href="/dashboard/" style="color:#0d6efd">Retry</a></p>`;
    }
}

async function loadCarousel(carouselInner) {
    if (!carouselInner) return;
    try {
        const res = await fetch("/api/movies/upcoming");
        if (!res.ok) return;
        const movies = await res.json();

        carouselInner.innerHTML = "";
        movies.slice(0, 5).forEach((movie, index) => {
            const isActive = index === 0 ? "active" : "";
            const slide = document.createElement("div");
            slide.className = `carousel-item ${isActive}`;
            slide.innerHTML = `
                <img src="https://image.tmdb.org/t/p/original${movie.backdrop_path}"
                    class="d-block w-100"
                    alt="${movie.title}"
                    style="max-height:420px;object-fit:cover;">
                <div class="carousel-caption" style="background:rgba(0,0,0,0.55);border-radius:8px;padding:12px 20px;">
                    <h5 class="fw-bold">${movie.title}</h5>
                    <p class="mb-0">Release: ${movie.release_date}</p>
                </div>
            `;
            carouselInner.appendChild(slide);
        });
    } catch (error) {
        console.error("Carousel error:", error);
    }
}

function displayMovies(movies, moviesContainer) {
    moviesContainer.innerHTML = "";
    const grid = document.createElement('div');
    grid.className = 'movies-grid';
    movies.forEach(movie => {
        const card = createMovieCard(toMovieCardData(movie));
        grid.appendChild(card);
    });
    moviesContainer.appendChild(grid);
}

function setupGenreButtons(moviesContainer) {
    const genreResults = document.getElementById('genreResults');
    let activeBtn = null;

    document.querySelectorAll('.genre-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            if (activeBtn === btn) {
                btn.classList.remove('active');
                genreResults.innerHTML = '';
                activeBtn = null;
                return;
            }

            document.querySelectorAll('.genre-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeBtn = btn;
            genreResults.innerHTML = '<p class="text-muted" style="padding:16px;">Loading...</p>';

            try {
                const res = await fetch(`/api/movies/genre/${btn.dataset.id}`);
                if (!res.ok) throw new Error(`Status ${res.status}`);
                const movies = await res.json();
                genreResults.innerHTML = '';
                const grid = document.createElement('div');
                grid.className = 'movies-grid';
                movies.forEach(movie => {
                    const card = createMovieCard(toMovieCardData(movie));
                    grid.appendChild(card);
                });
                genreResults.appendChild(grid);
                genreResults.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } catch (err) {
                genreResults.innerHTML = `<p class="text-muted">Failed to load genre movies: ${err.message}</p>`;
            }
        });
    });
}

async function searchMovies(query, moviesContainer) {
    const q = query || document.getElementById("movie-search")?.value;
    if (!q) return;

    const sectionTitle = document.getElementById('moviesSectionTitle');
    if (sectionTitle) sectionTitle.textContent = `Results for "${q}"`;

    try {
        const res = await fetch(`/api/movies/search?query=${encodeURIComponent(q)}`);
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const movies = await res.json();
        displayMovies(movies, moviesContainer);
        moviesContainer?.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        console.error("Search error:", error);
        if (moviesContainer) moviesContainer.innerHTML = `<p class="text-muted" style="padding:16px;">Search failed: ${error.message}</p>`;
    }
}
