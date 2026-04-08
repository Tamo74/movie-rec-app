import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();
app.use(cors());

const PORT = 3000;

const API_KEY = "ef0446eee648d392883577d34d4496e7";

// temp movie DB for admin CRUD
let adminMovies = [];
let nextId = 1;

//GET admin movies
app.get("/api/admin/movies", (req, res) => {
    res.json(adminMovies);
});



app.get("/", (req, res) => {
    res.send("Server is running");
});

app.get("/api/movies/trending", async (req, res) => {
    try {
        const response = await axios.get(
            `https://api.themoviedb.org/3/trending/movie/day?api_key=${API_KEY}`
        );

        res.json(response.data.results);

    } catch (error) {
        console.error(error);
            res.status(500).json({ error: "Failed to fetch movies" });
        }
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

app.listen(PORT, () => {
    console.log('Server running on port ${PORT}');
});