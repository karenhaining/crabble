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

MODEL_PATH = 'vision/letter_classifier_synth.pth'

class_names = [
    'A', 'B', 'C', 'D', 'E', 'F', 'G',
    'H', 'I', 'J', 'K', 'L', 'M', 'N',
    'O', 'P', 'Q', 'R', 'S', 'T', 'U',
    'V', 'W', 'X', 'Y', 'Z'
]

def to_sample(img):
    transform = transforms.Compose([
        transforms.Grayscale(),
        transforms.Resize((45, 45)),      
        transforms.ToTensor(),
        transforms.Normalize((0.5,), (0.5,))
    ])

    # Load and preprocess the image
    img = Image.fromarray(img)
    img = transform(img).unsqueeze(0)
    return img


class LetterClassifier(nn.Module):
    def __init__(self):
        super(LetterClassifier, self).__init__()
        self.conv1 = nn.Conv2d(1, 8, kernel_size=3)
        self.conv2 = nn.Conv2d(8, 16, kernel_size=3)
        self.fc1 = nn.Linear(16 * 9 * 9, 64)
        self.dropout = nn.Dropout(0.5)
        self.fc2 = nn.Linear(64, len(class_names))

    def forward(self, x):
        x = F.relu(self.conv1(x))
        x = F.max_pool2d(x, 2)
        x = F.relu(self.conv2(x))
        x = F.max_pool2d(x, 2)
        x = x.view(x.size(0), -1)
        x = self.dropout(F.relu(self.fc1(x)))
        return self.fc2(x)

class LetterModelClassifier:
    def __init__(self):
        self._model = LetterClassifier()
        self.mode = None
        self.board = board.Board()

    def load(self):
        checkpoint = torch.load(MODEL_PATH, map_location=torch.device('cpu'))
        model_dict = self._model.state_dict()

        # Filter out unmatched keys
        pretrained_dict = {k: v for k, v in checkpoint.items() if k in model_dict and v.size() == model_dict[k].size()}

        # Update current model dict
        model_dict.update(pretrained_dict)
        self._model.load_state_dict(model_dict)
        self._model.eval()


    def classify_all(self, finder):
        if isinstance(finder, process_board.BoardProcessor):
            self.mode = "BOARD"
            for j in range(0,config.BOARD_SIZE):
                for i in range(0,config.BOARD_SIZE):
                    img = finder.get_thresh(i, j)
                    if img is None:
                        continue
                    
                    val = self.classify_letter(img)
                    if val is not None:
                        r, c = val
                        self.board.add_tile(i, j, r)

                        if config.DEBUG_BOARD_LETTERS:
                            util.display_image(img, f"LETTER: {r}, {i}, {j}, {c}")
            return self.board

        else:
            self.mode = "HAND"
            letters = hand.Hand()
            for i in range(0,config.HAND_SIZE):
                img = finder.get_thresh(i)
                if img is None:
                    continue

                val = self.classify_letter(img)
                if val is not None:
                    r, c = val
                    letters.add_tile(r, i)

        return letters


    def classify_letter(self, thresh_image):

        tensor = to_sample(thresh_image)
        sample = self._model(tensor)
        probs = F.softmax(sample, dim=1)
        conf, predicted = torch.max(probs, 1)
        confidence_score = conf.item()
        predicted_class_index = predicted.item()
        predicted_class = class_names[predicted_class_index]

        if self.mode == "HAND" and config.DEBUG_HAND_LETTERS:
            print(f"PRED: {predicted_class}, CONF: {confidence_score}")
            util.display_image(thresh_image, "LETTER")

        threshold = config.HAND_CONFIDENCE_THRESHOLD if self.mode == "HAND" else config.BOARD_CONFIDENCE_THRESHOLD

        if confidence_score >= threshold:
            return predicted_class, confidence_score

        return None

