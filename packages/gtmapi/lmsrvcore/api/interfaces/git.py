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
import graphene


class GitCommit(graphene.Interface):
    """An interface for any object that is represented by a git commit"""
    # The git commit hash
    hash = graphene.String(required=True)

    # The git commit hash, limited to 8-characters
    short_hash = graphene.String()

    # The datetime of the commit as an ISO-8601 encoded UTC datetime string
    committed_on = graphene.String()


class GitRef(graphene.Interface):
    """An interface for any git reference"""
    # The name of the reference
    ref_name = graphene.String(required=True)

    # The prefix of the reference
    prefix = graphene.String()


class GitRepository(graphene.Interface):
    """An interface for Objects backended with git repositories (LabBook and Datasets)"""
    # The owner of the underlying git repository. Also can be referred to as the "namespace"
    # Only A-Za-z0-9- allowed with no leading or trailing '-'
    owner = graphene.String(required=True)

    # The name of the underlying git repository.
    # Must be unique to what exists locally and unique in a user's library when pushing
    # Only A-Za-z0-9- allowed with no leading or trailing '-'
    name = graphene.String(required=True)
