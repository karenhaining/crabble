from game_state import board
from game_state import hand

b = board.Board()

b.add_tile('a', 0, 0)
print(b)

h = hand.Hand()
h.add_tile('b')
h.add_tile('c')
h.add_tile('d')
h.add_tile('b')
h.add_tile('b')
h.add_tile('b')
h.add_tile('b')
print(h)
h.remove_tile('b')
h.remove_tile('b')


print(h)