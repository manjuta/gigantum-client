import pytest
from gtmcore.activity.processors.processor import ExecutionData


class TestExecutionData(object):

    def test_is_empty(self):
        """Test the constructor"""
        ed = ExecutionData()

        assert ed.is_empty() is True

    def test_is_not_empty(self):
        """Test the constructor"""
        ed = ExecutionData()
        ed.code.append({"this": "thing"})

        assert ed.is_empty() is False

        ed = ExecutionData()
        ed.result.append({"this": "thing"})

        assert ed.is_empty() is False

        ed = ExecutionData()
        ed.tags.append("tag")

        assert ed.is_empty() is False
