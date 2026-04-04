from flask import Flask, render_template, redirect, session 
from functools import wraps
import pymongo


app = Flask(__name__)
app.secret_key=b'\xda\xfb\x01\xc3vc#\x9a\xc7\xb0\x7fk\xadUp\x06'
# dabaseses

client = pymongo.MongoClient('localhost', 27017)
db = client.userLoginSystem 

#decoraors
def login_required(f):
    @wraps(f)
    def wrap(*args, **kwargs):
        print("SESSION:", session)
        if "logged_in" in session:
            return f(*args, **kwargs)
        else:
            return redirect('/')
    return wrap
        

#routes
from user import routes

@app.route('/')
def home():
    return render_template('home.html')

@app.route('/dashboard/')
@login_required
def dashboard():
    return render_template('dashboard.html')

