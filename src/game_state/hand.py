"""
Representation of a Scrabble hand.
An array of length SIZE.
"""

class Hand():
    SIZE = 7

    def __init__(self):
        self.hand = [''] * self.SIZE

    def __str__(self):
        str = '['
        str += self.hand[0]
        for i in range(1, self.SIZE):
            str += ', ' + self.hand[i]
        str += ']'
        return str

    def remove_tile(self, letter):
        for i in range(self.SIZE):
            if self.hand[i] == letter:
                self.hand[i] = ''
                return
            
        raise Exception(f'{letter} not in hand')
    
    def add_tile(self, letter):
        for i in range(self.SIZE):
            if self.hand[i] == '':
                self.hand[i] = letter
                return
            

        raise Exception("Hand is full")        

