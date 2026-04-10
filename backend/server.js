import express from "express";
import axios from "axios";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;

const API_KEY = "ef0446eee648d392883577d34d4496e7";

// temp movie DB for admin CRUD
let adminMovies = [];
let nextId = 1;

//GET admin movies
app.get("/api/admin/movies", (req, res) => {
    res.json(adminMovies);
});

// CREATE new movie - admin
app.post("/api/admin/movies", (req, res) => {
    const newMovie = {
        id: nextId++,
        title: req.body.title,
        genre: req.body.genre,
        year: req.body.year,
    };
    adminMovies.push(newMovie);

    res.status(201).json(newMovie);
})

//UPDATE movie - admin
app.put("/api/admin/movies/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const movie = adminMovies.find(m => m.id === id);
    if (!movie) {
        return res.status(404).json({ error: "Movie not found" });
    }
    movie.title = req.body.title ?? movie.title;
    movie.genre = req.body.genre ?? movie.genre;
    movie.year = req.body.year ?? movie.year;

    res.json(movie);
});

//DELETE movie - admin
app.delete("/api/admin/movies/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const index = adminMovies.findIndex(m => m.id === id);
    if (index === -1) {
        return res.status(404).json({ error: "Movie not found" });
    }

    const deletedMovie = adminMovies.splice(index, 1);

    res.json({
        message: "Movie deleted",
        movie: deletedMovie
    });
});



app.get("/", (req, res) => {
    res.send("Server is running");
});

app.get("/api/movies/upcoming", async (req, res) => {
    try {
        const response = await axios.get(
            `https://api.themoviedb.org/3/movie/upcoming?api_key=${API_KEY}`
        );

        const today = new Date().toISOString().split("T")[0];

        const filtered = response.data.results.filter(movie =>
            movie.release_date > today
        );

        res.json(filtered);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch upcoming movies" });
    }
});

app.get("/api/movies/search", async (req, res) => {
    const { query } = req.query;
    if (!query) return res.status(400).json({ error: "Query is required" });
    try {
        const response = await axios.get(
            `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`
        );
        res.json(response.data.results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to search movies" });
    }
});

// Serve static frontend files
app.use(express.static(path.join(__dirname, "..")));

// Serve client pages
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "client", "pages", "Home.html"));
});

app.get("/home", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "client", "pages", "Home.html"));
});

app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "client", "pages", "Login.html"));
});

app.get("/dashboard", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "client", "pages", "Dashboard.html"));
});

app.get("/admin", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "client", "pages", "admin-movies.html"));
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});
