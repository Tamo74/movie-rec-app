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
                <a href="/login" class="nav-link">Login</a>
                <a href="/register" class="nav-link signup">Sign Up</a> 
            `}
        </nav>
    `;
    
    return header;
}

