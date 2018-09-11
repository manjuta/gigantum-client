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
import base64
import graphene


class ListBasedConnection(object):
    def __init__(self, edges, cursors, args):
        """Class to provide Relay compliant pagination for list based connections

        Args:
            edges(list): A list of edge data
            cursors(list): A list of cursors for edges
            args(dict): The input arguments to the resolve method

        Returns:
            ListBasedConnection
        """
        self.edges = edges
        self.cursors = cursors
        self.args = args
        self.page_info = None

    def apply(self):
        """Method to apply cursors to the edges

        Returns:
            None
        """

        if "first" in self.args and "last" in self.args:
            raise ValueError("`first` and `last` arguments cannot be used together")

        # Verify valid slicing args
        if "first" in self.args:
            if int(self.args["first"]) < 0:
                raise ValueError("`first` must be greater than 0")
        if "last" in self.args:
            if int(self.args["last"]) < 0:
                raise ValueError("`last` must be greater than 0")

        # Apply cursor filters
        after_index = None
        before_index = None
        if "after" in self.args:
            if self.args["after"] in self.cursors:
                # Remove edges after cursor
                after_index = int(base64.b64decode(self.args["after"]))
            else:
                raise ValueError("`after` cursor is invalid")

        if "before" in self.args:
            if self.args["before"] in self.cursors:
                # Remove edges after cursor
                before_index = int(base64.b64decode(self.args["before"]))
            else:
                raise ValueError("`before` cursor is invalid")

        if after_index is not None and before_index is not None:
            self.edges = self.edges[after_index + 1:before_index]
            self.cursors = self.cursors[after_index + 1:before_index]
        elif after_index is not None:
            self.edges = self.edges[after_index + 1:]
            self.cursors = self.cursors[after_index + 1:]
        elif before_index is not None:
            self.edges = self.edges[:before_index]
            self.cursors = self.cursors[:before_index]

        pre_slice_len = len(self.edges)

        # Apply slicing filters
        if "first" in self.args:
            if len(self.edges) > int(self.args["first"]):
                self.edges = self.edges[:int(self.args["first"])]
                self.cursors = self.cursors[:int(self.args["first"])]

        if "last" in self.args:
            if len(self.edges) > int(self.args["last"]):
                self.edges = self.edges[-int(self.args["last"]):]
                self.cursors = self.cursors[-int(self.args["last"]):]

        # Compute page info status
        has_previous_page = False
        if "last" not in self.args or len(self.edges) == 0:
            has_previous_page = False
        elif pre_slice_len > int(self.args["last"]):
            has_previous_page = True

        has_next_page = False
        if "first" not in self.args or len(self.edges) == 0:
            has_next_page = False
        elif pre_slice_len > int(self.args["first"]):
            has_next_page = True

        if len(self.edges) == 0:
            start_cursor, end_cursor = None, None
        else:
            start_cursor, end_cursor = self.cursors[0], self.cursors[-1]

        # startCursor and endCursor
        self.page_info = graphene.relay.PageInfo(has_next_page=has_next_page, has_previous_page=has_previous_page,
                                                 start_cursor=start_cursor, end_cursor=end_cursor)
