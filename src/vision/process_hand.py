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
        # cv2.drawContours(draw, contours, -1, (255, 0, 0), 1)

        if config.DEBUG_CROPS:
            util.display_image(draw, "HERE")


        dist = config.NEW_HAND_PIXELS_LEN / config.HAND_SIZE
        offset = dist / 2
        y = config.NEW_HAND_PIXELS_HEIGHT / 2
        for i in range(config.HAND_SIZE):
            x = offset + i * dist

            w = config.HAND_LETTER_SIZE
            draw = cv2.getRectSubPix(self.thresh.copy(), [w, w], (x, y))

            # cv2.drawContours(draw, contours, -1, (255, 0, 0), 1)

            # hulls = []
            # areas = []
            # possible_contour_indexes = []

            # for i, c in enumerate(contours):
            #     hull = cv2.convexHull(c)
            #     hulls.append(hull)

            #     a = cv2.contourArea(hull)
            #     areas.append(a)

            #     # Check whether contour area is reasonable for a letter.
            #     if a < int(config.HAND_LETTER_SIZE**2 * config.HAND_LETTER_CONTOUR_MIN_FRAC):
            #         continue
            #     if a > int(config.HAND_LETTER_SIZE**2 * config.HAND_LETTER_CONTOUR_MAX_FRAC):
            #         continue

            #     [x,y,w,h] = cv2.boundingRect(c)
                
            #     if w > h*config.HAND_LETTER_TEXT_RATIO:
            #         # Bad ratio, reject these.
            #         continue

            #     if w*h >= config.HAND_LETTER_SIZE**2 * config.HAND_LETTER_MAX_FILL:
            #         # Too much fill, reject these.
            #         continue

            #     possible_contour_indexes.append(i)

            # util.display_image(draw, f"hereidx {i}, {x}, {y}")

            # possible_contour_indexes = [p for p in possible_contour_indexes if not hierarchy[0][p][3] in possible_contour_indexes]
            # contour_centroids = []
            
            # for i in possible_contour_indexes:
            #     hull = hulls[i]
            #     a = areas[i]

            #     moments = cv2.moments(hull)
            #     hull_centroid = (int(moments['m10']/moments['m00']), int(moments['m01']/moments['m00']))

            #     contour_centroids.append((hull_centroid, i))

            #     draw = cv2.drawContours(draw, [hull], -1, (0, 0, 255), 2)
            #     draw = cv2.circle(draw, hull_centroid, 2, (0,0,255), thickness=3)

            #     draw = cv2.putText(draw, "A%d" % (a) , hull_centroid, cv2.FONT_HERSHEY_SIMPLEX, 0.3, (255,255,255))


            if config.DEBUG_HAND_LETTERS:
                util.display_image(draw, f"idx {i}, {x}, {y}")


        # draw = threshold.copy()
        # cv2.drawContours(draw, contours, -1, (255, 0, 0), 1)

        # util.display_image(draw, "HERE")

        # hulls = []
        # areas = []
        # possible_contour_indexes = []

        # for i, c in enumerate(contours):
        #     hull = cv2.convexHull(c)
        #     hulls.append(hull)

        #     a = cv2.contourArea(hull)
        #     areas.append(a)

        #     # Check whether contour area is reasonable for a letter.
        #     if a < int(config.HAND_LETTER_SIZE**2 * config.HAND_LETTER_CONTOUR_MIN_FRAC):
        #         continue
        #     if a > int(config.HAND_LETTER_SIZE**2 * config.HAND_LETTER_CONTOUR_MAX_FRAC):
        #         continue

        #     [x,y,w,h] = cv2.boundingRect(c)
            
        #     if w > h*config.HAND_LETTER_TEXT_RATIO:
        #         # Bad ratio, reject these.
        #         continue

        #     if w*h >= config.HAND_LETTER_SIZE**2 * config.HAND_LETTER_MAX_FILL:
        #         # Too much fill, reject these.
        #         continue

        #     possible_contour_indexes.append(i)

        # # Remove valid children that are inside valid parents so we only have one valid contour.
        # possible_contour_indexes = [p for p in possible_contour_indexes if not hierarchy[0][p][3] in possible_contour_indexes]
        # contour_centroids = []

        # print(f"POSSIBLE {possible_contour_indexes}")
        # util.display_image(draw, "HERE2")

        # for i in possible_contour_indexes:
        #     hull = hulls[i]
        #     a = areas[i]

        #     moments = cv2.moments(hull)
        #     hull_centroid = (int(moments['m10']/moments['m00']), int(moments['m01']/moments['m00']))

        #     contour_centroids.append((hull_centroid, i))

        #     draw = cv2.drawContours(draw, [hull], -1, (0, 0, 255), 2)
        #     draw = cv2.circle(draw, hull_centroid, 2, (0,0,255), thickness=3)

        #     draw = cv2.putText(draw, "A%d" % (a) , hull_centroid, cv2.FONT_HERSHEY_SIMPLEX, 0.3, (255,255,255))

        # if not contour_centroids:
        #     return

        # print("--------------------------")
        # print(f"CC {contour_centroids}")
        # util.display_image(draw, "HER3E")


        # for i in range(0, config.HAND_SIZE):
        #     p = util.get_center(i, 0, False)
        #     draw = cv2.circle(draw, p, 2, (0,255,0), thickness=3)

        #     r = util.get_bounding_rect(i, 0, False)
        #     draw = cv2.rectangle(draw, r[0], r[1], (0, 255, 0), 1)

        #     (centroid, contour_i) = min(contour_centroids, key=lambda k: util.distance(k[0], p))
        #     d = util.distance(centroid, p)

        #     if d > config.HAND_LETTER_SIZE * config.HAND_LETTER_MAX_SHIFT_FRAC:
        #         continue

        #     # Letter detection
        #     draw = cv2.line(draw, p, centroid, (0, 255, 255), 1)
        #     draw = cv2.putText(draw, "D%d" % (d) , p, cv2.FONT_HERSHEY_SIMPLEX, 0.3, (0,255,255))

        #     self.hand_centroids[i] = centroid

        # # TODO remove debugging
        # cv2.imshow("final image?", draw)
        # cv2.waitKey(0)

    def get_thresh(self, i):
        """
        Gets a binary threshold image for a specific board coordinate

        Returns None if no letter is detected at that location.
        """
        # centroid = self.hand_centroids[i]
        # if not centroid:
        #     return None

        # w = int(config.HAND_LETTER_SIZE * config.HAND_LETTER_TRAIN_SUBPIX_FRAC)
        # return cv2.getRectSubPix(self.thresh, [w, w], centroid)

        dist = config.NEW_HAND_PIXELS_LEN / config.HAND_SIZE
        offset = dist / 2
        y = config.NEW_HAND_PIXELS_HEIGHT / 2
        x = offset + i * dist

        x = x + 10
        y = y + 10

        w = 45
        # w = int(config.BOARD_LETTER_SIZE * config.BOARD_LETTER_TRAIN_SUBPIX_FRAC * config.BOARD_LETTER_MAX_SHIFT_FRAC)

        img = cv2.getRectSubPix(self.thresh.copy(), [w, w], (x, y))

        # expected_dim = int(config.BOARD_LETTER_SIZE * config.BOARD_LETTER_TRAIN_SUBPIX_FRAC * config.BOARD_LETTER_MAX_SHIFT_FRAC)
        # img = cv2.resize(img, (expected_dim, expected_dim))
        return img

