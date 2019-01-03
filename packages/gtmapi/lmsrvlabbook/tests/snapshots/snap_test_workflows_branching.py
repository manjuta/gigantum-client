# -*- coding: utf-8 -*-
# snapshottest: v1 - https://goo.gl/zC4yUc
from __future__ import unicode_literals

from snapshottest import Snapshot


snapshots = Snapshot()

snapshots['TestWorkflowsBranching.test_merge_into_feature_from_workspace_simple_success 1'] = {
    'data': {
        'mergeFromBranch': {
            'labbook': {
                'activeBranchName': 'gm.workspace-default.test-branch',
                'availableBranchNames': [
                    'gm.workspace-default',
                    'gm.workspace-default.test-branch'
                ],
                'description': 'Cats labbook 1',
                'name': 'unittest-workflow-branch-1'
            }
        }
    }
}

snapshots['TestWorkflowsBranching.test_conflicted_merge_from_force_success 1'] = {
    'data': {
        'mergeFromBranch': {
            'labbook': {
                'activeBranchName': 'gm.workspace-default',
                'availableBranchNames': [
                    'gm.workspace-default',
                    'gm.workspace-default.new-branch'
                ],
                'description': 'Cats labbook 1',
                'name': 'unittest-workflow-branch-1'
            }
        }
    }
}
