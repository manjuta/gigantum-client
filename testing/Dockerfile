FROM selenium/node-chrome:3.5.3-boron
LABEL authors=SeleniumHQ

USER root

COPY . /opt/testing
WORKDIR /opt/testing

RUN apt-get update \
&& apt-get install python3
RUN apt-get install python3-venv
RUN rm -rf test-env
RUN python3 -m -y venv test-env
RUN /bin/bash -c "source test-env/bin/activate && pip3 install -r requirements.txt"

CMD /bin/bash -c "source test-env/bin/activate && python3 driver.py --headless test_examples"
#RUN pip3 install -r requirements.txt

