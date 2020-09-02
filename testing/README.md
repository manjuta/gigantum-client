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

#### Setting up configuration 
  Move to "configuration" directory\
  Open configuration.yaml\
  Update below settings based on test
     
  `chrome_driver_version: ""`\
  `test_environment: dev`\
  `browsers: ["chrome", "firefox", "edge"]`\
  `incognito: True`
  
  If you need to test in a specific version of chrome, you can specify the driver version in `chrome_driver_version`. Setting this to an empty string `""` will use the latest driver version.  

#### Setting up user credentials
   Rename `credentials.json.template` to `credentials.json`\
   Open `credentials.json`\
   Update `"User1": {"user_name": "XXXXX","password": "XXXXXX"}` with test user credentials

#### Setting up page URL
   If you are testing application hosted other than `localhost`\
   Open `url_dev.yaml`\
   Update `LandingPage: http://localhost:10000/` to `LandingPage: http://{host name}:10000/`

#### Setting up test suite
   Open `pytest.ini`\
   Configure `markers` based on your test\
   Configure `report` file name

#### Pytest available configuration options

addopts - Add the specified options to the set of command line arguments as if they had been specified by the user.

##### Options
-s - Show Output, do not capture.\
-x - Stop after first failure.\
--maxfail=2 - stop after two failures.\
--maxfail=2 -rf - exit after 2 failures, report fail info.\
-rA - gives output of all tests, Below is the full list of characters available.More than one character can be used so in the below example failed and skipped tests can be seen after running following command. Eg: pytest -rfs\
f- failed\
E- error\
s- skipped\
x- xfailed\
X- xpassed\
p- passed\
P-passed with output\
a- all except pP\
A- all\
-v - Verbose.\
-q, --quiet - Less verbose.\
-l, --showlocals - Show local variables in tracebacks.\
-k "expression" - Only run tests that match expression (and fixtures).\
-m <mark name> - Only run tests that match mark name ( -m ‘mark1 or mark2 ..’ -run tests from different marks ).\
--tb=<traceback type> - to show pytest tracebacks\
long - the default informative traceback formatting\
short - a shorter traceback format\
line - even shorter\
native - python standard formatting\
no - no traceback output\
--ignore=<path> - ignore a particular path/directory.\
--durations=10 - List of the slowest 10 test durations.\
-n <num> - send tests to multiple CPU’s (parallel test run, need to install pytest-xdist plugin).\
--html=<path/filename.html> - to create html document ( need to install pytest-html plugin).\
--collect-only - collect information test suite/ dry run.\
--traceconfig - to find which plugins are active  in your environment.\
--instafail - show errors and failures instantly instead of waiting until the end of test suite ( need to install  pytest-instafail plugin ).  


## Now, run the root_run
$ python3 root_run.py
