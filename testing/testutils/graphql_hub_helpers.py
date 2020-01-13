from typing import Optional
import os
from string import Template
import requests

from testutils.graphql_helpers import GraphQLException


def repository_exists(namespace: str, repository_name: str, api_url: Optional[str] = None) -> bool:
    """Method to check if a repository (either a Project or a Dataset) exists in the hub.

    Args:
        namespace: namespace of the Project or Dataset to check
        repository_name: name of the Project or Dataset to check
        api_url: full url to the hub API under test

    Returns:
        bool
    """
    if not api_url:
        api_url = 'https://gigantum.com/api/v1/'

    # Set headers
    if not os.environ.get('ID_TOKEN'):
        raise GraphQLException('ID_TOKEN not found or not set')

    if not os.environ.get('ACCESS_TOKEN'):
        raise GraphQLException('ACCESS_TOKEN not found or not set')

    headers = {
        'Identity': os.environ['ID_TOKEN'],
        'Authorization': f'Bearer {os.environ["ACCESS_TOKEN"]}'
    }

    # Build query
    query_template = Template("""
{
  repository(namespace: "$namespace", repositoryName: "$repository_name"){
    ...on Project{
      id
      modifiedOnUtc
      description
    }
    ...on Dataset{
      id
      modifiedOnUtc
      description
    }
    __typename
  }
}
""")
    query_str = query_template.substitute(namespace=namespace, repository_name=repository_name)

    result = requests.post(api_url, json={'query': query_str}, headers=headers)
    if result.status_code != 200:
        raise GraphQLException(f"Request to hub API failed. Status Code: {result.status_code}")

    result_data = result.json()

    if 'errors' in result_data:
        if "does not exist" in result_data['errors'][0]['message']:
            return False
        else:
            # An error occurred, but the message didn't indicate that the repository doesn't exist.
            raise GraphQLException(result_data)
    else:
        # If no error, repository exists
        return True
