import cv2
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, transforms
from torch.utils.data import DataLoader
import matplotlib.pyplot as plt
import os
from PIL import Image
import torch.nn.functional as F


from game_state import board
from game_state import hand
from vision import process_board
from vision import process_tiles
from vision import util
from vision import config


IMAGE = "./vision/original_data/first_round/full_board3.jpg"

bp = process_board.BoardProcessor(IMAGE)
bd = bp.process_board()
corners = bp.get_corners()

# im = cv2.imread(IMAGE)
# color_crop = util.crop_board(im, corners)
# util.display_image(color_crop)


"""
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
        
        r = self.classify_letter(img)
        if r is not None:
          letters.add_tile(i, j, r)

          util.display_image(img, f"LETTER: {r}, {i}, {j}")
    return letters

  def classify_letter(self, thresh_image):
    sample = to_sample(thresh_image)
    sample = np.float32(sample)
    retval, results, neigh_resp, dists = self._model.findNearest(sample, k = 1)
    retchar = chr(int((results[0][0])))
    print(f"??? {dists}, {retchar}")
    if retchar == '0':
      #Star character!
      return None
    return retchar
"""

class LetterClassifier(nn.Module):
    def __init__(self):
        super(LetterClassifier, self).__init__()
        self.conv1 = nn.Conv2d(1, 32, 3)
        self.conv2 = nn.Conv2d(32, 64, 3)
        self.fc1 = nn.Linear(64 * 5 * 5, 128)
        self.fc2 = nn.Linear(128, len(class_names))

    def forward(self, x):
        x = torch.relu(self.conv1(x))
        x = torch.max_pool2d(x, 2)
        x = torch.relu(self.conv2(x))
        x = torch.max_pool2d(x, 2)
        x = x.view(-1, 64 * 5 * 5)
        x = torch.relu(self.fc1(x))
        return self.fc2(x)

class_names = [
    'A', 'B', 'C', 'D', 'E', 'F', 'G',
    'H', 'I', 'J', 'K', 'L', 'M', 'N',
    'O', 'P', 'Q', 'R', 'S', 'T', 'U',
    'V', 'W', 'X', 'Y', 'Z'
]

def to_sample(img):
  transform = transforms.Compose([
      transforms.Grayscale(),           # Convert to 1 channel
      transforms.Resize((28, 28)),      # Match training size
      transforms.ToTensor(),
      transforms.Normalize((0.5,), (0.5,))
  ])

  # Load and preprocess the image
  img = Image.fromarray(img)
  img = transform(img).unsqueeze(0)  # Add batch dimension
  return img



class LetterModelClassifier:
  def __init__(self):
    self._model = LetterClassifier()

  def load(self):
    self._model.load_state_dict(torch.load('vision/letter_classifier.pth', map_location=torch.device('cpu')))
    self._model.eval()

  def classify_all(self, finder):
    letters = board.Board()
    for j in range(0,config.BOARD_SIZE):
      for i in range(0,config.BOARD_SIZE):
        img = finder.get_thresh(i, j)
        if img is None:
          continue
        
        r = self.classify_letter(img)
        if r is not None:
          letters.add_tile(i, j, r)

          # util.display_image(img, f"LETTER: {r}, {i}, {j}")
    return letters

  def classify_letter(self, thresh_image):

    tensor = to_sample(thresh_image)
    sample = self._model(tensor)
    # _, predicted = torch.max(sample, 1)
    # print(predicted)

    # predicted_class = class_names[predicted.item()]
    # return predicted_class
    probs = F.softmax(sample, dim=1)  # shape: [1, 26]
    conf, predicted = torch.max(probs, 1)
    confidence_score = conf.item()  # float between 0 and 1
    predicted_class_index = predicted.item()
    predicted_class = class_names[predicted_class_index]

    if confidence_score > config.CONFIDENCE_THRESHOLD:
      return predicted_class

    return None


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


