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

        # corners = util.find_corners(self.img, config.BOARD_TL, config.BOARD_TR, 
        #                             config.BOARD_BL, config.BOARD_BR)

        dst = np.array([[0,0],
                        [config.NEW_HAND_PIXELS_LEN, 0],
                        [0, config.NEW_HAND_PIXELS_HEIGHT],
                        [config.NEW_HAND_PIXELS_LEN, config.NEW_HAND_PIXELS_HEIGHT]], 
                        np.float32)

        # unwarp based on aruco markers
        matrix = cv2.getPerspectiveTransform(corners, dst)
        proc_image = cv2.warpPerspective(self.img, matrix, (config.NEW_HAND_PIXELS_LEN, config.NEW_HAND_PIXELS_HEIGHT))
        
        # crop markers out of frame
        # x = int(config.MARKER_DIMENSIONS / 2 / config.HOLDER_LENGTH * config.NEW_HAND_PIXELS_LEN)
        # y = int(config.MARKER_DIMENSIONS / 2 / config.HOLDER_HEIGHT * config.NEW_HAND_PIXELS_HEIGHT)
        # proc_image = proc_image[x:(config.NEW_HAND_PIXELS_LEN - x), y:(config.NEW_HAND_PIXELS_HEIGHT - y)]


        # resize back to NEW_HAND_PIXELS_LEN x NEW_HAND_PIXELS_HEIGHT
        self.cropped_hand = cv2.resize(proc_image, (config.NEW_HAND_PIXELS_LEN, config.NEW_HAND_PIXELS_HEIGHT))
        return self.cropped_hand


