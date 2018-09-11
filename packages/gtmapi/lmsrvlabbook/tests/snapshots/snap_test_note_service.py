# -*- coding: utf-8 -*-
# snapshottest: v1 - https://goo.gl/zC4yUc
from __future__ import unicode_literals

from snapshottest import Snapshot


snapshots = Snapshot()

snapshots['TestNoteService.test_create_user_note_no_body 1'] = {
    'data': {
        'createUserNote': {
            'newActivityRecordEdge': {
                'node': {
                    'detailObjects': [
                        {
                            'data': [
                            ],
                            'importance': 255,
                            'show': True,
                            'tags': [
                            ],
                            'type': 'NOTE'
                        }
                    ],
                    'importance': 255,
                    'message': 'I think this is a thing',
                    'show': True,
                    'tags': [
                    ],
                    'type': 'NOTE'
                }
            }
        }
    }
}

snapshots['TestNoteService.test_create_user_note_full 1'] = {
    'data': {
        'createUserNote': {
            'newActivityRecordEdge': {
                'node': {
                    'detailObjects': [
                        {
                            'data': [
                                [
                                    'text/markdown',
                                    '''##AND THIS IS A BODY
- asdggf
-asdf'''
                                ]
                            ],
                            'importance': 255,
                            'show': True,
                            'tags': [
                            ],
                            'type': 'NOTE'
                        }
                    ],
                    'importance': 255,
                    'message': 'I think this is a thing',
                    'show': True,
                    'tags': [
                        'this',
                        'and',
                        'that'
                    ],
                    'type': 'NOTE'
                }
            }
        }
    }
}
