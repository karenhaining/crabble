# crabble

Crabble enables those with mobility limitations to participate in the social board game Scrabble using the Stretch 3 Mobile Manipulator.

This is a capstone project at the University of Washington. Check out more details on our [website](https://sites.google.com/uw.edu/crab-robotics/home?authuser=0)!


## Dev Notes

### Front End

To start the server and web UI locally, run the following commands (make sure to do so from the `client` directory):

Web UI:
```
npm install
npm run dev
```

Server:

```
npm run start-api
```

### Robot

First, connect to the Stretch using SSH. Then, run the following commands (each one needs a new terminal!):

```
ros2 launch stretch_core stretch_driver.launch.py
ros2 launch stretch_core d435i_high_resolution.launch.py
ros2 launch rosbridge_server rosbridge_websocket_launch.xml
ros2 launch stretch_core stretch_aruco.launch.py
```

## Acknowledgements

Many thanks to the CSE481C staff for all their help, as well as our user Dylan for his feedback!

Portions of the image processing software are taken directly from an existing [scrabble open-cv project](https://github.com/jheidel/scrabble-opencv), which is under the MIT license.
