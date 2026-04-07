import express from "express";
import axios from "axios";
import cors from "cors";

const app= express();
app.use(cors());

const PORT = 3000;

const API_KEY = "ef0446eee648d392883577d34d4496e7"
app.get("/", (req, res) => {
    res.send("Server is running");
});

app.get("/api/movies/trending", async (req, res) => {
    try {
        const response = await axios.get(
            `https://api.themoviedb.org/3/trending/movie/day?api_key=${ef0446eee648d392883577d34d4496e7}`
        );
        res.json(response.dta.results);
    } catch (error) {
        console.error(error);
            res.status(500).json({ error: "Failed to fetch movies" });
        }
});

app.listen(PORT, () => {
    console.log('Server running on port ${PORT}');
});