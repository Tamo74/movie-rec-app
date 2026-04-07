from flask import Flask, request, jsonify
from app import app
from user.model import User

@app.route('/user/signup', methods=['POST'])
def signup():
    return jsonify({"message": "User created"}), 200

@app.route('/user/signout')
def signout():
    return User().signout()

@app.route('/user/login', methods=['POST'])
def login():
   return User().login()