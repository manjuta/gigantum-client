# -*- coding: utf-8 -*-
# snapshottest: v1 - https://goo.gl/zC4yUc
from __future__ import unicode_literals

from snapshottest import Snapshot


snapshots = Snapshot()

snapshots['TestWorkflowsBranching.test_create_feature_branch_success 1'] = {
    'data': {
        'createExperimentalBranch': {
            'labbook': {
                'activeBranchName': 'gm.workspace-default.valid-branch-name-working1',
                'availableBranchNames': [
                    'gm.workspace-default',
                    'gm.workspace-default.tester1',
                    'gm.workspace-default.valid-branch-name-working1'
                ],
                'description': 'Cats labbook 1',
                'name': 'unittest-workflow-branch-1'
            }
        }
    }
}

snapshots['TestWorkflowsBranching.test_create_feature_branch_success_update_description 1'] = {
    'data': {
        'createExperimentalBranch': {
            'labbook': {
                'activeBranchName': 'gm.workspace-default.valid-branch-name-working1',
                'availableBranchNames': [
                    'gm.workspace-default',
                    'gm.workspace-default.tester1',
                    'gm.workspace-default.valid-branch-name-working1'
                ],
                'description': 'Updated description',
                'name': 'unittest-workflow-branch-1'
            }
        }
    }
}

snapshots['TestWorkflowsBranching.test_workon_feature_branch_success 1'] = {
    'data': {
        'workonExperimentalBranch': {
            'labbook': {
                'activeBranchName': 'gm.workspace-default.tester1',
                'availableBranchNames': [
                    'gm.workspace-default',
                    'gm.workspace-default.tester1'
                ],
                'description': 'Cats labbook 1',
                'name': 'unittest-workflow-branch-1'
            }
        }
    }
}

snapshots['TestWorkflowsBranching.test_merge_into_workspace_from_simple_success 1'] = {
    'data': {
        'mergeFromBranch': {
            'labbook': {
                'activeBranchName': 'gm.workspace-default',
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
