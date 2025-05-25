"""
Representation of the Scrabble board.
A SIZE by SIZE matrix (15 x 15).
The origin coordinates (0,0) are in the top left corner of the board.
"""

EMPTY = ' '

# TODO maybe need a square class to maintain state of:
#   overwritten letter
#   voting on letter value if the model outputs different ones


class Board():
    SIZE = 15

    def __init__(self):
        self.board = [ [EMPTY] * self.SIZE for _ in range(self.SIZE)]

    def __str__(self):
        res = ''
        for i in range(self.SIZE):
            row = "|".join(map(str, self.board[i]))
            res += row
            if i < self.SIZE - 1:
                res += "\n"
        return res


    def add_tile(self, y, x, letter):
        if x > self.SIZE or y > self.SIZE:
            raise Exception(f'({x}, {y}) out of range')

        if self.board[x][y] != EMPTY:
            raise Exception(f'{self.board[x][y]} already exists in position ({x}, {y})')

        self.board[x][y] = letter
