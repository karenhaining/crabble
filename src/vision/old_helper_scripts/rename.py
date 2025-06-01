import os 

DIR = "vision/unsorted_data"

for filename in os.listdir(DIR):
    old_file_path = os.path.join(DIR, filename)

    # new_filename = "holder_" + filename[0:filename.index(".")] + ".jpg"
    new_filename = filename.replace(".jpg", "_")
    new_file_path = os.path.join(DIR, new_filename)
 
    if (os.path.exists(new_filename)):
        continue

    os.rename(old_file_path, new_file_path)
