import os
import shutil
from PIL import Image

letter = "Z"
source_folder = "vision/data/" + letter

i = 0

filenames = os.listdir(source_folder)

for filename in filenames:

    if filename in ["val", "training"]:
        continue

    source_path = os.path.join(source_folder, filename)


    if i < 10:
        destination_path = os.path.join(source_folder, "val")
        shutil.move(source_path, destination_path)

    else:
        destination_path = os.path.join(source_folder, "training")
        shutil.move(source_path, destination_path)

    i += 1

