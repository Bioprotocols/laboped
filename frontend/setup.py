"""
setup
"""
from distutils.core import setup

from pathlib import Path
long_description = Path(__file__).parent.joinpath("README.md").read_text(encoding="utf-8")

setup(
    name='pamled_frontend',
    version='0.1dev',
    packages=['pamled_frontend',],
    long_description = long_description,
    long_description_content_type='text/markdown',
    install_requires=[
        'eventlet',
        'flask',
        'python-socketio'
    ],
)
