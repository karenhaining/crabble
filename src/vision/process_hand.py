import cv2
import numpy as np
from vision import util
from vision import config

class HandProcessor():
    def __init__(self):
        self.clear()

    def clear(self):
        """
        Resets the state of the processor for the next image
        """

        self.img = None
        self.cropped_hand = None
        self.hand_centroids = [None for _ in range(config.HAND_SIZE)]
    
    def set_image(self, image):
        """
        Sets the image to be processed
        """
        self.img = cv2.imread(image)

    def crop_to_hand(self):
        """
        Unwarps the stored image to be a face-down view of the hand
        """

        corners = util.find_corners(self.img, config.BOARD_BL, config.BOARD_BR, 
                                         config.HOLDER_L, config.HOLDER_R)

        temp_height = config.NEW_HAND_PIXELS_HEIGHT + config.MARKER_DIMENSIONS
        dst = np.array([[0,0],
                        [config.NEW_HAND_PIXELS_LEN, 0],
                        [0, temp_height],
                        [config.NEW_HAND_PIXELS_LEN, temp_height]], 
                        np.float32)

        # unwarp based on aruco markers
        matrix = cv2.getPerspectiveTransform(corners, dst)
        proc_image = cv2.warpPerspective(self.img, matrix, (config.NEW_HAND_PIXELS_LEN, temp_height))

        # crop markers out of frame
        h = int(config.MARKER_DIMENSIONS / 2)
        proc_image = proc_image[h:(temp_height - h), 0:config.NEW_HAND_PIXELS_LEN]

        # resize back to NEW_HAND_PIXELS_LEN x NEW_HAND_PIXELS_HEIGHT
        self.cropped_hand = cv2.resize(proc_image, (config.NEW_HAND_PIXELS_LEN, config.NEW_HAND_PIXELS_HEIGHT))
        return self.cropped_hand


