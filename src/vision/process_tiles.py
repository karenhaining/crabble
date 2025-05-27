import cv2
from vision import util 
from vision import config

class TileProcessor():
    def __init__(self, img, corners):
        img = cv2.imread(img)

        # crop to board
        cropped = util.crop_board(img, corners)

        # use hsv
        split = cv2.split(cv2.cvtColor(cropped, cv2.COLOR_RGB2HSV))
        channel = split[2] # V of HSV
        self.img = channel

        self.board_centroids = [[None for i in range(config.BOARD_SIZE)] for j in range(config.BOARD_SIZE)]

    def get_thresh(self, x, y):
        """
        Gets a binary threshold image for a specific board coordinate

        Returns None if no letter is detected at that location.
        """
        centroid = self.board_centroids[x][y]
        if not centroid:
            return None

        w = int(config.LETTER_SIZE * config.LETTER_TRAIN_SUBPIX_FRAC)
        return cv2.getRectSubPix(self.thresh, [w, w], centroid)

    def threshold(self):

        blurred = cv2.GaussianBlur(self.img, config.GAUSSIAN_KERNEL, 0)
        threshold = cv2.adaptiveThreshold(blurred, 255, 
                                        cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
                                        cv2.THRESH_BINARY_INV, 
                                        45, 
                                        15)

        self.thresh = threshold
        contours, hierarchy = cv2.findContours(threshold, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
        
        draw = threshold.copy()
        cv2.drawContours(draw, contours, -1, (255, 0, 0), 1)

        util.display_image(draw, "HERE")


        hulls = []
        areas = []
        possible_contour_indexes = []

        for i, c in enumerate(contours):
            hull = cv2.convexHull(c)
            hulls.append(hull)

            a = cv2.contourArea(hull)
            areas.append(a)

            # Check whether contour area is reasonable for a letter.
            if a < int(config.LETTER_SIZE**2 * config.LETTER_CONTOUR_MIN_FRAC):
                continue
            if a > int(config.LETTER_SIZE**2 * config.LETTER_CONTOUR_MAX_FRAC):
                continue

            [x,y,w,h] = cv2.boundingRect(c)
            
            if w > h*config.LETTER_TEXT_RATIO:
                # Bad ratio, reject these.
                continue

            if w*h >= config.LETTER_SIZE**2 * config.LETTER_MAX_FILL:
                # Too much fill, reject these.
                continue

            possible_contour_indexes.append(i)

        # Remove valid children that are inside valid parents so we only have one valid contour.
        possible_contour_indexes = [p for p in possible_contour_indexes if not hierarchy[0][p][3] in possible_contour_indexes]
        contour_centroids = []

        for i in possible_contour_indexes:
            hull = hulls[i]
            a = areas[i]

            moments = cv2.moments(hull)
            hull_centroid = (int(moments['m10']/moments['m00']), int(moments['m01']/moments['m00']))

            contour_centroids.append((hull_centroid, i))

            draw = cv2.drawContours(draw, [hull], -1, (0, 0, 255), 2)
            draw = cv2.circle(draw, hull_centroid, 2, (0,0,255), thickness=3)

            draw = cv2.putText(draw, "A%d" % (a) , hull_centroid, cv2.FONT_HERSHEY_SIMPLEX, 0.3, (255,255,255))

        if not contour_centroids:
            return

        for i in range(0, config.BOARD_SIZE):
            for j in range(0, config.BOARD_SIZE):
                p = util.get_center(i, j)
                draw = cv2.circle(draw, p, 2, (0,255,0), thickness=3)

                r = util.get_bounding_rect(i, j)
                draw = cv2.rectangle(draw, r[0], r[1], (0, 255, 0), 1)

                (centroid, contour_i) = min(contour_centroids, key=lambda k: util.distance(k[0], p))
                d = util.distance(centroid, p)

                if d > config.LETTER_SIZE * config.LETTER_MAX_SHIFT_FRAC:
                    continue

                # Letter detection
                draw = cv2.line(draw, p, centroid, (0, 255, 255), 1)
                draw = cv2.putText(draw, "D%d" % (d) , p, cv2.FONT_HERSHEY_SIMPLEX, 0.3, (0,255,255))

                rc = util.get_centroid_rect(centroid, config.LETTER_TRAIN_SUBPIX_FRAC)
                # crop = cv2.rectangle(draw, rc[0], rc[1], (0, 255, 255), 1)

                self.board_centroids[i][j] = centroid


        cv2.imshow("final image?", draw)
        cv2.waitKey(0)
