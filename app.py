from flask import Flask, render_template, redirect, session, jsonify, send_from_directory, request, Response
from functools import wraps
import pymongo
import requests as http_requests
import os
from passlib.hash import pbkdf2_sha256

app = Flask(__name__)
app.secret_key=b'\xda\xfb\x01\xc3vc#\x9a\xc7\xb0\x7fk\xadUp\x06'

client = pymongo.MongoClient('localhost', 27017)
db = client.userLoginSystem

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TMDB_KEY = "ef0446eee648d392883577d34d4496e7"
TMDB_BASE = "https://api.themoviedb.org/3"

def login_required(f):
    @wraps(f)
    def wrap(*args, **kwargs):
        if "logged_in" in session:
            return f(*args, **kwargs)
        else:
            return redirect('/')
    return wrap

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user = session.get("user")
        if not user:
            return redirect("/")
        if user.get("role") != "admin":
            return jsonify({"error": "Admin access required"}), 403
        return f(*args, **kwargs)
    return decorated_function

# Serve root-level static files (main.css, home.js, MovieCard.js, etc.)
@app.route('/<path:filename>')
def root_static(filename):
    safe_extensions = ('.js', '.css', '.png', '.jpg', '.ico', '.svg', '.woff', '.woff2', '.ttf')
    if any(filename.endswith(ext) for ext in safe_extensions):
        return send_from_directory(BASE_DIR, filename)
    return redirect('/')

# --- Movie API routes calling TMDb directly ---

@app.route('/api/movies/trending')
def movies_trending():
    try:
        r = http_requests.get(f"{TMDB_BASE}/trending/movie/week", params={"api_key": TMDB_KEY}, timeout=15)
        return jsonify(r.json().get("results", []))
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/movies/upcoming')
def movies_upcoming():
    try:
        r = http_requests.get(f"{TMDB_BASE}/movie/upcoming", params={"api_key": TMDB_KEY}, timeout=15)
        today = __import__('datetime').date.today().isoformat()
        results = [m for m in r.json().get("results", []) if m.get("release_date", "") > today]
        return jsonify(results)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/movies/search')
def movies_search():
    query = request.args.get("query", "").strip()
    if not query:
        return jsonify({"error": "query is required"}), 400
    try:
        r = http_requests.get(f"{TMDB_BASE}/search/movie", params={"api_key": TMDB_KEY, "query": query}, timeout=15)
        return jsonify(r.json().get("results", []))
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/movies/genre/<int:genre_id>')
def movies_genre(genre_id):
    try:
        r = http_requests.get(f"{TMDB_BASE}/discover/movie", params={"api_key": TMDB_KEY, "with_genres": genre_id, "sort_by": "popularity.desc"}, timeout=15)
        return jsonify(r.json().get("results", []))
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/movies/year/<int:year>')
def movies_year(year):
    try:
        r = http_requests.get(f"{TMDB_BASE}/discover/movie", params={"api_key": TMDB_KEY, "primary_release_year": year, "sort_by": "popularity.desc"}, timeout=15)
        return jsonify(r.json().get("results", []))
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/movies/<int:movie_id>/reviews')
def movie_reviews(movie_id):
    try:
        r = http_requests.get(f"{TMDB_BASE}/movie/{movie_id}/reviews", params={"api_key": TMDB_KEY}, timeout=15)
        return jsonify(r.json().get("results", []))
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/movies/<int:movie_id>')
def movie_detail_api(movie_id):
    try:
        r = http_requests.get(f"{TMDB_BASE}/movie/{movie_id}", params={"api_key": TMDB_KEY, "append_to_response": "credits"}, timeout=15)
        return jsonify(r.json())
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- Admin routes proxy to Express ---

@app.route('/api/admin/<path:path>', methods=['GET', 'POST', 'PUT', 'DELETE'])
def admin_proxy(path):
    url = f'http://localhost:3000/api/admin/{path}'
    params = request.args.to_dict(flat=False)
    headers = {k: v for k, v in request.headers if k != 'Host'}
    try:
        resp = http_requests.request(
            method=request.method,
            url=url,
            params=params,
            headers=headers,
            json=request.get_json(silent=True),
            data=request.form or None,
            timeout=15
        )
        return Response(resp.content, status=resp.status_code,
                        content_type=resp.headers.get('Content-Type', 'application/json'))
    except Exception as e:
        return jsonify({"error": str(e)}), 502

#routes
from user import routes

@app.route('/')
def register():
    return render_template('register.html')

@app.route('/dashboard/')
@login_required
def dashboard():
    user = session.get('user')
    if user.get('role') == 'admin':
        return render_template('admin-movies.html')
    else:
        return render_template('Home.html')

@app.route("/admin/dashboard")
@admin_required
def admin_dashboard():
    return render_template("admin-movies.html")

@app.route("/trending")
@login_required
def trending():
    return render_template("trending.html")

@app.route("/recommendations")
@login_required
def recommendations():
    return render_template("recommendations.html")

@app.route("/settings")
@login_required
def settings():
    return render_template("settings.html")

@app.route("/movie/<int:movie_id>")
@login_required
def movie_detail(movie_id):
    return render_template("movie_detail.html", movie_id=movie_id)

@app.route("/user/me")
@login_required
def user_me():
    user = session.get("user", {})
    return jsonify({"name": user.get("name", ""), "email": user.get("email", ""), "role": user.get("role", "")})

@app.route("/user/update", methods=["POST"])
@login_required
def user_update():
    data = request.get_json(silent=True) or {}
    user = session.get("user", {})
    email = user.get("email")

    updates = {}
    if data.get("name", "").strip():
        updates["name"] = data["name"].strip()
    if data.get("email", "").strip():
        updates["email"] = data["email"].strip().lower()
    if data.get("password", "").strip():
        if len(data["password"]) < 8:
            return jsonify({"error": "Password must be at least 8 characters"}), 400
        updates["password"] = pbkdf2_sha256.hash(data["password"])

    if not updates:
        return jsonify({"error": "Nothing to update"}), 400

    db.user.update_one({"email": email}, {"$set": updates})

    session_updates = {k: v for k, v in updates.items() if k != "password"}
    updated_user = {**user, **session_updates}
    session["user"] = updated_user

    return jsonify({"success": True, "name": updated_user.get("name"), "email": updated_user.get("email")})

@app.route("/user/delete", methods=["POST"])
@login_required
def user_delete():
    user = session.get("user", {})
    email = user.get("email")
    db.user.delete_one({"email": email})
    session.clear()
    return jsonify({"success": True})
