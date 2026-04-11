// Apply persisted accessibility settings on every page
(function applyPersistedSettings() {
    if (localStorage.getItem('settings_darkMode') === 'true') {
        document.documentElement.classList.add('dark-mode');
    }
    const textSize = localStorage.getItem('settings_textSize');
    const sizes = { xs: '12px', s: '14px', m: '16px', l: '18px', xl: '21px' };
    if (textSize && sizes[textSize]) {
        document.documentElement.style.fontSize = sizes[textSize];
    }
    const colourFilter = localStorage.getItem('settings_colourFilter');
    if (colourFilter && colourFilter !== 'none') {
        const colours = {
            red: 'rgba(220,50,50,0.15)',
            blue: 'rgba(50,100,220,0.15)',
            yellow: 'rgba(220,190,50,0.18)',
            green: 'rgba(50,180,80,0.15)',
        };
        if (colours[colourFilter]) {
            const overlay = document.createElement('div');
            overlay.id = 'colour-overlay';
            overlay.style.cssText = `position:fixed;inset:0;pointer-events:none;z-index:9998;background:${colours[colourFilter]};`;
            document.body.appendChild(overlay);
        }
    }
})();

export function renderHeader(user = null) {
    const header = document.createElement('header');
    header.className = 'main-header';
    
    header.innerHTML = `
        <div class="logo">
            <a href="/dashboard/">MovieRecommender</a>
        </div>
        <nav class="nav-links">
            <a href="/dashboard/" class="nav-link">Home</a>
            <a href="/trending" class="nav-link">Trending</a>
            <a href="/recommendations" class="nav-link">For You</a>
            <a href="/settings" class="nav-link">Settings</a>
            ${user ? `
                <div class="user-menu">
                    <span class="username">${user.username}</span>
                    <div class="dropdown">
                        <a href="/profile">Profile</a>
                        <a href="/user/signout">Sign Out</a>
                    </div>
                </div>
            ` : `
                <a href="/user/signout" class="nav-link signup">Sign Out</a>
            `}
        </nav>

        <!-- SEARCH BAR -->
        <div class="search-bar">
            <input type="text" id="movie-search" placeholder="Search movies...">
            <button id="search-btn">Search</button>
        </div>
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
    if (q) window.location.href = `/dashboard/?q=${encodeURIComponent(q)}`;
}
