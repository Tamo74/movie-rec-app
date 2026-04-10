export function renderHeader(user = null) {
    const header = document.createElement('header');
    header.className = 'main-header';
    
    header.innerHTML = `
        <div class="logo">
            <a href="/">MovieRecommender</a>
        </div>
        <nav class="nav-links">
            <a href="/" class="nav-link">Home</a>
            <a href="/trending" class="nav-link">Trending</a>
            <a href="/recommendations" class="nav-link">For You</a>
            <a href="/settings" class="nav-link">Settings</a>
            ${user ? `
                <div class="user-menu">
                    <span class="username">${user.username}</span>
                    <div class="dropdown">
                        <a href="/profile">Profile</a>
                        <a href="#" id="logout-btn">Logout</a>
                    </div>
                </div>
            ` : `
                <a href="/register" class="nav-link signup">Sign Out</a> 
            `}
        </nav>

        <!-- SEARCH BAR -->
        <div class="search-bar">
            <input type="text" id="movie-search" placeholder="Search movies...">
            <button id="search-btn">Search</button>
        </div>

        <!-- RESULTS -->
        <div id="search-results" class="results"></div>
    `;

    // attach events after rendering
    setTimeout(() => {
        const searchBtn = header.querySelector('#search-btn');
        const searchInput = header.querySelector('#movie-search');

        searchBtn.addEventListener('click', () => {
            searchMovies(searchInput.value);
        });

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchMovies(searchInput.value);
            }
        });
    }, 0);

    return header;
}

function searchMovies(query) {
    const q = query.trim();
    if (q) window.location.href = `/?q=${encodeURIComponent(q)}`;
}