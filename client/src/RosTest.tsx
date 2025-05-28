function RosTest() {
  let trajectoryClient:any;
  let poseModeClient;
  let navigationModeClient;
  let positionClient;
  let jointState:any;
  let arucoMarkerArray;

  let ros = new ROSLIB.Ros({
    url: 'wss://hellorobotuw.live'
  });
  
  ros.on('connection', function() {
    console.log('Connected to websocket server.');
    createTrajectoryClient();
    createPositionModeClient();
    createNavigationModeClient();
    createPositionClient();
    subscribeToJointStates();
    subscribeToArucoMarkerArray();
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
  
  const createNavigationModeClient = () => {
    navigationModeClient = new ROSLIB.Service({
      ros: ros,
      name : '/switch_to_navigation_mode',
      serviceType : 'std_srvs/srv/Trigger'
    })
  };
  const createPositionModeClient = () => {
    poseModeClient = new ROSLIB.Service({
      ros: ros,
      name : '/switch_to_position_mode',
      serviceType : 'std_srvs/srv/Trigger'
    })
  };
  
  const createPositionClient = () => {
    positionClient = new ROSLIB.Service({
      ros: ros,
      name : '/get_joint_states',
      serviceType : 'std_srvs/srv/Trigger'
    })
  };

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

  const testThing = () => {
    executeFollowJointTrajectory(['joint_head_pan'], [Math.PI/2]);
  }

  return (
    <button onClick={testThing}>ROS TEST BUTTON</button>
  )
}

export default RosTest