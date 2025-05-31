import rclpy
from rclpy.node import Node

from std_srvs.srv import Trigger
from sensor_msgs import CompressedImage
from std_msgs.msg import String


class VisionNode(Node):

  def __init__(self):
    super().__init__('vision node')

    # Service for board state requests 
    self.srv = self.create_service(Trigger, 'get_board_state', self.get_board_state_callback)

    # Topic publishers for board state and unwarped camera view
    self.unwarped_board_view_publisher = self.create_publisher(CompressedImage, 'unwarped_board_view', 10)
    self.board_state_publisher = self.create_publisher(String, 'board_state', 10)
    timer_period = 1 # second, for publishing
    self.timer = self.create_timer(timer_period, self.timer_callback)

    # Subscriber for the camera feed
    self.cameraSub = self.create_subscription(CompressedImage, '/camera/color/image_raw/compressed', self.sub_to_compressed_image_callback, 10)

    # other state
    self.board_state = ""
    self.compressed_camera  = None
    self.unwarped_board = None


  def get_board_state_callback(self, request, response):
    self.get_logger().info('Incoming board state request')
    response.success = True
    # TODO: Fetch new board state and put in self.board_state
    response.message = self.board_state
    self.get_logger().info(f"RESPONSE: {response}")
    return response

  def sub_to_compressed_image_callback(self, message):
    # TODO: anything else to do directly when receiving a new image?
    self.compressed_camera = message.data

    # TODO: Remove this
    self.unwarped_board = message.data

    return message
  
  def timer_callback(self):
    # TODO: Fetch new unwarped board image and put in self.unwarped_board
    unwarped_board_msg = CompressedImage()
    unwarped_board_msg.data = self.unwarped_board
    self.unwarped_board_view_publisher.publish(unwarped_board_msg)

    # TODO: Process letters and put formatted string in self.board_state
    board_state_msg = String()
    board_state_msg.data = self.board_state
    self.board_state_publisher.publish(board_state_msg)

def main():
  rclpy.init()

  vision_node = VisionNode()

  rclpy.spin(vision_node)

  rclpy.shutdown()


if __name__ == '__main__':
  main()
