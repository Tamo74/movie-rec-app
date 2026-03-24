export function createMovieCard(movie) {
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.setAttribute('aria-label', `Movie: ${movie.title}`);
    card.setAttribute('role', 'article');
    card.setAttribute('tabindex', '0');
    
    card.innerHTML = `
        <div class="movie-poster">
            <img src="${movie.posterUrl || '/assets/placeholder.png'}" 
                 alt="Poster for ${movie.title}"
                 loading="lazy">
            <div class="rating-badge">★ ${movie.avgRating || 'N/A'}</div>
        </div>
        <div class="movie-info">
            <h3 class="movie-title">${movie.title}</h3>
            <p class="movie-year">${movie.releaseYear || ''}</p>
            <p class="movie-genre">${movie.genres?.join(', ') || ''}</p>
        </div>
    `;
    
    card.addEventListener('click', () => {
        window.location.href = `/movie/${movie.id}`;
    });
    
    card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            window.location.href = `/movie/${movie.id}`;
        }
    });
    
    return card;
}

