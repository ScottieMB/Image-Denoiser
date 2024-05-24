from flask import Flask, jsonify, request, send_file, send_from_directory
from flask_cors import CORS
import cv2
import base64
from PIL import Image
import io
#from load_modelPrid import load_prid
import numpy as np
import os
import mimetypes
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from load_dncnn import final_dncnn


file = '/home/Butlerblock/server/static/test_image.jpg'
img = Image.open(file)

rid_image = img
rid_image = np.array(rid_image)

rid_image = cv2.cvtColor(rid_image, cv2.COLOR_RGB2BGR)

model = '/home/Butlerblock/server/static/dncnn.h5'
rid_image = final_dncnn(rid_image, model)
cv2.imwrite('/home/Butlerblock/server/static/test_image_rid.jpg', rid_image)