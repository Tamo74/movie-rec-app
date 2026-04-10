from flask import Flask, render_template, redirect, session, jsonify 
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

def admin_required(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            user = session.get("user")
            if not user:
                return redirect("/login")  # not logged in
            if user.get("role") != "admin":
                return jsonify({"error": "Admin access required"}), 403
            return f(*args, **kwargs)
        return decorated_function

        

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
        return render_template('admin.html')   
    else:
        return render_template('client/pages/Home.html.html')  
    
@app.route("/admin/dashboard")
@admin_required
def admin_dashboard():
    return render_template("admin.html")