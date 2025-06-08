from vision import process_board
from vision import letter_classifier
import os

bp = process_board.BoardProcessor()
letter_model = letter_classifier.LetterModelClassifier()
letter_model.load()


DIR = "vision/original_data/board_state_test"

files = os.listdir(DIR)
files = sorted(files)

letters = None
for file in files:
    file_path = os.path.join(DIR, file)

    bp.set_image_from_file(file_path)
    bp.crop_to_board()
    bp.process_tiles()

    letters = letter_model.classify_all(bp)
    print(letters)

board = letters.get_rep()

ret = ""
for row in range(15):
    row_str = "|"
    for col in range(15):
        letter = board[row][col]
        row_str += str(letter) + "|"
    ret += row_str + "\n"
print(ret)