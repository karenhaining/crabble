import cv2

##################
# PHYSICAL SETUP #
##################
# measurements can be done in other units if they are all consistent
BOARD_SIZE = 15             # square dimensions of board 
BOARD_HEIGHT = 362          # vertical length of board (in mm)
BOARD_LENGTH = 390          # horizontal length of board (in mm)       
MARKER_DIMENSIONS = 38      # size of marker including the white space around (in mm)
SIDEBAR_DIMENSIONS = 54     # size of the sidebar: edge of board to edge of playable area (in mm) 

HAND_SIZE = 7
HOLDER_LENGTH = 440
HOLDER_HEIGHT = 42

###############
#    BOARD    #
###############
NEW_BOARD_PIXELS = 1000      # cropped image pixel amount
NEW_HAND_PIXELS_LEN = 1000
NEW_HAND_PIXELS_HEIGHT = 100

###############
#   MARKERS   #
###############
ARUCO_DICT = cv2.aruco.DICT_6X6_50  # Aruco dictionary type
BOARD_TL = 0                        # board top left aruco marker id
BOARD_TR = 1                        # board top right aruco marker id
BOARD_BL = 2                        # board bottom left aruco marker id
BOARD_BR = 3                        # board bottom right aruco marker id

HOLDER_L = 4
HOLDER_R = 5

###############
#   LETTERS   #
###############
BOARD_GAUSSIAN_KERNEL = (5, 5)
BOARD_LETTER_SIZE = 60
BOARD_LETTER_CONTOUR_MIN_FRAC = 0.035
BOARD_LETTER_CONTOUR_MAX_FRAC = 0.700

BOARD_LETTER_TEXT_RATIO = 1.4
BOARD_LETTER_MAX_FILL = 0.65
BOARD_LETTER_PAD_FRAC = 0.5
BOARD_LETTER_MAX_SHIFT_FRAC = 0.45
BOARD_LETTER_TRAIN_SIZE = 18
BOARD_LETTER_TRAIN_SUBPIX_FRAC = 0.75


HAND_GAUSSIAN_KERNEL = (7, 7)
HAND_LETTER_SIZE = 60
HAND_LETTER_CONTOUR_MIN_FRAC = 0.040
HAND_LETTER_CONTOUR_MAX_FRAC = 0.600

HAND_LETTER_TEXT_RATIO = 1.6
HAND_LETTER_MAX_FILL = 0.65
HAND_LETTER_PAD_FRAC = 0.5
HAND_LETTER_MAX_SHIFT_FRAC = 1.6
HAND_LETTER_TRAIN_SIZE = 18
HAND_LETTER_TRAIN_SUBPIX_FRAC = 0.75

###############
#   MODEL     #
###############
CONFIDENCE_THRESHOLD = 0.99999