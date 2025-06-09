"""
Representation of the Scrabble board.
A SIZE by SIZE matrix (15 x 15).
The origin coordinates (0,0) are in the top left corner of the board.
"""
EMPTY = ''

class Board():
    SIZE = 15

    def __init__(self):
        self.board = [[EMPTY for _ in range(self.SIZE)] for _ in range(self.SIZE)]

    def __str__(self):
        ret = ""
        for row in range(self.SIZE):
            row_str = "|"
            for col in range(self.SIZE):
                letter = self.board[row][col]
                if letter == EMPTY:
                    letter = ' '
                row_str += letter + "|"
            ret += row_str + "\n"
        return ret
        

    def add_tile(self, y, x, letter):
        if x > self.SIZE or y > self.SIZE:
            raise Exception(f'({x}, {y}) out of range')

        self.board[x][y] = letter

    def get_rep(self):
        rep = [['' for _ in range(self.SIZE)] for _ in range(self.SIZE)]

        for row in range(self.SIZE):
            for col in range(self.SIZE):
                rep[row][col] = self.board[row][col]

        return rep