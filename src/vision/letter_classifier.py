import torch
import torch.nn as nn
import torch.nn.functional as F
from torchvision import transforms
from PIL import Image

from game_state import board
from game_state import hand
from vision import process_board
from vision import config
from vision import util

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


# The model
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



class LetterModelClassifier:
  def __init__(self):
    self._model = LetterClassifier()

  def load(self):
    self._model.load_state_dict(torch.load('vision/letter_classifier.pth', map_location=torch.device('cpu')))
    self._model.eval()

  def classify_all(self, finder):
    if isinstance(finder, process_board.BoardProcessor):

      letters = board.Board()
      for j in range(0,config.BOARD_SIZE):
        for i in range(0,config.BOARD_SIZE):
          img = finder.get_thresh(i, j)
          if img is None:
            continue
          
          r, c = self.classify_letter(img)
          if r is not None:
            letters.add_tile(i, j, r)

            # util.display_image(img, f"LETTER: {r}, {i}, {j}")
      return letters
    
    else:
      letters = hand.Hand()
      for i in range(0,config.HAND_SIZE):
        img = finder.get_thresh(i)
        if img is None:
          continue
        
        r, c = self.classify_letter(img)
        if r is not None:
          letters.add_tile(r)

          util.display_image(img, f"LETTER: {r, c}")
      return letters
      

  def classify_letter(self, thresh_image):

    tensor = to_sample(thresh_image)
    sample = self._model(tensor)
    probs = F.softmax(sample, dim=1)  # shape: [1, 26]
    conf, predicted = torch.max(probs, 1)
    confidence_score = conf.item()  # float between 0 and 1
    predicted_class_index = predicted.item()
    predicted_class = class_names[predicted_class_index]

    # if confidence_score > config.CONFIDENCE_THRESHOLD:
    return predicted_class, confidence_score

    return None

