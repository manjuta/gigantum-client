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
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
# SOFTWARE.
from flask import Flask
from flask import Blueprint
from flask_graphql import GraphQLView
import graphene

from lmsrvlabbook.api import LabbookQuery, LabbookMutations

from lmcommon.configuration import Configuration


# Load config data for the LabManager instance
config = Configuration()

# Create Blueprint
labbook_service = Blueprint('labbook_service', __name__)

# Add route
labbook_service.add_url_rule('/labbook/',
                             view_func=GraphQLView.as_view('graphql',
                                                           schema=graphene.Schema(query=LabbookQuery,
                                                                                  mutation=LabbookMutations),
                                                           graphiql=config.config["flask"]["DEBUG"]))

# If running blueprint script directly, spin a dev server
if __name__ == '__main__':

    # Load config data for the LabManager instance
    config = Configuration()

    # Create Flask app and configure
    app = Flask("lmsrvlabbook")
    app.config['DEBUG'] = config.config["flask"]["DEBUG"]

    # Register service
    app.register_blueprint(labbook_service)

    app.run()
