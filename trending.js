import { renderHeader } from '/header.js';
import { createMovieCard } from '/MovieCard.js';

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
    document.body.prepend(renderHeader());
    const container = document.getElementById('trendingMovies');

    try {
        const res = await fetch('/api/movies/trending');
        const movies = await res.json();

        container.innerHTML = '';
        movies.forEach(movie => {
            container.appendChild(createMovieCard(toMovieCardData(movie)));
        });
    } catch (err) {
        container.innerHTML = '<p class="text-muted">Failed to load trending movies.</p>';
    }
};
