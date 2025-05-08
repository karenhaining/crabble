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

# ArUco marker configuration
ARUCO_DICT = cv2.aruco.DICT_6X6_50
TL = 0              # board top left aruco marker id
TR = 1              # board top right aruco marker id
BL = 2              # board bottom left aruco marker id
BR = 3              # board bottom right aruco marker id

# MISC
NEW_BOARD_PIXELS = 1000

class BoardProcessor():

    def __init__(self, image):
        self._img = cv2.imread(image)
        self._gray = cv2.cvtColor(self._img, cv2.COLOR_BGR2GRAY)

    def _find_corners(self):
        # Find the aruco markers
        aruco_dict = cv2.aruco.getPredefinedDictionary(ARUCO_DICT)
        parameters = cv2.aruco.DetectorParameters()
        detector = cv2.aruco.ArucoDetector(aruco_dict, parameters)
        corners, ids, _ = detector.detectMarkers(self._gray)
        ids = np.ndarray.flatten(ids)       # why was this not flattened in the first place???

        print(corners)
        print(ids)

        # TODO fix this number later
        if len(ids) < 4:
            raise Exception("Not enough markers detected!")

        # process corners such that it represents the center of the aruco markers
        # make sure we get the right indices
        # TODO maybe refactor this into 1 fn
        tl_indices = np.where(ids == [TL])
        if len(tl_indices) > 1:
            raise Exception(f'Too many markers with ID {TL}')

        tr_indices = np.where(ids == TR)
        if len(tr_indices) > 1:
            raise Exception(f'Too many markers with ID {TR}')

        bl_indices = np.where(ids == BL)
        if len(bl_indices) > 1:
            raise Exception(f'Too many markers with ID{BL}')

        br_indices = np.where(ids == BR)
        if len(br_indices) > 1:
            raise Exception(f'Too many markers with ID{BR}')

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
        src = self.corners
        dst = np.array([[NEW_BOARD_PIXELS, NEW_BOARD_PIXELS],
                        [0, NEW_BOARD_PIXELS],
                        [NEW_BOARD_PIXELS, 0],
                        [0,0],], np.float32)

        # Apply the perspective transform
        matrix = cv2.getPerspectiveTransform(src, dst)
        warped_image = cv2.warpPerspective(self._gray, matrix, (NEW_BOARD_PIXELS, NEW_BOARD_PIXELS))
        warped_image = cv2.rotate(warped_image, cv2.ROTATE_180)

        # Display the original and transformed images
        # TODO remove
        cv2.imshow('Warped Image', warped_image)
        cv2.waitKey(0)
        cv2.destroyAllWindows()

        self.board = warped_image

    def process_board(self):
        self._find_corners()
        self._unwarp_board()
        return self.board
