#!/usr/bin/env python3
"""
Run frontend
"""

import os
import eventlet
import flask
import socketio

eventlet.monkey_patch()


def launch_server(config):
    """
    Launches the web server. Does not return.
    """
    print('Setting up web server')
    app, _sio = _prepare_web_server(config)
    address = config.address
    port = config.port
    print(f'Starting web server on http://{address}:{port}')
    eventlet.wsgi.server(eventlet.listen((address, port)), app)


def _prepare_web_server(config):
    """
    Sets up the web server
    """
    web_dirname = os.path.abspath(config.web_dir)

    # Configure the HTTP server.
    print('Serving web UI from:')
    print(f'  {web_dirname}')

    app = flask.Flask(__name__,
                      static_url_path='/',
                      static_folder=web_dirname)
    _setup_routes(app, config)

    # Create a Socket.IO server and wrap it with a WSGI application as
    # middleware around the flask app.
    sio = socketio.Server()

    # Wrap the flask app, see:
    # https://flask.palletsprojects.com/en/1.1.x/quickstart/#hooking-in-wsgi-middleware
    wsgi_app = socketio.WSGIApp(sio, app.wsgi_app)
    return wsgi_app, sio


def _setup_routes(app, _config):
    """
    add any desired routes
    """
    @app.route('/<string:_path>')
    @app.route('/<path:_path>')
    def catch_all(_path):
        return app.send_static_file('index.html')
