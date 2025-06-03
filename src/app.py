import time
import base64
import cv2
from flask import Flask, jsonify, make_response, request
from flask_cors import CORS
import numpy as np
from game_state import board
from game_state import hand
from vision import process_board
from vision import util
from vision import config
from vision import process_hand
from vision import letter_classifier

# TODO I haven't tested this out yet so not entirely sure it works
def cv_to_msg(img):
    _, buffer = cv2.imencode('.jpg', img)
    jpg_as_text = base64.b64encode(buffer).decode('utf-8')
    return f'data:image/jpg;base64,{jpg_as_text}'


app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/cat')
def get_cat_response():
    response = make_response(jsonify({'cat': 'meow'}))
    response.status_code = 200
    return response
    
@app.route('/board', methods=['POST'])
def get_board():
    body = request.get_json()
    bp = process_board.BoardProcessor()
    bp.set_image_from_msg(body)
    bp.crop_to_board()
    bp.process_tiles()
    letter_model = letter_classifier.LetterModelClassifier()
    letter_model.load()
    letters = letter_model.classify_all(bp)
    response = make_response(jsonify({'board': letters}))
    response.status_code = 200
    return response

# if __name__ == '__main__':
#     app.run(host= '0.0.0.0', debug=True, port=5001)