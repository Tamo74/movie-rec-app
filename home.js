import { createMovieCard } from '/MovieCard.js';
import { renderHeader } from '/header.js';

// select elements
const moviesContainer = document.getElementById("moviesContainer");
const carouselInner = document.querySelector(".carousel-inner");

// map TMDb movie data to moviecard format
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

// load page
window.onload = async () => {
    document.body.prepend(renderHeader());
    loadCarousel();

    // auto-search if ?q= param is in the URL
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q) {
        const input = document.getElementById('searchInput');
        if (input) input.value = q;
        await searchMovies(q);
    }
};

// load upcoming movies carousel
async function loadCarousel() {
    try {
        const res = await fetch("/api/movies/upcoming");
        const movies = await res.json();

        carouselInner.innerHTML = "";

        movies.slice(0, 5).forEach((movie, index) => {
            const isActive = index === 0 ? "active" : "";

            const slide = document.createElement("div");
            slide.className = `carousel-item ${isActive}`;

            slide.innerHTML = `
                <img src="https://image.tmdb.org/t/p/original${movie.backdrop_path}" 
                    class="d-block w-100" 
                    alt="${movie.title}">
                <div class="carousel-caption" style="background:rgba(0,0,0,0.55);border-radius:8px;padding:12px 20px;">
                    <h5 class="fw-bold">${movie.title}</h5>
                    <p class="mb-0">Release: ${movie.release_date}</p>
                </div>
            `;

            carouselInner.appendChild(slide);
        });

    } catch (error) {
        console.error("Error loading carousel:", error);
    }
}

// display search results using moviecards
function displayMovies(movies) {
    moviesContainer.innerHTML = "";

    if (!movies || movies.length === 0) {
        moviesContainer.innerHTML = '<p class="text-muted">No movies found.</p>';
        return;
    }

    movies.forEach(movie => {
        const card = createMovieCard(toMovieCardData(movie));
        moviesContainer.appendChild(card);
    });
}

// genre buttons
function setupGenreButtons() {
    const genreResults = document.getElementById('genreResults');
    let activeBtn = null;

    document.querySelectorAll('.genre-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            // click same button again to collapse
            if (activeBtn === btn) {
                btn.classList.remove('active');
                genreResults.innerHTML = '';
                activeBtn = null;
                return;
            }

            document.querySelectorAll('.genre-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeBtn = btn;

            genreResults.innerHTML = '<p class="text-muted">Loading...</p>';

            try {
                const res = await fetch(`/api/movies/genre/${btn.dataset.id}`);
                const movies = await res.json();
                genreResults.innerHTML = '';

                movies.forEach(movie => {
                    const card = createMovieCard(toMovieCardData(movie));
                    genreResults.appendChild(card);
                });

                genreResults.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } catch (err) {
                genreResults.innerHTML = '<p class="text-muted">Failed to load movies.</p>';
            }
        });
    });
}

// search for a movie
async function searchMovies(query) {
    const q = query || document.getElementById("searchInput")?.value;
    if (!q) return;

    try {
        const res = await fetch(`/api/movies/search?query=${encodeURIComponent(q)}`);
        const movies = await res.json();
        displayMovies(movies);
        document.getElementById('moviesContainer')?.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        console.error("Search error:", error);
    }
}
