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

# import shutil
# class_names = [
#     'A', 'B', 'C', 'D', 'E', 'F', 'G',
#     'H', 'I', 'J', 'K', 'L', 'M', 'N',
#     'O', 'P', 'Q', 'R', 'S', 'T', 'U',
#     'V', 'W', 'X', 'Y', 'Z'
# ]


# for letter in class_names:
#     DIR_BASE = "vision/data/" + letter

#     for dir in ["/training", "/val"]:

        # for filename in os.listdir(DIR):
        #     source_path = os.path.join(DIR, filename)
        #     if os.path.isfile(source_path):
        #         destination_path = os.path.join(DIR_BASE, filename)
        #         if os.path.isfile(source_path):
        #             shutil.move(source_path, destination_path)
