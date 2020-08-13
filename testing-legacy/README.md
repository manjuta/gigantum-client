# Gigantum Testing

Automation of Gigantum testing with Selenium.


## Installation

First, create and activate a Python Virtual Environment for this project.

```bash
$ cd testing
$ python3 -m venv test-env
$ source test-env/bin/activate
$ pip3 install -r requirements.txt
```

Second, install the binary browser drivers, so that you can programmatically
interact with different browsers.

```bash
MacOS

# Web driver for Chrome/Chromium
$ brew install chromedriver

# Web driver for Firefox
$ brew install geckodriver
```

To install the binary browser drivers on other operating systems, please refer to the 
[Selenium Python](https://selenium-python.readthedocs.io/installation.html) documentation.

## Usage

#### Starting the Gigantum Client under test

Before running the test harness, ensure the Gigantum Client is installed and running

```
# Ensure you are in the root of the gigantum-client repository.

$ gtm client build
$ gtm client start
# ...
$ gtm client stop
```

#### Running the test harness

To run ALL tests, using the regular incognito Chrome driver:

```
# Make sure you are in the testing directory.
$ cd testing

# Put a valid username and password into the untracked credentials.txt
$ echo -e "my_username\nmy_password" > credentials.txt

# Now, run the driver!
$ python3 driver.py
```

To run ALL tests, using the headless incognito Chrome driver:

```
$ python3 driver.py --headless
```

To run ALL tests, using the Firefox driver:

```
$ python3 driver.py --firefox
```

To run SPECIFIED tests with any of the drivers:

```
$ python3 driver.py test_all_base_images
$ python3 driver.py test_all_base_images --headless
$ python3 driver.py test_all_base_images --firefox
```

## Organization

The file `driver.py` contains the main script to prepare, execute, and clean up the test runs.

The directory `gigantum_tests` contains Python files containing individual tests.
Tests methods must be prefaced by `test_`, and should incorporate the `assert` method.

The directory `testutils` contains Python files that aid in running the test harness. The files `driverutil.py` and 
`testutils.py` include methods that set up a test run and report results. The file `actions.py` contains methods that 
log in and prepare a new project with a specified base image. The file `cleanup.py` contains methods that clean up test 
run remnants, such as project containers and images. One of the most important files in this directory is `elements.py`.
This file contains the CSS elements that are separated into classes based on their function in the 
Gigantum Client. The idea is that during a test you want to find an element and then perform some type of action, such 
as wait for the element to appear, click the element, or wait for an element to disappear. These actions are chained 
together to perform a behavior and then the `assert` method is used to check that the behavior occurred successfully.
