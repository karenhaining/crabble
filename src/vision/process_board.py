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

class BoardProcessor():

    def __init__(self, image):
        self.img = cv2.imread(image)
        self.gray = cv2.cvtColor(self.img, cv2.COLOR_BGR2GRAY)

    def find_corners(self):
        # Find the aruco markers
        aruco_dict = cv2.aruco.getPredefinedDictionary(ARUCO_DICT)
        parameters = cv2.aruco.DetectorParameters()
        detector = cv2.aruco.ArucoDetector(aruco_dict, parameters)

        corners, ids, _ = detector.detectMarkers(self.gray)
        self.corners = corners
        self.ids = ids

        # TODO fix this number later
        if len(ids) < 4:
            raise Exception("Not enough markers detected!")

    def unwarp_board(self):
        # first, make sure our array is in the right order
        tl_ind = int(np.where(self.ids == TL)[0])
        tr_ind = int(np.where(self.ids == TR)[0])
        bl_ind = int(np.where(self.ids == BL)[0])
        br_ind = int(np.where(self.ids == BR)[0])
        
        # TODO maybe assert these are all found

        # TODO fix hardcoding and also the [0][0]s
        src = np.float32([self.corners[tl_ind][0][0], self.corners[tr_ind][0][0],
                self.corners[bl_ind][0][0], self.corners[br_ind][0][0]])
        dst = np.array([[1000,1000],[0,1000],[1000,0],[0,0],], np.float32)  # TODO also fix

        print(src)
        print(dst)

        matrix = cv2.getPerspectiveTransform(src, dst)

        # Apply the perspective transform
        warped_image = cv2.warpPerspective(self.gray, matrix, (1000, 1000))

        # Display the original and transformed images
        cv2.imshow('Original Image', self.gray)
        cv2.imshow('Warped Image', warped_image)
        cv2.waitKey(0)
        cv2.destroyAllWindows()

