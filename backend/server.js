import express from "express";
import axios from "axios";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { MongoClient, ObjectId } from "mongodb";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;

const API_KEY = "ef0446eee648d392883577d34d4496e7";

// MongoDB system for admin movies
const mongoClient = new MongoClient("mongodb://localhost:27017");
let db;

mongoClient.connect().then(() => {
    db = mongoClient.db("userLoginSystem");
    console.log("Connected to MongoDB");
});

// GET admin movies
app.get("/api/admin/movies", async (req, res) => {
    try {
        const movies = await db.collection("movies").find().toArray();
        res.json(movies);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch movies" });
    }
});

// CREATE new movie - admin
app.post("/api/admin/movies", async (req, res) => {
    try {
        const newMovie = {
            title: req.body.title,
            genre: req.body.genre,
            year: req.body.year,
        };
        const result = await db.collection("movies").insertOne(newMovie);
        res.status(201).json({ ...newMovie, _id: result.insertedId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create movie" });
    }
});  

//UPDATE movie - admin
app.put("/api/admin/movies/:id", async (req, res) => {
    try {
        const id = new ObjectId(req.params.id);
        const result = await db.collection("movies").findOneAndUpdate(
            { _id: id },
            { $set: {
                title: req.body.title,
                genre: req.body.genre,
                year: req.body.year,
            }},
            { returnDocument: "after" }
        );
        if (!result) return res.status(404).json({ error: "Movie not found" });
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update movie" });
    }
}); 

// DELETE movie - admin
app.delete("/api/admin/movies/:id", async (req, res) => {
    try {
        const id = new ObjectId(req.params.id);
        const result = await db.collection("movies").findOneAndDelete({ _id: id });
        if (!result) return res.status(404).json({ error: "Movie not found" });
        res.json({ message: "Movie deleted", movie: result });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to delete movie" });
    }
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
