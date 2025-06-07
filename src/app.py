from flask import Flask, jsonify, make_response, request
from flask_cors import CORS

from vision import process_board
from vision import process_hand
from vision import letter_classifier

BP = process_board.BoardProcessor()
HP = process_hand.HandProcessor()
CLASSIFIER = letter_classifier.LetterModelClassifier()
CLASSIFIER.load()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.errorhandler(Exception)
def handle_exception(e):
    return jsonify(str(e)), 500
    
@app.route('/board', methods=['POST'])
def classify_all():
    body = request.get_json()

    try:
        BP.clear()
        BP.set_image_from_msg(body)
        BP.crop_to_board()
        BP.process_tiles()

        HP.clear()
        HP.set_image_from_msg(body)
        HP.crop_to_hand()
        HP.process_tiles()

        board_letters = CLASSIFIER.classify_all(BP)
        hand_letters = CLASSIFIER.classify_all(HP)
    except Exception as e:
        raise e

    response = make_response(jsonify({'board': board_letters, 'hand': hand_letters}))
    response.status_code = 200
    return response

# if __name__ == '__main__':
#     app.run(host= '0.0.0.0', debug=True, port=5001)