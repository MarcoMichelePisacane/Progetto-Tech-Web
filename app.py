from flask import Flask, render_template, request, jsonify, session
from pymongo import MongoClient
import uuid

app = Flask(__name__)
app.secret_key = 'dbijwfbibiwnioj'

# Connessione al database MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client["app_db"]
collection = db["app_collection"]




def start_session(self, user):
    session['logged_in'] = True
    session['user'] = user
    return jsonify(user), 200

@app.route('/')
def home():
    return render_template('Home.html')

@app.route('/game/')
def game():
    return render_template('index.html')

@app.route('/sign_in/', methods=['GET','POST'])
def sign_in(self):
    if request.method == 'POST':
       user={
        "_id" : uuid.uuid4().hex,
        "Nome_utente" : request.form.get('utente'),
        "Nome" : request.form.get('nome'),
        "Cognome" : request.form.get('cognome'),
        "Età" : request.form.get('età'),
        "Sesso" : request.form.get('sesso'),
        "Email" : request.form.get('email'),
        "Password" : request.form.get('password'),
        "Punteggio" : 0
       }
       if collection.find_one({"Email": user['Email']}):
            return jsonify({"error":"Email già in uso"}), 400
       collection.insert_one(user)
       return self.start_session(user)
    return render_template('sign_in.html')

@app.route('/log_in', methods=['GET','POST']) 
def log_in(self):
    if request.method == 'POST':
       controllo={
        "Email" : request.form.get('email'),
        "Password" : request.form.get('password')
       }
       if collection.find_one({"Email": controllo['Email']}):
            if collection.find_one({"Password": controllo['Password']}):
                user = collection.find_one({"Email": controllo['Email']})
                return self.start_session(user)
       return jsonify({"error":"Email o password errate"}), 500
    return render_template('log_in.html')


if __name__ == '__main__':
    app.run()