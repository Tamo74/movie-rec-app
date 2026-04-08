// select elements
const moviesContainer = document.getElementById("moviesContainer");
const carouselInner = document.querySelector(".carousel-inner");

// load page
window.onload = () => {
    loadCarousel();
};

// load upcoming movies carousel
async function loadCarousel() {
    try {
        const res = await fetch("http://localhost:3000/api/movies/upcoming");
        const movies = await res.json();

        carouselInner.innerHTML = "";

        movies.slice(0, 3).forEach((movie, index) => {
            const isActive = index === 0 ? "active" : "";

            const slide = document.createElement("div");
            slide.className = `carousel-item ${isActive}`;

            slide.innerHTML = `
                <img src="https://image.tmdb.org/t/p/original${movie.backdrop_path}" 
                    class="d-block w-100" 
                    alt="${movie.title}">
        
                <div class="carousel-caption d-none d-md-block">
                    <h5>${movie.title}</h5>
                    <p>Release: ${movie.release_date}</p>
                </div>
            `;

        carouselInner.appendChild(slide);
    });

    } catch (error) {
        console.error("Error loading carousel:", error);
    }
}

// search for a movie
async function searchMovies() {
  const query = document.getElementById("searchInput").value;

  if (!query) return;

  try {
    const res = await fetch(
      `http://localhost:3000/api/movies/search?query=${query}`
    );

    const movies = await res.json();

    displayMovies(movies);

  } catch (error) {
    console.error("Search error:", error);
  }
}