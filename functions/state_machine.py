

# A REPL would be useful for quickly getting the expected speech output
# as well as the current state.
def REPL():
    print("Welcome to Tina's REPL! Type 'quit' to exit")
    s = input('>>> ')
    my_environment = Environment()
    while s != 'quit':
        try:
            result = evaluate(parse(tokenize(s)), my_environment)
            print(result)
        except:
            ex_type, ex, tb = sys.exc_info()
            print("Unexpected error:", ex_type, ex)
            traceback.print_tb(tb)
        s = input('>>> ')

# Define the set of states?
# How do you transition from state to state?

# Map each state to the condition for transitioning and its neighbors.
# On a high level, the state can correspond to what ScratchCat is doing.

# In trying to define these states, I realize that the state is sort of
# hierachical. This hierarchy may be embodied through the state transitions, but
# I this will just result in a map that is larger than it needs to be. (OH WELL)
stateMap = {
	# executecommand and requestteaching are just parts of the respond to command state...
	'respondToCommand': {'executeCommand':'if you can, say OK and execute command', 'requestTeaching': '}
	'start':
}




if __name__ == '__main__':
    REPL()