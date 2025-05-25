"""
1. Find the Aruco markers of the board (corners)
2. Unwarp perspective of the entire image using the board
3. Split into board and hand
4. Process tiles on board
5. Process tiles in hand
"""

import cv2
import numpy as np
import matplotlib.pyplot as plt
from vision import util
from vision import config

class BoardProcessor():
    def __init__(self, image):
        self._img = cv2.imread(image)
        self._gray = cv2.cvtColor(self._img, cv2.COLOR_BGR2GRAY)

    def _find_corners(self):
        # Find the aruco markers
        aruco_dict = cv2.aruco.getPredefinedDictionary(config.ARUCO_DICT)
        parameters = cv2.aruco.DetectorParameters()
        detector = cv2.aruco.ArucoDetector(aruco_dict, parameters)
        corners, ids, _ = detector.detectMarkers(self._gray)
        ids = np.ndarray.flatten(ids)       # why was this not flattened in the first place???

        # TODO fix this number later
        if len(ids) < 4:
            raise Exception("Not enough markers detected!")

        # process corners such that it represents the center of the aruco markers
        # make sure we get the right indices
        # TODO maybe refactor this into 1 fn
        tl_indices = np.where(ids == [config.TL])
        if len(tl_indices) > 1:
            raise Exception(f'Too many markers with ID {config.TL}')

        tr_indices = np.where(ids == config.TR)
        if len(tr_indices) > 1:
            raise Exception(f'Too many markers with ID {config.TR}')

        bl_indices = np.where(ids == config.BL)
        if len(bl_indices) > 1:
            raise Exception(f'Too many markers with ID{config.BL}')

        br_indices = np.where(ids == config.BR)
        if len(br_indices) > 1:
            raise Exception(f'Too many markers with ID{config.BR}')

        tl_ind = int(tl_indices[0])
        tr_ind = int(tr_indices[0])
        bl_ind = int(bl_indices[0])
        br_ind = int(br_indices[0])
        
        # process to use midpoints of corners
        # corners will always be in the order [TL, TR, BL, BR]
        corner_midpoints = np.float32([self._get_aruco_midpoint(corners[tl_ind]),
                         self._get_aruco_midpoint(corners[tr_ind]),
                         self._get_aruco_midpoint(corners[bl_ind]),
                         self._get_aruco_midpoint(corners[br_ind])])

        self.corners = corner_midpoints

    def _get_aruco_midpoint(self, aruco):
        # the aruco detection returns all four corners, get the midpoints
        x, y = np.mean(aruco[0], axis=0)
        return [x, y]

    def _unwarp_board(self):
        self.board = util.crop_board(self._gray, self.corners)

    def process_board(self):
        self._find_corners()
        self._unwarp_board()

        util.display_image(self.board, "BOARD")
        return self.board

    def get_corners(self):
        return self.corners
