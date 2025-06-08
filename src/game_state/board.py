"""
Representation of the Scrabble board.
A SIZE by SIZE matrix (15 x 15).
The origin coordinates (0,0) are in the top left corner of the board.
"""

import heapq

EMPTY = ''


# To validate the board state for one-off misidentification
# Uses a priority queue to keep track of the most-identified letter at that spot
# Special case handling for empty identifications
class LetterState:
    def __init__(self):
        self.q = []
        heapq.heappush(self.q, (0, EMPTY))

    def add_letter(self, letter):
        found = False
        temp = []
        for priority, ltr in self.q:
            if ltr == letter:
                found = True
                # -1 because it removes min priority first
                heapq.heappush(temp, (priority - 1, letter))
            else:
                heapq.heappush(temp, (priority, ltr))
        if not found:
            heapq.heappush(temp, (-1, letter))
        self.q = temp

    def get_letter(self):
        # get the first thing from the queue (min value!)
        # remember this also removes it!
        priority, letter = heapq.heappop(self.q)

        if letter == EMPTY and self.q:
            # reset EMPTY priority and go for the next item
            priority, letter = heapq.heappop(self.q)
            heapq.heappush(self.q, (priority, letter))
            heapq.heappush(self.q, (0, EMPTY))
            return letter
        heapq.heappush(self.q, (priority, letter))
        return letter

    # for debugging purposes
    def __str__(self):
        ret = ""
        for item in sorted(self.q):
            pr, l = item
            ret += "(" + str(pr) + ", " + l + ");"
        return ret


class Board():
    SIZE = 15

    def __init__(self):
        self.board = [[LetterState() for _ in range(self.SIZE)] for _ in range(self.SIZE)]

    def __str__(self):
        ret = ""
        for row in range(self.SIZE):
            row_str = "|"
            for col in range(self.SIZE):
                letter = self.board[row][col].get_letter()
                if letter == EMPTY:
                    letter = ' '
                row_str += letter + "|"
            ret += row_str + "\n"
        return ret
        

    def add_tile(self, y, x, letter):
        if x > self.SIZE or y > self.SIZE:
            raise Exception(f'({x}, {y}) out of range')

        self.board[x][y].add_letter(letter)

    def get_rep(self):
        rep = [['' for _ in range(self.SIZE)] for _ in range(self.SIZE)]

        for row in range(self.SIZE):
            for col in range(self.SIZE):
                rep[row][col] = self.board[row][col].get_letter()

        return rep