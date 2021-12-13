"""
setup
"""
from distutils.core import setup

from pathlib import Path
long_description = Path(__file__).parent.joinpath("README.md").read_text(encoding="utf-8")

setup(
    name='pamled_backend',
    version='0.1dev',
    packages=['pamled',],
    long_description = long_description,
    long_description_content_type='text/markdown',
    install_requires=[
        'django==3.2.9',
        'django-cors-headers',
        'djangorestframework',
        'jsonfield',
        'python-decouple',
        'paml @ git+https://github.com/SD2E/paml.git@347788ece9daacc2c3ea180c56159e97113638e1#egg=paml',
    ],
)