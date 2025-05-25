import cv2
import math
import numpy as np
from vision import config

def crop_board(img, corners):
    """
    Given an image of the entire board and the aruco marker corners,
    crops to board to the playable area. Returns cropped image.
    """
    dst = np.array([[0,0],
                    [config.NEW_BOARD_PIXELS, 0],
                    [0, config.NEW_BOARD_PIXELS],
                    [config.NEW_BOARD_PIXELS, config.NEW_BOARD_PIXELS]], 
                    np.float32)

    # unwarp based on aruco markers
    matrix = cv2.getPerspectiveTransform(corners, dst)
    proc_image = cv2.warpPerspective(img, matrix, (config.NEW_BOARD_PIXELS, config.NEW_BOARD_PIXELS))
    
    # crop markers out of frame
    x = int(config.MARKER_DIMENSIONS / 2 / config.BOARD_LENGTH * config.NEW_BOARD_PIXELS)
    y = int(config.MARKER_DIMENSIONS / 2 / config.BOARD_HEIGHT * config.NEW_BOARD_PIXELS)
    proc_image = proc_image[x:(config.NEW_BOARD_PIXELS - x), y:(config.NEW_BOARD_PIXELS - y)]

    # crop sidebar out of frame
    dims = proc_image.shape     # some arrs will have 2 vals, others will have 3
    x_dim = dims[0]
    y_dim = dims[1]
    x = int(config.SIDEBAR_DIMENSIONS / (config.BOARD_LENGTH - config.MARKER_DIMENSIONS) * x_dim)
    proc_image = proc_image[0:y_dim, x:x_dim]

    # resize back to NEW_BOARD_PIXELS x NEW_BOARD_PIXELS
    proc_image = cv2.resize(proc_image, (config.NEW_BOARD_PIXELS, config.NEW_BOARD_PIXELS))

    return proc_image

def get_centroid_rect(c, frac):
  w = int(config.LETTER_SIZE * frac)
  start = (c[0] - int(w/2), c[1] - int(w/2))
  end = (start[0] + w, start[1] + w)
  return [start, end]

def get_center(x, y):
  return (int(config.LETTER_SIZE * config.LETTER_PAD_FRAC) 
        + int(config.LETTER_SIZE/2) + config.LETTER_SIZE * x, 
        int(config.LETTER_SIZE * config.LETTER_PAD_FRAC) 
        + int(config.LETTER_SIZE/2) + config.LETTER_SIZE * y)

def get_bounding_rect(x, y):
  start = (int(config.LETTER_SIZE * config.LETTER_PAD_FRAC) + config.LETTER_SIZE * x, 
        int(config.LETTER_SIZE * config.LETTER_PAD_FRAC) + config.LETTER_SIZE * y)
  end = (start[0] + config.LETTER_SIZE, start[1] + config.LETTER_SIZE)
  return [start, end]

def distance(p1, p2):
  (x1, y1) = p1
  (x2, y2) = p2
  return math.sqrt((x1 - x2) ** 2 + (y1 - y2) **2)

def display_image(img, label="Image"):
    cv2.imshow(label, img)
    cv2.waitKey(0)