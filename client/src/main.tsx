import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

let trajectoryClient: any;
let jointState: any;
let arucoMarkerArray: any;

// calibration data topics and services
let alignmentMathClient: any;
let boardCalibTopic: any;
let holderCalibTopic: any
let boardOffsetTopic: any;
let holderOffsetTopic: any;

const ros: any = new ROSLIB.Ros({
  url: 'wss://hellorobotuw.live'
});

ros.on('connection', function() {
  console.log('Connected to websocket server.');
  createTrajectoryClient();
  subscribeToJointStates();
  subscribeToArucoMarkerArray();
  createAlignmentMathClient();
  createCalibrationPublishers();
  subscribeToCameraVideo();
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
     if (cameraImage != null) {
        //console.log('meow')
        cameraImage.src = "data:image/jpg;base64," + message.data;
     }
  });
};
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
   const ROWLENGTH = 0.0190;
   const HOLDERWIDTH = 0.057
   const ROWONE = 0.427;
   const TABLETOP = 0.76313;
   const NEUTRAL_ELEV = 0.81;
   const HOLDERTOP = 0.75158;
   const COLUMNLENGTH = 0.023;
   const GRIPPER_OPEN = 0.050;
   const GRIPPER_PLACED = 0.040;
   const GRIPPER_HOLDING = 0.020;
   const OFFSET_FOR_BOARD_CENTERING = 1; // TODO: Measure and change this value
   const ROTATION_OFFSET = 0;//0.075;
   const PARK_DISTANCE = 1.02;
   const EPSILON = 0.001;

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
      executeFollowJointTrajectory(['wrist_extension'], [currPos + ROWLENGTH/1]);
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

  const MoveToHolderTarget = (target: number) => {
   let drive_target = (HOLDERWIDTH * (1 - target)) - holder_offsets;
       offsets_from_center += drive_target
   holder_offsets += drive_target
   publishBoardOffsetDelta(drive_target);
   publishHolderOffsetDelta(drive_target);
   executeFollowJointTrajectory(['wrist_extension', 'translate_mobile_base'], [holder_arm, drive_target]);
 }

  const dropTile = () => {
   let goal = new ROSLIB.ActionGoal({
     trajectory: {
       header: { stamp: { secs: 0, nsecs: 0 } },
       joint_names: ['gripper_aperture', 'joint_lift'],
       points: [
       {
           positions: [GRIPPER_HOLDING , NEUTRAL_ELEV],
           time_from_start: { secs: 1, nsecs: 0 },
         },
         {
           positions: [GRIPPER_HOLDING, TABLETOP + 0.015],
           time_from_start: { secs: 4, nsecs: 0 },
         },
         {
           positions: [GRIPPER_PLACED, TABLETOP + 0.015],
           time_from_start: { secs: 7, nsecs: 0 },
         },
         {
           positions: [GRIPPER_PLACED, NEUTRAL_ELEV],
           time_from_start: { secs: 9, nsecs: 0 },
         },
       ],
     },
   });
   trajectoryClient.createClient(goal);
 };



  const pickupTile = () => {
   let goal = new ROSLIB.ActionGoal({
     trajectory: {
       header: { stamp: { secs: 0, nsecs: 0 } },
       joint_names: ['gripper_aperture', 'joint_lift'],
       points: [
       {
           positions: [GRIPPER_OPEN, NEUTRAL_ELEV],
           time_from_start: { secs: 1, nsecs: 0 },
         },
         {
           positions: [GRIPPER_OPEN, HOLDERTOP],
           time_from_start: { secs: 4, nsecs: 0 },
         },
         {
           positions: [GRIPPER_HOLDING,HOLDERTOP
           ],
           time_from_start: { secs: 7, nsecs: 0 },
         },
         {
           positions: [GRIPPER_HOLDING,NEUTRAL_ELEV
           ],
           time_from_start: { secs: 10, nsecs: 0 },
         },
       ],
     },
   });
   trajectoryClient.createClient(goal);
 };

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
      extend_target = extend_target - 0.60
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

   const cameraDiv = 
   <div
    style={{transform:'rotate(90deg)', paddingRight:'80px'}}
    id="camera">
      <img style={{width: '1200px', height: '1200px', objectFit: 'cover'}} id="cameraImage" />
    </div>

createRoot(document.getElementById('root')!).render(
  <StrictMode>
   <div style={{display: 'flex'}}>
   {cameraDiv}
    <App
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
      pickupTile={pickupTile}
      dropTile={dropTile}
      MoveToHolderTarget={MoveToHolderTarget}
      />
   </div>
  </StrictMode>
  ,
)
