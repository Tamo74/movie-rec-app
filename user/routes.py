from flask import request, jsonify
from app import app, db
from user.model import User
from passlib.hash import pbkdf2_sha256
import re
import uuid

user_model = User()

@app.route('/user/signup', methods=['POST'])
def signup():
    name     = request.form.get('name', '').strip()
    email    = request.form.get('email', '').lower().strip()
    password = request.form.get('password', '')
    role     = request.form.get('role', 'client')

    # whitelist roles so nobody can POST role=superuser etc.
    if role not in ('client', 'admin'):
        return jsonify({"error": "Choose a role"}), 400

    if not name or not email or not password:
        return jsonify({"error": "All fields are required"}), 400
    if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
        return jsonify({"error": "Invalid email"}), 400
    if len(password) < 8:
        return jsonify({"error": "Password must be at least 8 characters"}), 400
    if not re.search(r"\d", password):
        return jsonify({"error": "Password must include a number"}), 400
    if not re.search(r"[^A-Za-z0-9]", password):
        return jsonify({"error": "Password must include a special character"}), 400
    if db.user.find_one({"email": email}):
        return jsonify({"error": "Email already registered"}), 400

    user_doc = {
        "_id":      uuid.uuid4().hex,
        "name":     name,
        "email":    email,
        "password": pbkdf2_sha256.hash(password),
        "role":     role
    }

    db.user.insert_one(user_doc)
    return user_model.start_session(user_doc)

@app.route('/user/login', methods=['POST'])
def login():
    email    = request.form.get('email', '').lower().strip()
    password = request.form.get('password', '')

    if not email or not password:
        return jsonify({"error": "All fields are required"}), 400

    user = db.user.find_one({"email": email})

    if not user:
        return jsonify({"error": "User does not exist"}), 401
    if not pbkdf2_sha256.verify(password, user['password']):
        return jsonify({"error": "Incorrect password"}), 401

    return user_model.start_session(user)

@app.route('/user/signout')
def signout():
    return user_model.signout()