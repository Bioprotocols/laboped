"""
Frontend
"""
from . import frontend
from .config import Config

def launch(web_dir, address = "127.0.0.1", port = 3000):
    """
    Launch the given web directory as a flask server
    """
    config = Config(web_dir, address, port)
    frontend.launch_server(config)
