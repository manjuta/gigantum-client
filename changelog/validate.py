import glob
import yamale
import argparse
import os
from pathlib import Path
import yaml


def validate_schema() -> None:
    """Method to validate all changelog yaml files using the defined schema`

    Returns:
        None
    """
    print("Validating changelog files.")
    schema = yamale.make_schema('./schema.yaml')

    for changelog_file in glob.glob("./releases/*/*.yaml"):
        data = yamale.make_data(changelog_file)
        yamale.validate(schema, data)

    print("All changelog files valid.")


def verify_pr_contains_changelog() -> None:
    """Method to check if the current PR contains a changelog yaml file. This is done by searching through all the
    files for one that contains `prLink == CIRCLE_PULL_REQUEST`, where CIRCLE_PULL_REQUEST is the URL to the
    PR in github, automatically set by circleCI

    Returns:
        None
    """
    print("Searching for changelog file associated with this PR.")

    pr_under_test = os.environ.get('CIRCLE_PULL_REQUEST')
    if pr_under_test is None:
        raise Exception("Failed to get current PR URL from CIRCLE_PULL_REQUEST env var.")

    for changelog_file in glob.glob("./releases/*/*.yaml"):
        data = yaml.safe_load(Path(changelog_file).read_bytes())
        if data.get('prLink') == pr_under_test:
            print(f"Found changelog entry for this PR: {changelog_file}")
            return

    raise Exception("No changelog found for this PR. Please add changelog details for this PR before merging.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()

    # Required positional argument
    parser.add_argument("action", help="Desired action to run. (`validate` or `pr`)")

    args = parser.parse_args()

    if args.action == "schema":
        validate_schema()
    elif args.action == "pr":
        verify_pr_contains_changelog()
    else:
        raise ValueError(f"Unsupported action: {args.action}")
