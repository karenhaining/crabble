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

    if len(ids) < config.NUM_MARKERS:
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

def get_centroid_rect(c, frac, is_board):
    if is_board:
        letter_size = config.BOARD_LETTER_SIZE
    else:
        letter_size = config.HAND_LETTER_SIZE

    w = int(letter_size * frac)
    start = (c[0] - int(w/2), c[1] - int(w/2))
    end = (start[0] + w, start[1] + w)
    return [start, end]


def get_center(x, y, is_board):
    if is_board:
        letter_size = config.BOARD_LETTER_SIZE
        letter_pad_frac = config.BOARD_LETTER_PAD_FRAC
    else:
        letter_size = config.HAND_LETTER_SIZE
        letter_pad_frac = config.HAND_LETTER_PAD_FRAC

    return (int(letter_size * letter_pad_frac) 
            + int(letter_size/2) + letter_size * x, 
            int(letter_size * letter_pad_frac) 
            + int(letter_size/2) + letter_size * y)

def get_bounding_rect(x, y, is_board):
    if is_board:
        letter_size = config.BOARD_LETTER_SIZE
        letter_pad_frac = config.BOARD_LETTER_PAD_FRAC
    else:
        letter_size = config.HAND_LETTER_SIZE
        letter_pad_frac = config.HAND_LETTER_PAD_FRAC

    start = (int(letter_size * letter_pad_frac) + letter_size * x, 
            int(letter_size * letter_pad_frac) + letter_size * y)
    end = (start[0] + letter_size, start[1] + letter_size)
    return [start, end]

def distance(p1, p2):
    (x1, y1) = p1
    (x2, y2) = p2
    return math.sqrt((x1 - x2) ** 2 + (y1 - y2) **2)

def display_image(img, label="Image"):
    cv2.imshow(label, img)
    cv2.waitKey(0)