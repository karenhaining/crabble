import cv2
import os
import numpy as np

def is_valid_rect(x1, y1, x2, y2, img_w, img_h):
    return (
        0 <= x1 < x2 <= img_w and
        0 <= y1 < y2 <= img_h
    )

def shrink_image(img, shrink_factor_range):
    h, w = img.shape

    img_copy = img.copy()
    shrink_factor = np.random.uniform(*shrink_factor_range)
    new_w, new_h = int(w * shrink_factor), int(h * shrink_factor)
    resized = cv2.resize(img_copy, (new_w, new_h), interpolation=cv2.INTER_NEAREST)

    # Place resized image in the center of a black canvas
    canvas = np.zeros((h, w), dtype=np.uint8)  # black background
    x_offset = (w - new_w) // 2
    y_offset = (h - new_h) // 2
    canvas[y_offset:y_offset + new_h, x_offset:x_offset + new_w] = resized
    img_copy = canvas

    return img_copy


def add_rectangular_edge_noise(img):
    """
    Adds rectangular noise to the borders of a binary image, simulating tile edges.
    - max_boxes: Maximum number of rectangles
    - box_size_range: Min and max width/height of rectangles
    """
    h, w = img.shape
    shrunk = shrink_image(img, (0.6, 0.8))
    noisy = shrunk.copy()

    # top location
    if np.random.rand() < 0.5:
        x = np.random.randint(0, w // 10)
        y = np.random.randint(0, h // 10)

        len = np.random.randint(w // 2, w)
        thickness = np.random.randint(h // 20, h // 10)

        cv2.rectangle(noisy, (x, y), (x + len, y + thickness), 255, -1)

    # bottom location
    if np.random.rand() < 0.5:
        x = np.random.randint(0, w // 10)
        y = h - np.random.randint(0, h // 10)

        len = np.random.randint(w // 2, w)
        thickness = np.random.randint(h // 20, h // 10)

        cv2.rectangle(noisy, (x, y), (x + len, y + thickness), 255, -1)

    # left location
    if np.random.rand() < 0.5:
        x = np.random.randint(0, w // 10)
        y = np.random.randint(0, h // 10)

        thickness = np.random.randint(w // 2, w)
        len = np.random.randint(h // 20, h // 10)

        cv2.rectangle(noisy, (x, y), (x + len, y + thickness), 255, -1)


    # right location
    if np.random.rand() < 0.5:
        x = np.random.randint(w - w // 10, w)
        y = np.random.randint(0, h // 10)

        thickness = np.random.randint(w // 2, w)
        len = np.random.randint(h // 20, h // 10)

        cv2.rectangle(noisy, (x, y), (x + len, y + thickness), 255, -1)

    return noisy


def add_salt_pepper_noise(img, prob=0.01):
    """Add salt and pepper noise to the image."""
    noisy = img.copy()
    rand = np.random.rand(*img.shape)
    noisy[rand < prob] = 0
    noisy[rand > 1 - prob] = 255
    return noisy

def shrink_and_warp(img, shrink_factor_range=(0.6, 1.0), warp_strength=0.2):
    """
    Shrinks and applies a perspective warp to a binary image, keeping a black background.
    - shrink_factor_range: Tuple (min_scale, max_scale)
    - warp_strength: Maximum warp distortion as a fraction of width/height
    """
    h, w = img.shape
    img_copy = img.copy()

    img_copy = shrink_image(img, shrink_factor_range)

    # Random perspective warp
    max_disp_x = int(warp_strength * w)
    max_disp_y = int(warp_strength * h)

    def random_offset(pt):
        dx = np.random.randint(-max_disp_x, max_disp_x)
        dy = np.random.randint(-max_disp_y, max_disp_y)
        return [pt[0] + dx, pt[1] + dy]

    src_pts = np.float32([[0, 0], [w, 0], [w, h], [0, h]])
    dst_pts = np.float32([random_offset(pt) for pt in src_pts])

    matrix = cv2.getPerspectiveTransform(src_pts, dst_pts)
    warped = cv2.warpPerspective(img_copy, matrix, (w, h), borderValue=0)  # keep black

    return warped


def add_blob_noise(img, num_blobs=5, min_radius=1, max_radius=4):
    """
    Add blob-shaped noise to an image.

    Parameters:
        img (np.ndarray): Input image (H x W x C), RGB or grayscale, uint8.
        num_blobs (int): Number of white blobs to draw.
        min_radius (int): Minimum radius of each blob.
        max_radius (int): Maximum radius of each blob.
        alpha_range (tuple): Range of transparency for blobs (0 = transparent, 1 = solid white).

    Returns:
        np.ndarray: Image with white blobs added.
    """
    output = img.copy()
    h, w = img.shape[:2]

    for _ in range(num_blobs):
        center_x = np.random.randint(0, w)
        center_y = np.random.randint(0, h)
        radius = np.random.randint(min_radius, max_radius)
        alpha = 1

        # Create white blob on overlay
        overlay = output.copy()
        color = (255, 255, 255) if len(img.shape) == 3 else 255
        cv2.circle(overlay, (center_x, center_y), radius, color, -1)

        # Blend overlay with original
        output = cv2.addWeighted(overlay, alpha, output, 1 - alpha, 0)

    return output


def random_augment(img, config=None):
    """
    Apply a random combination of augmentations to a binary image.
    `config` is a dict to enable/disable individual types.
    """
    if config is None:
        config = {
            "edge_noise": True,
            "salt_pepper": True,
            "shrink_and_warp": True,
            "add_blob_noise": True
        }

    aug_img = img.copy()
    
    added = False

    if config.get("edge_noise", True) and np.random.rand() < 0.75:
        aug_img = add_rectangular_edge_noise(aug_img)
        added = True

    if config.get("shrink_and_warp", True) and np.random.rand() < 0.95:
        aug_img = shrink_and_warp(aug_img)
        added = True
    
    if config.get("salt_pepper", True) and np.random.rand() < 0.5:
        aug_img = add_salt_pepper_noise(aug_img, prob=0.01)
        added = True

    if config.get("add_blob_noise", True) and np.random.rand() < 0.1:
        aug_img = add_blob_noise(aug_img)
        added = True

    if not added:
        print("here")
        aug_img = add_salt_pepper_noise(aug_img, prob=0.03)

    return aug_img


DIR = "vision/data"

synth_pattern = "_synth.png"
holder_pattern = "_holder"
num_to_gen = 3

for filename in os.listdir(DIR):
    curr_dir = os.path.join(DIR, filename)

    # first, go delete all the existing synthetic images
    imgs = os.listdir(curr_dir)
    for img in imgs:
        if synth_pattern in img:
            full_img_name = os.path.join(curr_dir, img)
            os.remove(full_img_name)


    # now, augment existing images in the training folder
    imgs = os.listdir(curr_dir)
    for img_name in imgs:
        if synth_pattern not in img_name:
            
            if holder_pattern not in img_name:
                configs = {
                    "edge_noise": True,
                    "salt_pepper": True,
                    "shrink_and_warp": True,
                    "add_blob_noise": True
                }
            else:
                configs = {
                    "edge_noise": False,
                    "salt_pepper": True,
                    "shrink_and_warp": True,
                    "add_blob_noise": True
                }
            
            try:
                for i in range(num_to_gen):
                    img_path = os.path.join(curr_dir, img_name)

                    cv_im = cv2.imread(img_path)
                    cv_im = cv2.cvtColor(cv_im, cv2.COLOR_BGR2GRAY)
                    aug = random_augment(cv_im, configs)

                    new_path = os.path.join(curr_dir, img_name[0:img_name.index(".")] + "_" + str(i) + synth_pattern)
                    cv2.imwrite(new_path, aug)
            except Exception as e:
                print(e)
                continue



# walk through each of the letter subdirs
# for filename in os.listdir(DIR):
#     print(filename)

#     curr_dir = os.path.join(DIR, filename)
#     augmented_data_folder = os.path.join(curr_dir, "augmented")

#     if not os.path.exists(augmented_data_folder):
#         os.makedirs(augmented_data_folder, exist_ok=True)

#     for img in os.listdir(curr_dir):
#         try:
#             img_path = os.path.join(curr_dir, img)

#             cv_im = cv2.imread(img_path)
#             cv_im = cv2.cvtColor(cv_im, cv2.COLOR_BGR2GRAY)
#             aug = random_augment(cv_im)

#             new_path = os.path.join(augmented_data_folder, img[0:img.index(".")] + "_aug.png")
#             cv2.imwrite(new_path, aug)
#         except Exception:
#             continue



# # Load a binary tile image
# img = cv2.imread('vision/data/A/1.png', cv2.IMREAD_GRAYSCALE)

# # Ensure binary (threshold if needed)
# _, img = cv2.threshold(img, 127, 255, cv2.THRESH_BINARY)

# # Apply augmentation
# augmented_img = random_augment(img)

# # Show or save result
# cv2.imshow("Augmented Tile", augmented_img)
# cv2.waitKey(0)
# cv2.destroyAllWindows()
