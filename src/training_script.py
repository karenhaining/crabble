import cv2
import os

from vision import util 
from vision import config
from vision import process_board

DIR = "vision/data/second_round"


def to_sample(img):
  shrunk = cv2.resize(img, (config.LETTER_TRAIN_SIZE, config.LETTER_TRAIN_SIZE))
  return shrunk.reshape((1,config.LETTER_TRAIN_SIZE**2))

for filename in os.listdir(DIR):
    filepath = os.path.join(DIR, filename)

    num = 0


    try:
        img = cv2.imread(filepath)
        bp = process_board.BoardProcessor(filepath)
        bd = bp.process_board()
        corners = bp.get_corners()

        # crop to board
        cropped = util.crop_board(img, corners)
    except:
        print(f"FAILED IMAGE: {filename}")
        continue

    # use hsv
    split = cv2.split(cv2.cvtColor(cropped, cv2.COLOR_RGB2HSV))
    channel = split[2] # V of HSV

    board_centroids = [[None for i in range(config.BOARD_SIZE)] for j in range(config.BOARD_SIZE)]
    img = channel

    blurred = cv2.GaussianBlur(img, config.GAUSSIAN_KERNEL, 0)
    threshold = cv2.adaptiveThreshold(blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, 45, 20)

    thresh = threshold
    contours, hierarchy = cv2.findContours(threshold, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
    
    draw = threshold.copy()
    cv2.drawContours(draw, contours, -1, (255, 0, 0), 1)

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

            board_centroids[i][j] = centroid

            # get thresh
            w = int(config.LETTER_SIZE * config.LETTER_TRAIN_SUBPIX_FRAC)
            pic = cv2.getRectSubPix(thresh, [w, w], centroid)


            output_directory = "vision/unsorted_data/"
            output_path = os.path.join(output_directory, filename + str(num) + ".png")

            # Save the image
            cv2.imwrite(output_path, pic)

            num += 1


