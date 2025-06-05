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
    
    def set_image_from_msg(self, image):
        """
        Sets the image to be processed
        """
        np_arr = np.fromstring(image.data.tobytes(), np.uint8)
        sideways_image = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        self.img = cv2.rotate(sideways_image, cv2.ROTATE_90_CLOCKWISE)


    def set_image_from_file(self, image):
        """
        Sets the image to be processed
        """
        self.img = cv2.imread(image)

    def crop_to_hand(self):
        """
        Unwarps the stored image to be a face-down view of the hand
        """

        corners = util.find_corners(self.img, config.BOARD_BL, config.BOARD_BR, 
                                         config.HOLDER_BL, config.HOLDER_BR)

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


    def process_tiles(self):
        """
        Processes tiles into the centroids onto the board
        """

        split = cv2.split(cv2.cvtColor(self.cropped_hand, cv2.COLOR_RGB2HSV))
        channel = split[2] # V of HSV

        blurred = cv2.GaussianBlur(channel, config.HAND_GAUSSIAN_KERNEL, 0)
        threshold = cv2.adaptiveThreshold(blurred, 255, 
                                        cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
                                        cv2.THRESH_BINARY_INV, 
                                        45, 
                                        15)

        self.thresh = threshold
        contours, hierarchy = cv2.findContours(threshold, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
        
        draw = threshold.copy()

        if config.DEBUG_CROPS:
            util.display_image(draw, "HERE")


        dist = config.NEW_HAND_PIXELS_LEN / config.HAND_SIZE
        offset = dist / 2
        y = config.NEW_HAND_PIXELS_HEIGHT / 2
        for i in range(config.HAND_SIZE):
            x = offset + i * dist

            w = config.HAND_LETTER_SIZE
            draw = cv2.getRectSubPix(self.thresh.copy(), [w, w], (x, y))

            if config.DEBUG_CROPS:
                util.display_image(draw, f"idx {i}, {x}, {y}")


    def get_thresh(self, i):
        """
        Gets a binary threshold image for a specific board coordinate

        Returns None if no letter is detected at that location.
        """
        dist = config.NEW_HAND_PIXELS_LEN / config.HAND_SIZE
        offset = dist / 2
        y = config.NEW_HAND_PIXELS_HEIGHT / 2
        x = offset + i * dist

        x = x + 10
        y = y + 10

        w = 45
        img = cv2.getRectSubPix(self.thresh.copy(), [w, w], (x, y))
        return img
