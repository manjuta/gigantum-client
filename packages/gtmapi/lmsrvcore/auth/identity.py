# Copyright (c) 2017 FlashX, LLC
#
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in all
# copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THEt
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
# SOFTWARE.
from flask import current_app
from lmcommon.auth.identity import AuthenticationError


def get_identity_manager_instance():
    """Method to retrieve the id manager from the flask application"""
    if "LABMGR_ID_MGR" not in current_app.config:
        raise AuthenticationError("Application mis-configured. Missing identity manager instance.", 401)

    return current_app.config["LABMGR_ID_MGR"]


def parse_token(auth_header: str) -> str:
    """Method to extract the bearer token from the authorization header

    Args:
        auth_header(str): The Authorization header

    Returns:
        str
    """
    if "Bearer" in auth_header:
        _, token = auth_header.split("Bearer ")
        if not token:
            raise AuthenticationError("Could not parse JWT from Authorization Header. Should be `Bearer XXX`", 401)
    else:
        raise AuthenticationError("Could not parse JWT from Authorization Header. Should be `Bearer XXX`", 401)

    return token
