# -*- coding: utf-8 -*-
# snapshottest: v1 - https://goo.gl/zC4yUc
from __future__ import unicode_literals

from snapshottest import Snapshot


snapshots = Snapshot()

snapshots['TestLabBookCollaboratorMutations.test_add_collaborator 1'] = {
    'data': {
        'addCollaborator': {
            'updatedLabbook': {
                'canManageCollaborators': False,
                'collaborators': [
                    'janed',
                    'person100'
                ]
            }
        }
    }
}

snapshots['TestLabBookCollaboratorMutations.test_delete_collaborator 1'] = {
    'data': {
        'deleteCollaborator': {
            'updatedLabbook': {
                'collaborators': [
                    'janed'
                ]
            }
        }
    }
}

snapshots['TestLabBookCollaboratorMutations.test_add_collaborator_as_owner 1'] = {
    'data': {
        'addCollaborator': {
            'updatedLabbook': {
                'canManageCollaborators': True,
                'collaborators': [
                    'default',
                    'person100'
                ]
            }
        }
    }
}
