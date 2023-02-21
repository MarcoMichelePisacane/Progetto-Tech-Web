from flask import Flask, render_template, request, jsonify, session
from pymongo import MongoClient
# uuid is used to generate a random id
import uuid

# Create the app
app = Flask(__name__)
# Secret key for the session
app.secret_key = 'dbijwfbibiwnioj'

# MongoDB database connection
client = MongoClient("mongodb://localhost:27017/")
db = client["app_db"]
collection = db["app_collection"]

# Function that allows the associated HTML file to display the username
def start_session(user):
    temp={
        "utente": user["Nome_utente"]
    }
    session['logged_in'] = True
    session['user'] = temp
    user=session.get('user')
    return jsonify(user),200

# Decorator for displaying the homepage through the app
@app.route('/')
def home():
    return render_template('Home.html')

# Decorator to view the game through the app
@app.route('/game/')
def game():
    return render_template('index.html')

# Decorator to display the registration form through the app
@app.route('/sign_in/', methods=['GET','POST'])
def sign_in():
    if request.method == 'POST':
       user={
        "_id": uuid.uuid4().hex,
        "Nome_utente": request.form.get('utente'),
        "Nome": request.form.get('nome'),
        "Cognome": request.form.get('cognome'),
        "Età": request.form.get('età'),
        "Sesso": request.form.get('sesso'),
        "Email": request.form.get('email'),
        "Password": request.form.get('password')
       }
       if collection.find_one({"Email": user['Email']}):
            return jsonify({"error": "Email già in uso"}), 400
       collection.insert_one(user)
       return start_session(user)
    return render_template('sign_in.html')

# Decorator to display the log in form via the app
@app.route('/log_in', methods=['GET','POST'])
def log_in():
    if request.method == 'POST':
       controllo={
        "Email" : request.form.get('email'),
        "Password" : request.form.get('password')
       }
       if collection.find_one({"Email": controllo['Email']}):
            if collection.find_one({"Password": controllo['Password']}):
                user = collection.find_one({"Email": controllo['Email']})
                return start_session(user)
       return jsonify({"error": "Email o password errate"}), 500
    return render_template('log_in.html')


# Control to start the code
if __name__ == '__main__':
    app.run(host='0.0.0.0',port=5000)
