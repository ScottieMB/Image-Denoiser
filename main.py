from flask import Flask, jsonify, request, send_file, send_from_directory
from flask_cors import CORS
import cv2
import base64
from PIL import Image
import io
# from load_modelPrid import load_prid
import numpy as np
import os
import mimetypes
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from load_dncnn import final_dncnn
from load_rid import final_rid
import tensorflow as tf

app = Flask(__name__,)
cors = CORS(app, origins='*')

modelDncnn = ('/home/Butlerblock/server/static/dncnn.h5')
modelRid = ('/home/Butlerblock/server/static/ridnet.h5')



app = Flask(__name__, static_folder='client/dist')

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
    if os.path.isfile(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

@app.route('/static/<path:filename>')
def serve_static(filename):
    static_dir = os.path.join(app.root_path, '.', 'static')
    return send_from_directory(static_dir, filename)

@app.route('/api/upload', methods=['POST'])

def upload_prid():
    if 'file' not in request.files:
        return 'No file part'
    file = request.files['file']
    if file.filename == '':
        return 'No selected file'
    if file:
        # Save the uploaded file to a desired location
        img = Image.open(file)
        img = np.array(img)
        cv2.imwrite("debug_image.jpg", img)
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)


        rid_image = final_rid(img, modelRid)
        dncnn_image = final_dncnn(img, modelDncnn)

        cv2.imwrite('/home/Butlerblock/server/static/uploaded_image_rid.jpg', rid_image)
        cv2.imwrite('/home/Butlerblock/server/static/uploaded_image_dncnn.jpg', dncnn_image)

        return 'File uploaded successfully'


@app.route('/api/send_dncnn', methods=['GET'])

def get_processed_image_dncnn():
    # Serve the processed image back to the client
    return send_file('/home/Butlerblock/server/static/uploaded_image_dncnn.jpg', mimetype='image/jpeg')

@app.route('/api/send_rid', methods=['GET'])

def get_processed_image_rid():
    # Serve the processed image back to the client
    return send_file('/home/Butlerblock/server/static/uploaded_image_rid.jpg', mimetype='image/jpeg')



SQLALCHEMY_DATABASE_URI = "mysql+mysqlconnector://{username}:{password}@{hostname}/{databasename}".format(
    username="Butlerblock",
    password="CS499Database",
    hostname="Butlerblock.mysql.pythonanywhere-services.com",
    databasename="Butlerblock$default",
)

app.config["SQLALCHEMY_DATABASE_URI"] = SQLALCHEMY_DATABASE_URI
app.config["SQLALCHEMY_POOL_RECYCLE"] = 299
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)

class User(db.Model):
    __tablename__ = 'Users'  # Specify the table name

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), nullable=False, unique=True)
    email = db.Column(db.String(100), nullable=False, unique=True)
    password = db.Column(db.String(100), nullable=False)

class Images(db.Model):
    __tablename__ = 'Images'  # Specify the table name

    imageId = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(255), nullable=False)
    path = db.Column(db.String(255), nullable=False)

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data['username']
    email = data['email']
    password = bcrypt.generate_password_hash(data['password']).decode('utf-8')

    user = User(username=username, email=email, password=password)
    db.session.add(user)
    db.session.commit()

    return jsonify({'message': 'User registered successfully'}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username_or_email = data['username_or_email']
    password = data['password']

    user = User.query.filter_by(username=username_or_email).first() or User.query.filter_by(email=username_or_email).first()

    if user and bcrypt.check_password_hash(user.password, password):
        return jsonify({'message': 'Login successful'}), 200
    else:
        return jsonify({'message': 'Invalid credentials'}), 401

@app.route('/save_image_prid', methods=['POST'])
def save_image_prid():
    data = request.get_json()
    username = data.get('username')
    image_data = data.get('imageData')
    image_path = data.get('imagePath')


    image_data = base64.b64decode(image_data)

    # Save the image to the specified directory
    directory = '/home/Butlerblock/server/static/userImages'
    full_path = os.path.join(directory, image_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)

    # Write the image data to the file
    with open(full_path, 'wb') as f:
        f.write(image_data)

    if not username or not image_path:
        return jsonify({'error': 'Missing username or imagePath'}), 400

    try:
        user = Images(username=username, path=image_path)
        db.session.add(user)
        db.session.commit()
        return jsonify({'message': 'Image saved successfully for Model 1'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error saving image: {}'.format(str(e))}), 500


@app.route('/api/images/<username>', methods=['GET'])
def get_user_images(username):
    images = Images.query.filter_by(username=username).all()
    image_data = []

    for image in images:
        image_path = os.path.join('/home/Butlerblock/server/static/userImages', image.path)

        try:
            with open(image_path, 'rb') as image_file:
                encoded_image = base64.b64encode(image_file.read()).decode('utf-8')

            image_data.append({
                'imageId': image.imageId,
                'username': image.username,
                'imageData': encoded_image
            })
        except FileNotFoundError:
            print(f"Image file not found: {image_path}")
            continue

    return jsonify(image_data)

@app.route('/api/images/delete', methods=['POST'])
def delete_image():
    data = request.get_json()
    image_id = data['id'] # Access the 'path' property directly

    if image_id:
        image = Images.query.filter_by(imageId=image_id).first()
        if image:
            image_path = image.path

            image_path = os.path.join('/home/Butlerblock/server/static/userImages', image_path)

            os.remove(image_path)

            db.session.delete(image)
            db.session.commit()
            return jsonify({'message': 'Image deleted successfully'})
        else:
            return jsonify({'message': 'Image not found'}), 404
    else:
        return jsonify({'message': 'Invalid request'}), 400


if __name__ == "__main__":
    app.run(debug=True, port=8080)