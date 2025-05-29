import numpy as np

from game_state import board
from game_state import hand
from vision import process_board
from vision import util
from vision import config
from vision import process_hand
from vision import letter_classifier

IMAGE = "./vision/original_data/first_round/full_board3.jpg"
bp = process_board.BoardProcessor()
bp.set_image(IMAGE)
bp.crop_to_board()
bp.process_tiles()


HAND_IMAGE = "./vision/image.png"
hp = process_hand.HandProcessor(HAND_IMAGE)
hhand = hp.process_hand()
corners = hp.get_corners()

# im = cv2.imread(HAND_IMAGE)
# color_crop = util.crop_board(im, corners)
util.display_image(hhand)


# hp = process_board.BoardProcessor(IMAGE)
# bd = bp.process_board()
# corners = bp.get_corners()

# im = cv2.imread(IMAGE)
# color_crop = util.crop_board(im, corners)
# util.display_image(color_crop)


letter_model = letter_classifier.LetterModelClassifier()
letter_model.load()
letters = letter_model.classify_all(bp)
print(letters)

# bp = process_board.BoardProcessor(IMAGE)
# bd = bp.process_board()
# corners = bp.get_corners()

# letter_model = LetterModelClassifier()
# letter_model.load()
# lp = process_tiles.TileProcessor(IMAGE, corners)
# lp.threshold()
# letters = letter_model.classify_all(lp)

# print(letters)


# im = cv2.imread("cropped_t.png")
# print(im.shape)
# tile = cv2.resize(im, (100, 100))
# util.display_image(tile, "tile")

# text = pytesseract.image_to_string(tile, config='--psm 10 -c tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZ')
# print(f"letter: {text.strip()}")


