
# Copyright (c) 2018 FlashX, LLC
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
import graphene

from lmcommon.environment import ComponentRepository


class CustomComponent(graphene.ObjectType, interfaces=(graphene.relay.Node,)):
    """A type that represents a Custom Dependency Environment Component"""
    # The loaded yaml data
    _component_data = None

    # The Component schema version
    schema = graphene.Int()

    # The name of the component repository where this Base is stored
    repository = graphene.String(required=True)

    # id field from the Base component definition file
    component_id = graphene.String(required=True)

    # Revision of the component
    revision = graphene.Int(required=True)

    # Human readable name
    name = graphene.String()

    # Short description of the Base
    description = graphene.String()

    # Tags that can be used when searching/filtering components
    tags = graphene.List(graphene.String)

    # License applied to the underlying component being installed
    license = graphene.String()

    # Required OS base class to add the component
    os_base_class = graphene.String()

    # Url to more documentation or info about the base
    url = graphene.String()

    # List of installed package managers that are available to the user
    required_package_managers = graphene.List(graphene.String)

    # Custom snippet to insert into the LabBook's Dockerfile
    docker_snippet = graphene.String()

    def _load_component_info(self):
        """Private method to retrieve file info for a given key"""
        if not self._component_data:
            repo = ComponentRepository()

            self._component_data = repo.get_component("custom", self.repository, self.component_id, self.revision)

        self.schema = self._component_data['schema']
        self.name = self._component_data['name']
        self.description = self._component_data['description']
        self.tags = self._component_data.get('tags')
        self.license = self._component_data.get('license')
        self.url = self._component_data.get('url')
        self.os_base_class = self._component_data.get('os_base_class')
        self.required_package_managers = self._component_data.get('required_package_managers')
        self.docker_snippet = self._component_data['docker']

    @classmethod
    def get_node(cls, info, id):
        """Method to resolve the object based on it's Node ID"""
        # Parse the key
        repository, component_id, revision = id.split("&")

        return CustomComponent(id=f"{repository}&{component_id}&{revision}",
                               repository=repository, component_id=component_id, revision=int(revision))

    def resolve_id(self, info):
        """Resolve the unique Node id for this object"""
        if not self.repository or not self.component_id or self.revision is None:
            raise ValueError("Resolving a CustomComponent ID requires repository, component_id and revision to be set")

        return f"{self.repository}&{self.component_id}&{self.revision}"

    def resolve_schema(self, info):
        """Resolve the schema field"""
        if self.schema is None:
            self._load_component_info()
        return self.schema

    def resolve_name(self, info):
        """Resolve the name field"""
        if self.name is None:
            self._load_component_info()
        return self.name

    def resolve_description(self, info):
        """Resolve the description field"""
        if self.description is None:
            self._load_component_info()
        return self.description

    def resolve_version(self, info):
        """Resolve the version field"""
        if self.version is None:
            self._load_component_info()
        return self.version

    def resolve_tags(self, info):
        """Resolve the tags field"""
        if self.tags is None:
            self._load_component_info()
        return self.tags

    def resolve_license(self, info):
        """Resolve the license field"""
        if self.license is None:
            self._load_component_info()
        return self.license

    def resolve_url(self, info):
        """Resolve the url field"""
        if self.url is None:
            self._load_component_info()
        return self.url

    def resolve_os_base_class(self, info):
        """Resolve the os_base_class field"""
        if self.os_base_class is None:
            self._load_component_info()
        return self.os_base_class

    def resolve_required_package_managers(self, info):
        """Resolve the required_package_managers field"""
        if self.required_package_managers is None:
            self._load_component_info()
        return self.required_package_managers

    def resolve_docker_snippet(self, info):
        """Resolve the docker_snippet field"""
        if self.docker_snippet is None:
            self._load_component_info()
        return self.docker_snippet
