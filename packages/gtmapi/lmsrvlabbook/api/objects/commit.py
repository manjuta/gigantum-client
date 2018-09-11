
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

from lmsrvcore.auth.user import get_logged_in_username

from lmsrvcore.api.interfaces import GitCommit, GitRepository
from lmsrvlabbook.dataloader.labbook import LabBookLoader


class LabbookCommit(graphene.ObjectType, interfaces=(graphene.relay.Node, GitRepository, GitCommit)):
    """An object representing a commit to a LabBook"""

    @classmethod
    def get_node(cls, info, id):
        """Method to resolve the object based on it's Node ID"""
        # Parse the key
        owner, name, hash_str = id.split("&")

        return LabbookCommit(id=f"{owner}&{name}&{hash_str}", name=name, owner=owner,
                             hash=hash_str)

    def resolve_id(self, info):
        """Resolve the unique Node id for this object"""
        if not self.id:
            if not self.owner or not self.name or not self.hash:
                raise ValueError("Resolving a LabbookCommit Node ID requires owner, name, and hash to be set")
            self.id = f"{self.owner}&{self.name}&{self.hash}"

    def resolve_short_hash(self, info):
        """Resolve the short_hash field"""
        return self.hash[:8]

    def resolve_committed_on(self, info):
        """Resolve the committed_on field"""
        return info.context.labbook_loader.load(f"{get_logged_in_username()}&{self.owner}&{self.name}").then(
            lambda labbook: labbook.git.repo.commit(self.hash).committed_datetime.isoformat())
