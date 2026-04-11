import express from "express";
import axios from "axios";
import cors from "cors";
import { MongoClient, ObjectId } from "mongodb";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;
const API_KEY = "ef0446eee648d392883577d34d4496e7";

// MongoDB
const mongoClient = new MongoClient("mongodb://localhost:27017");
let db;
mongoClient.connect().then(() => {
    db = mongoClient.db("userLoginSystem");
    console.log("Connected to MongoDB");
});

// --- Admin movie CRUD ---

app.get("/api/admin/movies", async (req, res) => {
    try {
        const movies = await db.collection("movies").find().toArray();
        res.json(movies);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch movies" });
    }
});

app.post("/api/admin/movies", async (req, res) => {
    try {
        const newMovie = { title: req.body.title, genre: req.body.genre, year: req.body.year };
        const result = await db.collection("movies").insertOne(newMovie);
        res.status(201).json({ ...newMovie, _id: result.insertedId });
    } catch (err) {
        res.status(500).json({ error: "Failed to create movie" });
    }
});

app.put("/api/admin/movies/:id", async (req, res) => {
    try {
        const id = new ObjectId(req.params.id);
        const result = await db.collection("movies").findOneAndUpdate(
            { _id: id },
            { $set: { title: req.body.title, genre: req.body.genre, year: req.body.year } },
            { returnDocument: "after" }
        );
        if (!result) return res.status(404).json({ error: "Movie not found" });
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: "Failed to update movie" });
    }
});

app.delete("/api/admin/movies/:id", async (req, res) => {
    try {
        const id = new ObjectId(req.params.id);
        const result = await db.collection("movies").findOneAndDelete({ _id: id });
        if (!result) return res.status(404).json({ error: "Movie not found" });
        res.json({ message: "Movie deleted", movie: result });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete movie" });
    }
});

// --- Specific movie routes (MUST come before /:id wildcard) ---

app.get("/api/movies/trending", async (req, res) => {
    try {
        const response = await axios.get(
            `https://api.themoviedb.org/3/trending/movie/week?api_key=${API_KEY}`
        );
        res.json(response.data.results);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch trending movies" });
    }
});

app.get("/api/movies/upcoming", async (req, res) => {
    try {
        const response = await axios.get(
            `https://api.themoviedb.org/3/movie/upcoming?api_key=${API_KEY}`
        );
        const today = new Date().toISOString().split("T")[0];
        const filtered = response.data.results.filter(m => m.release_date > today);
        res.json(filtered);
    } catch (error) {
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
        res.status(500).json({ error: "Failed to search movies" });
    }
});

app.get("/api/movies/genre/:genreId", async (req, res) => {
    try {
        const response = await axios.get(
            `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_genres=${req.params.genreId}&sort_by=popularity.desc`
        );
        res.json(response.data.results);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch movies by genre" });
    }
});

app.get("/api/movies/year/:year", async (req, res) => {
    try {
        const response = await axios.get(
            `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&primary_release_year=${req.params.year}&sort_by=popularity.desc`
        );
        res.json(response.data.results);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch movies by year" });
    }
});

// --- Wildcard /:id routes (MUST come after all specific routes) ---

app.get("/api/movies/:id/reviews", async (req, res) => {
    try {
        const response = await axios.get(
            `https://api.themoviedb.org/3/movie/${req.params.id}/reviews?api_key=${API_KEY}`
        );
        res.json(response.data.results);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch reviews" });
    }
});

app.get("/api/movies/:id", async (req, res) => {
    try {
        const response = await axios.get(
            `https://api.themoviedb.org/3/movie/${req.params.id}?api_key=${API_KEY}&append_to_response=credits`
        );
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch movie details" });
    }
});

app.get("/", (req, res) => {
    res.send("Express server is running");
});

app.listen(PORT, "localhost", () => {
    console.log(`Server running on port ${PORT}`);
});
