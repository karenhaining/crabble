import cv2
import math
import numpy as np
from vision import config

def get_aruco_midpoint(aruco):
    # the aruco detection returns all four corners, get the midpoints
    x, y = np.mean(aruco[0], axis=0)
    return [x, y]

def find_corners(img, tl, tr, bl, br):
    # Find the aruco markers
    aruco_dict = cv2.aruco.getPredefinedDictionary(config.ARUCO_DICT)
    parameters = cv2.aruco.DetectorParameters()
    detector = cv2.aruco.ArucoDetector(aruco_dict, parameters)
    corners, ids, _ = detector.detectMarkers(img)
    ids = np.ndarray.flatten(ids)       # why was this not flattened in the first place???

    # TODO fix this number later
    if len(ids) < 4:
        raise Exception("Not enough markers detected!")

    # process corners such that it represents the center of the aruco markers
    # make sure we get the right indices
    # TODO maybe refactor this into 1 fn
    tl_indices = np.where(ids == [tl])
    if len(tl_indices) > 1:
        raise Exception(f'Too many markers with ID {tl}')

    tr_indices = np.where(ids == tr)
    if len(tr_indices) > 1:
        raise Exception(f'Too many markers with ID {tr}')

    bl_indices = np.where(ids == bl)
    if len(bl_indices) > 1:
        raise Exception(f'Too many markers with ID{bl}')

    br_indices = np.where(ids == br)
    if len(br_indices) > 1:
        raise Exception(f'Too many markers with ID{br}')

    tl_ind = int(tl_indices[0])
    tr_ind = int(tr_indices[0])
    bl_ind = int(bl_indices[0])
    br_ind = int(br_indices[0])
    
    # process to use midpoints of corners
    # corners will always be in the order [TL, TR, BL, BR]
    corner_midpoints = np.float32([get_aruco_midpoint(corners[tl_ind]),
                      get_aruco_midpoint(corners[tr_ind]),
                      get_aruco_midpoint(corners[bl_ind]),
                      get_aruco_midpoint(corners[br_ind])])

    return corner_midpoints

def crop_hand(img, corners):
    """
    Given an image of the entire board and the aruco marker corners,
    crops to board to the playable area. Returns cropped image.
    """
    dst = np.array([[0,0],
                    [config.NEW_HAND_PIXELS_LEN, 0],
                    [0, config.NEW_HAND_PIXELS_HEIGHT],
                    [config.NEW_HAND_PIXELS_LEN, config.NEW_HAND_PIXELS_HEIGHT]], 
                    np.float32)

    # unwarp based on aruco markers
    matrix = cv2.getPerspectiveTransform(corners, dst)
    proc_image = cv2.warpPerspective(img, matrix, (config.NEW_HAND_PIXELS_LEN, config.NEW_HAND_PIXELS_HEIGHT))
    
    # crop markers out of frame
    # x = int(config.MARKER_DIMENSIONS / 2 / config.HOLDER_LENGTH * config.NEW_HAND_PIXELS_LEN)
    # y = int(config.MARKER_DIMENSIONS / 2 / config.HOLDER_HEIGHT * config.NEW_HAND_PIXELS_HEIGHT)
    # proc_image = proc_image[x:(config.NEW_HAND_PIXELS_LEN - x), y:(config.NEW_HAND_PIXELS_HEIGHT - y)]


    # resize back to NEW_BOARD_PIXELS x NEW_BOARD_PIXELS
    proc_image = cv2.resize(proc_image, (config.NEW_HAND_PIXELS_LEN, config.NEW_HAND_PIXELS_HEIGHT))

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