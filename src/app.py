import time
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



app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/time')
def get_current_time():
    response = make_response(jsonify({'time': time.time()}))
    response.status_code = 200
    return response
    
@app.route('/board', methods=['POST'])
def get_board():
    body = request.get_json()
    bp = process_board.BoardProcessor()
    bp.set_image(body['data'])
    bp.crop_to_board()
    bp.process_tiles()
    letter_model = letter_classifier.LetterModelClassifier()
    letter_model.load()
    letters = letter_model.classify_all(bp)
    response = make_response(jsonify({'board': letters}))
    response.status_code = 200
    return response

if __name__ == '__main__':
    app.run(debug=True, port=5000)