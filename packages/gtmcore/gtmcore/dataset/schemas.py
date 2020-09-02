from typing import Any, Dict, Optional
from schema import (Schema, SchemaError, Or as SchemaOr, Optional as SchemaOptional)

from gtmcore.logging import LMLogger

logger = LMLogger.get_logger()

# The current Dataset schema version
CURRENT_SCHEMA = 2

DATASET_SCHEMA_VERSIONS = {
    # Note: Each time a new schema version is needed, add it into this dictionary
    # with its version number as its key.
    #
    # These are all the supported schemas
    2: {
        'schema': int,
        'id': str,
        'name': str,
        'description': str,
        'created_on': str,
        'storage_type': str,
        'build_info': str,
        SchemaOptional('migrated'): bool
    },
    1: {
        'schema': int,
        'id': str,
        'name': str,
        'description': str,
        'created_on': str,
        'storage_type': str,
        'build_info': SchemaOr({
            'application': str,
            'built_on': str,
            'revision': str,
        }, str)
    }
}


def validate_dataset_schema(schema_version: int, data: Optional[Dict[str, Any]]) -> bool:
    """ Validate a dataset's data against a known schema. Returns true if schema matches
    version appropriately.

    Args:
        schema_version(int): Schema version to validate against
        data(Dict): Dataset's data dict.

    Returns:
        bool: True if schema validates, False otherwise.

    """
    if not schema_version or schema_version not in DATASET_SCHEMA_VERSIONS.keys():
        logger.error(f"schema_version {schema_version} not found in schema versions")
        return False

    if not data:
        logger.error(f"data is None or empty")
        return False

    schema = Schema(DATASET_SCHEMA_VERSIONS[schema_version])
    try:
        schema.validate(data)
        return True
    except SchemaError as e:
        logger.error(e)
        return False
