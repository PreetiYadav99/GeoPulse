from flask import Flask, render_template, request, redirect, session, jsonify
from flask_cors import CORS
import pyrebase

app = Flask(__name__)
CORS(app, supports_credentials=True)
app.secret_key = 'your_secret_key'

firebaseConfig = {
    "apiKey": "AIzaSyArEnIiUa4q8LA9PO61lZkbMJl0_8cziBg",
    "authDomain": "geopulse-ecba6.firebaseapp.com",
    "databaseURL": "https://geopulse-ecba6-default-rtdb.firebaseio.com",
    "projectId": "geopulse-ecba6",
    "storageBucket": "geopulse-ecba6.firebasestorage.app",
    "messagingSenderId": "29535384199",
    "appId": "1:29535384199:web:f76afb214e90a01328be22",
    "measurementId": "G-9HTEHXH5Q7"
}


firebase = pyrebase.initialize_app(firebaseConfig)
auth = firebase.auth()
db = firebase.database()

@app.route('/')
def root():
    # Always start here and show login page
    return redirect('/login')

@app.route('/home')
def home():
    if 'user' in session:
        user_id = session['user']
        return f"""
        <h2>Welcome farmer! Your user ID: {user_id}</h2>
        <a href='/logout'>Logout</a>
        """
    return redirect('/login')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        if request.is_json:
            data = request.get_json()
            email = data.get('email')
            password = data.get('password')
            name = data.get('name')
        else:
            email = request.form.get('email')
            password = request.form.get('password')
            name = request.form.get('name')

        if len(password) < 6:
            return jsonify({"error": "Password must be at least 6 characters long"}), 400
        try:
            user = auth.create_user_with_email_and_password(email, password)
            user_id = user['localId']
            db.child("farmers").child(user_id).set({"email": email, "name": name})
            return jsonify({"message": "Registration successful"}), 201
        except Exception as e:
            return jsonify({"error": str(e)}), 400
    return render_template('register.html')


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        print("Login request received")
        print("Content-Type:", request.headers.get('Content-Type'))
        print("Request data:", request.get_data())
        if request.is_json:
            data = request.get_json()
            print("JSON data received:", data)
            email = data.get('email')
            password = data.get('password')
        else:
            print("Form data received")
            email = request.form.get('email')
            password = request.form.get('password')
        print(f"Attempting login with email: {email}")

        try:
            user = auth.sign_in_with_email_and_password(email, password)
            session['user'] = user['localId']
            return jsonify({
                "message": "Login successful",
                "user_id": user['localId']
            }), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 401
    return render_template('login.html')

@app.route('/check-auth')
def check_auth():
    if 'user' in session:
        return jsonify({
            "authenticated": True,
            "user_id": session['user']
        })
    return jsonify({
        "authenticated": False
    }), 401

@app.route('/logout')
def logout():
    session.pop('user', None)
    return jsonify({"message": "Logged out successfully"})

if __name__ == '__main__':
    app.run(debug=True)
