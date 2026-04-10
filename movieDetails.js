import { renderHeader } from '/header.js';

// get movie ID 
const movieId = window.location.pathname.split('/').pop();

window.onload = async () => {
    document.body.prepend(renderHeader());
    if (movieId) {
        await loadMovieDetails(movieId);
        await loadMovieReviews(movieId);
    }
    setupStarRating();
    setupSaveButton();
};

// saved movies
function getSaved() {
    return JSON.parse(localStorage.getItem('savedMovies') || '[]');
}
function setSaved(list) {
    localStorage.setItem('savedMovies', JSON.stringify(list));
}

let currentMovieSnapshot = {};

function setupSaveButton() {
    const btn = document.getElementById('saveBtn');
    if (!btn) return;

    const saved = getSaved().some(m => m.id === Number(movieId));
    updateSaveBtn(btn, saved);

    btn.addEventListener('click', () => {
        let list = getSaved();
        const alreadySaved = list.some(m => m.id === Number(movieId));

        if (alreadySaved) {
            list = list.filter(m => m.id !== Number(movieId));
        } else {
            list.push(currentMovieSnapshot);
        }

        setSaved(list);
        updateSaveBtn(btn, !alreadySaved);
    });
}

function updateSaveBtn(btn, saved) {
    if (saved) {
        btn.textContent = '♥ Saved';
        btn.classList.add('saved');
    } else {
        btn.textContent = '♡ Save Movie';
        btn.classList.remove('saved');
    }
}

// movie pages
async function loadMovieDetails(id) {
    try {
        const res = await fetch(`/api/movies/${id}`);
        const data = await res.json();

        document.title = data.title || 'Movie Details';
        document.getElementById('movieTitle').textContent = data.title || 'Unknown';
        document.getElementById('movieGenre').textContent =
            data.genres?.map(g => g.name).join(', ') || '—';

        // store full snapshot for saving
        currentMovieSnapshot = {
            id: Number(movieId),
            title: data.title || '',
            posterUrl: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : '',
            avgRating: data.vote_average ? data.vote_average.toFixed(1) : null,
            releaseYear: data.release_date?.split('-')[0] || '',
            releaseDate: data.release_date || '',
            genreIds: data.genres?.map(g => g.id) || [],
            genres: data.genres?.map(g => g.name) || []
        };
        document.getElementById('movieRelease').textContent = data.release_date || '—';
        document.getElementById('movieDescription').textContent = data.overview || '—';

        // cast
        const cast = data.credits?.cast?.slice(0, 5).map(c => c.name).join(', ') || '—';
        document.getElementById('movieCast').textContent = cast;

        // poster
        const poster = document.getElementById('moviePoster');
        if (data.poster_path) {
            poster.src = `https://image.tmdb.org/t/p/w500${data.poster_path}`;
        } else {
            poster.src = 'https://via.placeholder.com/300x450?text=No+Image';
        }

    } catch (err) {
        console.error('Failed to load movie details:', err);
    }
}

// reviews
async function loadMovieReviews(id) {
    try {
        const res = await fetch(`/api/movies/${id}/reviews`);
        const reviews = await res.json();

        const container = document.getElementById('reviewsContainer');

        if (!reviews || reviews.length === 0) {
            container.innerHTML = '<p class="text-muted">No reviews yet.</p>';
            return;
        }

        container.innerHTML = '';
        reviews.slice(0, 6).forEach(review => {
            const card = document.createElement('div');
            card.className = 'review-card';

            const rating = review.author_details?.rating;
            const stars = rating
                ? '★'.repeat(Math.round(rating / 2)) + '☆'.repeat(5 - Math.round(rating / 2))
                : '☆☆☆☆☆';

            const excerpt = review.content?.substring(0, 200) || '';

            card.innerHTML = `
                <div class="review-title">${review.author || 'Anonymous'}</div>
                <div class="review-stars">${stars}</div>
                <p class="review-text">${excerpt}${review.content?.length > 200 ? '...' : ''}</p>
            `;

            container.appendChild(card);
        });

    } catch (err) {
        console.error('Failed to load reviews:', err);
    }
}

// rate the movie
let selectedRating = 0;

function setupStarRating() {
    const stars = document.querySelectorAll('#starRating .star');
    let selected = 0;

    stars.forEach(star => {
        star.addEventListener('mouseover', () => {
            const val = parseInt(star.dataset.value);
            stars.forEach(s => {
                s.classList.toggle('hovered', parseInt(s.dataset.value) <= val);
            });
        });

        star.addEventListener('mouseout', () => {
            stars.forEach(s => {
                s.classList.remove('hovered');
                s.classList.toggle('selected', parseInt(s.dataset.value) <= selected);
            });
        });

        star.addEventListener('click', () => {
            selected = parseInt(star.dataset.value);
            selectedRating = selected;
            stars.forEach(s => {
                s.classList.toggle('selected', parseInt(s.dataset.value) <= selected);
            });
        });
    });
}

// submit movie review
window.submitReview = function () {
    const text = document.getElementById('reviewInput').value.trim();
    if (!text) return;

    const container = document.getElementById('reviewsContainer');
    const existing = container.querySelector('p.text-muted');
    if (existing) existing.remove();

    const card = document.createElement('div');
    card.className = 'review-card';
    const filledStars = '★'.repeat(selectedRating) + '☆'.repeat(5 - selectedRating);
    card.innerHTML = `
        <div class="review-title">You</div>
        <div class="review-stars">${filledStars}</div>
        <p class="review-text">${text}</p>
    `;
    container.prepend(card);
    document.getElementById('reviewInput').value = '';

    // reset stars
    selectedRating = 0;
    document.querySelectorAll('#starRating .star').forEach(s => s.classList.remove('selected'));
};
