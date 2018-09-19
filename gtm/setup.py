from setuptools import setup
from codecs import open
from os import path
from gtm import __version__

cwd = path.abspath(path.dirname(__file__))

# Get the long description from the README file
with open(path.join(cwd, 'README.md'), encoding='utf-8') as f:
    long_description = f.read()

# get the dependencies
with open(path.join(cwd, 'requirements.txt'), encoding='utf-8') as f:
    install_requires = f.read().split('\n')

setup(
    name='gtm',
    version=__version__,

    description='CLI for Gigantum Client Development',
    long_description=long_description,

    install_requires=install_requires,

    author='Gigantum/FlashX, LLC',
    author_email='support@gigantum.com',

    entry_points={
        'console_scripts': ['gtm=gtm.gtmcli:main'],
    },
    packages=['gtm'],
    include_package_data=True,

    url='https://github.com/gigantum/gigantum-client',
    license='MIT',
    classifiers=[
        'Development Status :: 4 - Beta',
        'Programming Language :: Python :: 3.6',
        'Programming Language :: Python :: 3.5'
    ],
    keywords=[
        'data-science',
        'science',
        'gigantum',
        'open-science'
    ]
)
