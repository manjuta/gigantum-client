from setuptools import setup

setup(name='gtmconfhttpproxy',
      version='0.0.0',
      description='Python interface for jupyter/configurable-http-proxy',
      url='http://github.com/gigantum/gtmconfhttpproxy',
      author='Bill',
      author_email='hello@gigantum.io',
      license='MIT',
      packages=['gtmconfhttpproxy'],
      install_requires=[
          'pytest',
          'requests'
      ],
      zip_safe=False)
