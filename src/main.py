import cv2
import torch
# import easyocr

import pytesseract
import numpy as np

from game_state import board
from game_state import hand
from vision import process_board
from vision import process_tiles
from vision import util
from vision import config


IMAGE = "./vision/data/pattern_1.jpg"

bp = process_board.BoardProcessor(IMAGE)
bd = bp.process_board()
corners = bp.get_corners()

cv2.imwrite('output.png', bd)

# lp = process_tiles.TileProcessor(IMAGE, corners)
# lp.threshold()

cropped_board = util.crop_board(bd, corners)
# util.display_image(cropped_board, "cropped")





def to_sample(img):
  shrunk = cv2.resize(img, (config.LETTER_TRAIN_SIZE, config.LETTER_TRAIN_SIZE))
  return shrunk.reshape((1,config.LETTER_TRAIN_SIZE**2))


class LetterModelClassifier:
  def __init__(self):
    self._model = None

  def load(self):
    self._model = cv2.ml.KNearest_create().load("model.yml")

  def classify_all(self, finder):
    letters = board.Board()
    for j in range(0,config.BOARD_SIZE):
      for i in range(0,config.BOARD_SIZE):
        img = finder.get_thresh(i, j)
        if img is None:
          continue
        
        # tile = cv2.resize(img, (100, 100))
        # # util.display_image(tile, f"tile {i}, {j}")
        # r = pytesseract.image_to_string(tile, config='--psm 10 -c tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZ')

        r = self.classify_letter(img)
        if r is not None:
          # r = r.strip()
          letters.add_tile(i, j, r)

          util.display_image(img, f"LETTER: {r}, {i}, {j}")
    return letters

  def classify_letter(self, thresh_image):
    sample = to_sample(thresh_image)
    sample = np.float32(sample)
    retval, results, neigh_resp, dists = self._model.findNearest(sample, k = 1)
    retchar = chr(int((results[0][0])))
    if retchar == '0':
      #Star character!
      return None
    return retchar


bp = process_board.BoardProcessor(IMAGE)
bd = bp.process_board()
corners = bp.get_corners()

letter_model = LetterModelClassifier()
letter_model.load()
lp = process_tiles.TileProcessor(IMAGE, corners)
lp.threshold()
letters = letter_model.classify_all(lp)

print(letters)


# im = cv2.imread("cropped_t.png")
# print(im.shape)
# tile = cv2.resize(im, (100, 100))
# util.display_image(tile, "tile")

# text = pytesseract.image_to_string(tile, config='--psm 10 -c tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZ')
# print(f"letter: {text.strip()}")


