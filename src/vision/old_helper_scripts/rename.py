import os 

DIR = "vision/data/Y/"

for filename in os.listdir(DIR):
    old_file_path = os.path.join(DIR, filename)

    new_filename = filename[0:filename.index(".")] + ".png"
    new_file_path = os.path.join(DIR, new_filename)
 
    if (os.path.exists(new_filename)):
        continue

    os.rename(old_file_path, new_file_path)
