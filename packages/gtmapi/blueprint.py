import json
import os

import graphene
from flask import Blueprint
from flask_graphql import GraphQLView

from gtmcore.configuration import Configuration
from lmsrvcore.middleware import AuthorizationMiddleware, DataloaderMiddleware, time_all_resolvers_middleware, \
    error_middleware, RepositoryCacheMiddleware
from lmsrvlabbook.api import LabbookQuery, LabbookMutations


# ** This blueprint is the combined full LabBook service with all components served together from a single schema ** #

# Load config data for the LabManager instance
config = Configuration()

# Create Blueprint
complete_labbook_service = Blueprint('complete_labbook_service', __name__)

# Create Schema
full_schema = graphene.Schema(query=LabbookQuery, mutation=LabbookMutations)

# Add route and require authentication
if config.is_hub_client:
    # Add full prefix to API when running in the Hub
    api_target = f"/run/{os.environ['GIGANTUM_CLIENT_ID']}{config.config['proxy']['labmanager_api_prefix']}"
else:
    api_target = config.config["proxy"]["labmanager_api_prefix"]

complete_labbook_service.add_url_rule(f'{api_target}/labbook/',
                                      view_func=GraphQLView.as_view('graphql', schema=full_schema,
                                                                    graphiql=config.config["flask"]["DEBUG"],
                                                                    middleware=[error_middleware,
                                                                                RepositoryCacheMiddleware(),
                                                                                DataloaderMiddleware(),
                                                                                AuthorizationMiddleware()]),
                                      methods=['GET', 'POST', 'OPTION'])


if __name__ == '__main__':
    # If the blueprint file is executed directly, generate a schema file
    introspection_dict = full_schema.introspect()

    # Save the schema
    with open('full_schema.json', 'wt') as fp:
        json.dump(introspection_dict, fp)
        print("Wrote full schema to {}".format(os.path.realpath(fp.name)))

