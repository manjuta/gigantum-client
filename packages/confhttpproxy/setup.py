from setuptools import setup

setup(name='confhttpproxy',
      version='0.0.0',
      description='Python interface for jupyter/configurable-http-proxy',
      author='Bill Van Besien',
      author_email='support@gigantum.io',
      license='MIT',
      packages=['confhttpproxy'],
      install_requires=['requests'],
      tests_require=['pytest'],
      zip_safe=False)
