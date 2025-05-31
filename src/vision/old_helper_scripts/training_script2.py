import os
import shutil
from PIL import Image

source_folder = "vision/unsorted_data"
dst_base = "vision/sorted_data/"



for filename in os.listdir(source_folder):
    source_path = os.path.join(source_folder, filename)

    # Opens an image file
    img = Image.open(source_path)
    # Displays the image
    img.show()
    dir = input("DIR : ")
    dir = dir.strip()
    destination_path = os.path.join(dst_base, dir)

    destination_path = os.path.join(destination_path, filename)
    if os.path.isfile(source_path):
        shutil.move(source_path, destination_path)
