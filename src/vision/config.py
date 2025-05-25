import cv2

##################
# PHYSICAL SETUP #
##################
# measurements can be done in other units if they are all consistent
BOARD_SIZE = 15             # square dimensions of board 
BOARD_HEIGHT = 362          # vertical length of board (in mm)
BOARD_LENGTH = 390          # horizontal length of board (in mm)       
MARKER_DIMENSIONS = 38      # size of marker including the white space around (in mm)
SIDEBAR_DIMENSIONS = 57     # size of the sidebar: edge of board to edge of playable area (in mm) 


###############
#    BOARD    #
###############
NEW_BOARD_PIXELS = 1000      # cropped image pixel amount


###############
#   MARKERS   #
###############
ARUCO_DICT = cv2.aruco.DICT_6X6_50  # Aruco dictionary type
TL = 0                              # board top left aruco marker id
TR = 1                              # board top right aruco marker id
BL = 2                              # board bottom left aruco marker id
BR = 3                              # board bottom right aruco marker id


###############
#   LETTERS   #
###############
GAUSSIAN_KERNEL = (5, 5)
LETTER_SIZE = 60
LETTER_CONTOUR_MIN_FRAC = 0.035
LETTER_CONTOUR_MAX_FRAC = 0.650

LETTER_TEXT_RATIO = 1.4
LETTER_MAX_FILL=0.65
LETTER_PAD_FRAC = 0.5
LETTER_MAX_SHIFT_FRAC = 0.35
LETTER_TRAIN_SIZE = 18
LETTER_TRAIN_SUBPIX_FRAC = 0.75
