"""
frontend config
"""

class Config():
    """
    config details for launching the web server
    """
    def __init__(self, web_dir, address = "127.0.0.1", port = 3000):
        self.web_dir = web_dir
        self.address = address
        self.port = port
