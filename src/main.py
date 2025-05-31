import numpy as np

from game_state import board
from game_state import hand
from vision import process_board
from vision import util
from vision import config
from vision import process_hand
from vision import letter_classifier

# IMAGE = "./vision/original_data/first_round/full_board3.jpg"
# bp = process_board.BoardProcessor()
# bp.set_image(IMAGE)
# bp.crop_to_board()
# bp.process_tiles()

# HAND_IMAGE = "./vision/original_data/holder_pics/20250530_165357.jpg"

# HAND_IMAGE = "./vision/original_data/image.png"

HAND_IMAGE = "./vision/original_data/holder_pics/20250530_164707.jpg"
hp = process_hand.HandProcessor()
hp.set_image(HAND_IMAGE)
hp.crop_to_hand()
hp.process_tiles()

# hp = process_board.BoardProcessor(IMAGE)
# bd = bp.process_board()
# corners = bp.get_corners()

# im = cv2.imread(IMAGE)
# color_crop = util.crop_board(im, corners)
# util.display_image(color_crop)

letter_model = letter_classifier.LetterModelClassifier()
letter_model.load()
letters = letter_model.classify_all(hp)
print(letters)
