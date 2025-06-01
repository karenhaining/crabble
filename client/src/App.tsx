import { useState } from 'react'
import './App.css'
import Board from './board'
import Settings from './Settings';
import Moves from './Moves';
import Menu from './Menu';
import Config from './Config'
// import { spawn } from 'node:child_process'

function App() {

   let trajectoryClient: any;
   let jointState: any;
   let arucoMarkerArray: any;

   // calibration data topics and services
   let alignmentMathClient: any;
   let boardCalibTopic: any;
   let holderCalibTopic: any
   let boardOffsetTopic: any;
   let holderOffsetTopic: any;

   // vision topics and services
   let visionNodeClient: any;
   let boardState: any;
   let unwarpedBoardView: any;
   let unwarpedHandView: any;
   // am afraid, trembling even, quaking in my shoes
   
   // global state variables
   let calibration: string = "";

   let poses: any = {};
   let offsets_from_center: any = 0;
   let first_row: any = 0;
   let accumulated_rotation: any = 0;
   let tabletop_offset: any = 0;
   let holder_offsets: any = 0;
   let holder_arm: any = 0;

   const JOINTNAMES = ["wrist_extension", "joint_lift", "joint_head_pan", "joint_head_tilt",
                     "joint_wrist_yaw", "joint_wrist_pitch", "joint_wrist_roll", "gripper_aperture"]
   const ROWLENGTH = 0.0195;
   const HOLDERWIDTH = 0.062
   const ROWONE = 0.427;
   const TABLETOP = 0.777;
   const COLUMNLENGTH = 0.023;
   const GRIPPER_HOLDING = 0.033;
   const OFFSET_FOR_BOARD_CENTERING = 1; // TODO: Measure and change this value
   const ARM_OFFSET = 0.60;
   const ROTATION_OFFSET = 0;//0.075;
   const PARK_DISTANCE = 0.90;
   const EPSILON = 0.001;

   let ros = new ROSLIB.Ros({
      url: 'wss://hellorobotuw.live'
   });
   
    // Create subscription to the camera video topic
   const subscribeToCameraVideo = () => {
      let cameraImage = document.getElementById("cameraImage");
      let topic = new ROSLIB.Topic({
         ros: ros,
         name: "/camera/color/image_raw/compressed",
         messageType: "sensor_msgs/CompressedImage",
      });
      topic.subscribe((message) => {
         cameraImage.src = "data:image/jpg;base64," + message.data;
      });
   };
  
   ros.on('connection', function() {
      console.log('Connected to websocket server.');
      createTrajectoryClient();
      subscribeToJointStates();
      subscribeToArucoMarkerArray();
      createAlignmentMathClient();
      createCalibrationPublishers();
      subscribeToCameraVideo();
   });
  
   const subscribeToJointStates = () => {
      const jointStateTopic = new ROSLIB.Topic({
               ros: ros,
               name: "/stretch/joint_states",
               messageType: "sensor_msgs/msg/JointState",
      });
   
      jointStateTopic.subscribe((message: any) => {
         jointState = message;
      });
   };
  
   const subscribeToArucoMarkerArray = () => {
      const ArucoMarkerArrayTopic = new ROSLIB.Topic({
               ros: ros,
               name: "/aruco/marker_array",
               messageType: "visualization_msgs/msg/MarkerArray",
      });
   
      ArucoMarkerArrayTopic.subscribe((message: any) => {
         arucoMarkerArray = message;
      });
   };
   
   // Create a handle to the FollowJointTrajectory action
   const createTrajectoryClient = () => {
      trajectoryClient = new ROSLIB.ActionHandle({
         ros: ros,
         name: "/stretch_controller/follow_joint_trajectory",
         actionType: "control_msgs/action/FollowJointTrajectory",
      });
   };

   const createAlignmentMathClient = () => {
      alignmentMathClient = new ROSLIB.Service({
        ros: ros,
        name : '/get_calibration_data',
        serviceType : 'std_srvs/srv/Trigger'
      })
    }
  
   const createCalibrationPublishers = () => {
      boardCalibTopic = new ROSLIB.Topic({
         ros: ros,
         name: "/board_calibration_data",
         messageType: "std_msgs/msg/Float64"
      });

      holderCalibTopic = new ROSLIB.Topic({
         ros: ros,
         name: "/holder_calibration_data",
         messageType: "std_msgs/msg/Float64"
      });

      boardOffsetTopic = new ROSLIB.Topic({
         ros: ros,
         name: "/board_offset_changes",
         messageType: "std_msgs/msg/Float64"
      });

      holderOffsetTopic = new ROSLIB.Topic({
         ros: ros,
         name: "/holder_offset_changes",
         messageType: "std_msgs/msg/Float64"
      });
   }

   const executeFollowJointTrajectory = (jointNames:any, jointPositions:any, jointVelocities?:any) => {
      let goal;
      if (jointVelocities == undefined) {
         goal = new ROSLIB.ActionGoal({
         trajectory: {
         header: { stamp: { secs: 0, nsecs: 0 } },
         joint_names: jointNames,
         points: [
            {
               positions: jointPositions,
               time_from_start: { secs: 1, nsecs: 0 },
            },
         ],
         },
      });
      }
      else {
         goal = new ROSLIB.ActionGoal({
         trajectory: {
         header: { stamp: { secs: 0, nsecs: 0 } },
         joint_names: jointNames,
         points: [
            {
               positions: jointPositions,
               velocities: jointVelocities,
               time_from_start: { secs: 1, nsecs: 0 },
            },
         ],
         },
      });
      }
      if (trajectoryClient != undefined) {
         trajectoryClient.createClient(goal);
      } else {
         console.log('trajectory client is undefined!');
      }
   };

   // Calibration wrapper functions
   const getCalibrationData = () => {
      let request = new ROSLIB.ServiceRequest({});
      alignmentMathClient.callService(request, (response: any) => {calibration = response});
      console.log(calibration);
      return calibration;
   }
  
   const publishBoardCalibration = (value: number) => {
      let msg = new ROSLIB.Message({
        data: value
      });
      boardCalibTopic.publish(msg);
   }
  
   const publishHolderCalibration = (value: number) => {
      let msg = new ROSLIB.Message({
        data: value
      });
      holderCalibTopic.publish(msg);
   }
  
   const publishBoardOffsetDelta = (delta: number) => {
      let msg = new ROSLIB.Message({
        data: delta
      });
      boardOffsetTopic.publish(msg);
   }
  
   const publishHolderOffsetDelta = (delta: number) => {
      let msg = new ROSLIB.Message({
        data: delta
      });
      holderOffsetTopic.publish(msg);
   }

   // vision node wrapper function
   const getBoardState = () => {
      let request = new ROSLIB.ServiceRequest({})
      visionNodeClient.callService(request, (response: any) => {boardState = response});
      console.log(boardState);
      return boardState;
   }

   // FUNCTIONS THAT MOVE THE ROBOT
   const moveBaseForward = () => {
      offsets_from_center += COLUMNLENGTH/4
          holder_offsets += COLUMNLENGTH/4
  
      executeFollowJointTrajectory(['translate_mobile_base'], [COLUMNLENGTH/4]);
   };

   const moveBaseBackward = () => {
      offsets_from_center -= COLUMNLENGTH/4
          holder_offsets -= COLUMNLENGTH/4
  
      executeFollowJointTrajectory(['translate_mobile_base'], [-COLUMNLENGTH/4]);
   };

   const moveArmForward = () => {
      let currPos = jointState['position'][0]
      executeFollowJointTrajectory(['wrist_extension'], [currPos + ROWLENGTH/4]);
    };

   const moveArmBackward = () => {
      let currPos = jointState['position'][0]
      executeFollowJointTrajectory(['wrist_extension'], [currPos - ROWLENGTH/4]);
   };

   const RotateClockwise = () => {
      accumulated_rotation += -0.05
      executeFollowJointTrajectory(['rotate_mobile_base'], [-0.05])
   };
  
   const RotateCounterClockwise = () => {
      accumulated_rotation += 0.05
      executeFollowJointTrajectory(['rotate_mobile_base'], [0.05])
   };

   const rotateHeadDown = () => {
      executeFollowJointTrajectory(['joint_head_tilt'], [-0.55]);
   };

   const rotateHeadRelativeCounterclockwise = () => {
    let currPos = jointState['position'][6]
    executeFollowJointTrajectory(['joint_head_pan'], [currPos + 0.1])
  }

  const rotateHeadRelativeClockwise = () => {
    let currPos = jointState['position'][6]
    executeFollowJointTrajectory(['joint_head_pan'], [currPos - 0.1])
  }

  const SetHandToBase = () => {
   executeFollowJointTrajectory(['joint_wrist_pitch', 'joint_wrist_roll', 'joint_wrist_yaw'], [0.0, 0.0, 0.0]);
  }

   // AUTONOMOUS ROUTINES

   const alignToArucoMarker = (marker_ids: any) => {
      let RoTaTioNGoaL; // In Radians
      if (arucoMarkerArray == undefined) {
         console.log('No aruco markers');
         return
      }
      let marker_indices = [];
      for (let i = 0; i < arucoMarkerArray['markers'].length; i += 1) {
         for (let j = 0; j < marker_ids.length; j+= 1) {
            if (marker_ids[j] == arucoMarkerArray['markers'][i]['id']) {
            console.log("Found marker at index " + i);
            marker_indices.push(i);
            }
         }
      }
      if (marker_indices.length == 0) {
         console.log('Could not find any markers');
         return;
      }
      let quaternions = [];
      for (let i = 0; i < marker_indices.length; i+= 1) {
         quaternions.push(arucoMarkerArray['markers'][marker_indices[i]]['pose']['orientation']);
      }
      console.log("Quaternions are ")
      console.log(quaternions)

      let head_angle = jointState['position'][6]; // Assume this is radians

      let yaw = 0;
      for (let i = 0; i < quaternions.length; i += 1) {
         let quaternion = quaternions[i];
         yaw += Math.atan2(2 * (quaternion['w'] * quaternion['z'] + quaternion['x'] * quaternion['y']), 1 - 2 * (quaternion['y']*quaternion['y'] + quaternion['z']*quaternion['z']))
      }
      yaw = yaw / quaternions.length
      //yaw = yaw + Math.PI / 2;
      if (yaw > Math.PI * 2) {
         console.log("Big pie");
         yaw = yaw - 2 * Math.PI
      }
      RoTaTioNGoaL = head_angle - yaw;
      RoTaTioNGoaL = RoTaTioNGoaL - ROTATION_OFFSET
      //RoTaTioNGoaL = head_angle - yaw + (Math.PI/2);
      console.log('yaw is ' + yaw);
      console.log('Rotation Goal is' + RoTaTioNGoaL);
      executeFollowJointTrajectory(['rotate_mobile_base', 'joint_head_pan'], [RoTaTioNGoaL, -Math.PI / 2]);
   }

   const parallelPark = (marker_id: any) => {
      let currPos = jointState['position'];
      if (arucoMarkerArray == undefined) {
         console.log('No aruco markers');
         return
      }
      let marker_index;
      for (let i = 0; i < arucoMarkerArray['markers'].length; i += 1) {
         if (arucoMarkerArray['markers'][i]['id'] == marker_id) {
            console.log("Found marker at index " + i);
            marker_index = i;
            break;
         }
      }
      if (marker_index == undefined) {
         console.log('Could not find aruco marker with id ' + marker_id);
         return;
      }

      let markerPosition = arucoMarkerArray['markers'][marker_index]['pose']['position'];

      let driveDistance = markerPosition['z'] - PARK_DISTANCE;

      executeFollowJointTrajectory(['rotate_mobile_base'], [-Math.PI/2], [0.15]);

      sleep(15000);

      executeFollowJointTrajectory(['translate_mobile_base'], [driveDistance]);

      sleep(10000);

      executeFollowJointTrajectory(['rotate_mobile_base'], [Math.PI/2], [0.15]);
   }

   const reachToFurthestRow = (marker_ids: any) => {  
      if (arucoMarkerArray == undefined) {
        console.log('No aruco markers');
        return
      }
      let marker_indices = [];
      for (let i = 0; i < arucoMarkerArray['markers'].length; i += 1) {
        for (let j = 0; j < marker_ids.length; j+= 1) {
          if (marker_ids[j] == arucoMarkerArray['markers'][i]['id']) {
            console.log("Found marker at index " + i);
            marker_indices.push(i);
          }
        }
      }
      if (marker_indices.length == 0) {
        console.log('Could not find any markers');
        return;
      }
  
      let markerPositionAvg = 0;
      for (let i = 0; i < marker_indices.length; i+= 1) {
        markerPositionAvg += arucoMarkerArray['markers'][marker_indices[i]]['pose']['position']['z'];
      }
  
      let extend_target = markerPositionAvg / marker_indices.length;
      extend_target = extend_target - ARM_OFFSET
      executeFollowJointTrajectory(['wrist_extension',], [extend_target]);
   }

   const driveToCenterOfBoard = (marker_ids_left: any, marker_ids_right: any) => {  
      if (arucoMarkerArray == undefined) {
        console.log('No aruco markers');
        return
      }
      let marker_indices_left = [];
      for (let i = 0; i < arucoMarkerArray['markers'].length; i += 1) {
        for (let j = 0; j < marker_ids_left.length; j+= 1) {
          if (marker_ids_left[j] == arucoMarkerArray['markers'][i]['id']) {
            console.log("Found marker at index " + i);
            marker_indices_left.push(i);
          }
        }
      }
  
      let marker_indices_right = [];
      for (let i = 0; i < arucoMarkerArray['markers'].length; i += 1) {
        for (let j = 0; j < marker_ids_right.length; j+= 1) {
          if (marker_ids_right[j] == arucoMarkerArray['markers'][i]['id']) {
            console.log("Found marker at index " + i);
            marker_indices_right.push(i);
          }
        }
      }
      if (marker_indices_left.length == 0 || marker_indices_right.length == 0) {
        console.log('Could not find any markers for one of left or right');
        return;
      }
  
      let markerPositionAvg_right = 0
      for (let i = 0; i < marker_indices_right.length; i+= 1) {
  
        markerPositionAvg_right += arucoMarkerArray['markers'][marker_indices_right[i]]['pose']['position']['y'];
  
      }
  
      let markerPositionAvg_left = 0
      for (let i = 0; i < marker_indices_left.length; i+= 1) {
  
        markerPositionAvg_left += arucoMarkerArray['markers'][marker_indices_left[i]]['pose']['position']['y'];
  
      }
  
      markerPositionAvg_right = markerPositionAvg_right / marker_indices_right.length
      markerPositionAvg_left = markerPositionAvg_left / marker_indices_left.length
      let horizontalOffset = (markerPositionAvg_left + markerPositionAvg_right) / 2
      //horizontalOffset = -horizontalOffset
      executeFollowJointTrajectory(['translate_mobile_base',], [horizontalOffset]);
   }

   // CALIBRATION
   const saveCalibration = () => {
      first_row = jointState['position'][0];
      offsets_from_center = 0;
      accumulated_rotation = 0;
      tabletop_offset = 0;
   }
  
   const saveHolderCalibration = () => {
      holder_arm = jointState['position'][0];
      holder_offsets = 0;
   }

   // UTILS
   function sleep(milliseconds: number) {
      var start = new Date().getTime();
      while (true) {
        if ((new Date().getTime() - start) > milliseconds){
          break;
        }
      }
   }

   // ARGUMENT-BEARING FUNCTIONS
   const alignToArucoMarkerArg = () => {
      alignToArucoMarker([0, 1, 2, 3]);
   }

   const parallelParkArg = () => {
      parallelPark(0);
   }

   const reachToFurthestRowArg = () => {
      reachToFurthestRow([0, 1])
   }

   const driveToCenterOfBoardArg = () => {
      driveToCenterOfBoard([0, 2], [1, 3]);
   }
   
   // const runScript = () => {
   //    const pythonProcess = spawn('python',["testPy.py"]);

   //    pythonProcess.stdout.on('data', (data: any) => {
   //       console.log(data);
   //    });
   // }

   // INTERFACE THINGS, FOR REAL THIS TIME
   const rawr = new Array(15).fill(null).map(() => new Array(15).fill(""));
   rawr[0][2] = 'C';
   rawr[1][2] = 'R';
   rawr[2][2] = 'A';
   rawr[3][2] = 'B';
   rawr[0][0] = 'M';
   rawr[0][1] = 'I';
   const [menu, setMenu] = useState('MENU');
   const [useCam, setUseCam] = useState(false);
   const [tiles, setTiles] = useState(rawr);
   const [hand, setHand] = useState(new Array(7).fill(null).map(() => ""));
   const [overrideBoard, setOverrideBoard] = useState(new Array(15).fill(null).map(() => new Array(15).fill("")));
   const [overrideHand, setOverrideHand] = useState(new Array(7).fill(null).map(() => ""));
   const [n, setN] = useState(9);
   const [showGridMarkers, setShowGridMarkers] = useState(true);
   const [row, setRow] = useState(0);
   const [col, setCol] = useState(0);
   const [selRow, setSelRow] = useState(-1);
   const [selCol, setSelCol] = useState(-1);
   const [selTile, setSelTile] = useState(-1);

   const boardMinus = () => {
      if (n > 3) {
         setRow(row + 1);
         setCol(col + 1);
         setN(n - 2);
      }
   }

   const boardPlus = () => {
      if (n < 15) {
         const newRow = Math.max(Math.min(15 - n - 2, row - 1), 0)
         const newCol = Math.max(Math.min(15 - n - 2, col - 1), 0)
         console.log(n, row, col, newRow, newCol)
         setRow(newRow);
         setCol(newCol);
         setN(n + 2);
      }
    }

   const onBackClick = () => {
   setMenu('MENU');
   }
      
   const onOverrideBoardClick = (letter: String) => {
      const newOverrideBoard = overrideBoard.map((row, i) =>
         i === selRow ? row.map((col, j) => (j === selCol ? letter.toUpperCase() : col)) : row
      );
      setOverrideBoard(newOverrideBoard);
   }

   const onOverrideHandClick = (letter: String) => {
      const newOverrideHand = overrideHand.map((val, i) =>
         i == selTile ? letter.toUpperCase() : val
      )
      setOverrideHand(newOverrideHand);
   }

   const onCamToggleClick = () => {
      setUseCam(!useCam);
      getBoard()
   }

   const boardPanel = () => {
      if (useCam) {
         return <div style={{transform:'rotate(90deg)', paddingRight:'80px'}} id="camera"><img style={{width: '1200px', height: '1200px', objectFit: 'contain'}} id="cameraImage" /></div>;
      } else {
         return (<div style={{paddingRight:'80px'}}>
         <Board
            tiles={tiles}
            overrideBoard={overrideBoard}
            overrideHand={overrideHand}
            hand={hand}
            n={n}
            showGridMarkers={showGridMarkers}
            row={row}
            setRow={setRow}
            col={col}
            setCol={setCol}
            selRow={selRow}
            setSelRow={setSelRow}
            selCol={selCol}
            setSelCol={setSelCol}
            selTile={selTile}
            setSelTile={setSelTile}
         ></Board>
      </div>);
      }
   }

   const menuPanel = () => {
      if (menu === 'MENU') {
         return <Menu onOptionClick={setMenu}></Menu>
      } else if (menu === 'SETTING') {
         return <Settings
            n={n}
            boardMinus={boardMinus}
            boardPlus={boardPlus}
            showGridMarkers={showGridMarkers}
            setShowGridMarkers={setShowGridMarkers}
            onBackClick={onBackClick}
            useCam={useCam}
            onCamToggleClick={onCamToggleClick}
         ></Settings>
      } else if (menu == 'CONFIG'){
         return <Config 
            onBackClick={onBackClick} 
            onBoardCalibClick={saveCalibration}
            onHolderCalibClick={saveHolderCalibration}
            onArmForwardClick={moveArmForward}
            onArmBackClick={moveArmBackward} 
            onBaseLeftClick={moveBaseForward}
            onBaseRightClick={moveBaseBackward}
            onBaseClockwiseClick={RotateClockwise}
            onBaseCounterClick={RotateCounterClockwise}
            onArucoAlignClick={alignToArucoMarkerArg} 
            onParallelParkClick={parallelParkArg} 
            onReachClick={reachToFurthestRowArg}
            onBoardCenterClick={driveToCenterOfBoardArg}
            onLookDownClick={rotateHeadDown}
            onHeadClockwiseClick={rotateHeadRelativeClockwise}
            onHeadCounterClick={rotateHeadRelativeCounterclockwise}
            onWristLevelClick={SetHandToBase}
         ></Config>
      } else {
         return <Moves onBackClick={onBackClick} onOverrideBoardClick={onOverrideBoardClick} onOverrideHandClick={onOverrideHandClick}></Moves>
      }
   }


   const getBoard = () => {
      fetch('http://localhost:5000/board').then(res => res.json()).then(doBoardResponse);
   }

   const doBoardResponse = (res: Response): void => {
    console.log(res)
   }


return (
   <div style={{display: 'flex'}}>
      <div>
         {boardPanel()}
      </div>
      <div>
         {menuPanel()}
      </div>
   </div>
)
}

export default App