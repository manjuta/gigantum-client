import glob
import json
import argparse
import yaml
from natsort import natsorted
import requests
from pathlib import Path
from collections import OrderedDict
from datetime import date


def get_current_release_dir() -> str:
    """Get the directory to the current release

    Returns:

    """
    releases = list()
    for release in glob.glob("./releases/*"):
        releases.append(release)

    releases = natsorted(releases)

    return releases[-1]


def get_current_json_file() -> OrderedDict:
    """Get the current json file from S3

    Returns:
        OrderedDict containing the parsed file contents
    """
    url = "https://s3.amazonaws.com/io.gigantum.changelog/changelog.json"
    response = requests.get(url)
    return response.json(object_pairs_hook=OrderedDict)


def generate_updated_changelog(current_release_image_tag: str, current_release_image_hash: str) -> OrderedDict:
    """Method to generate the updated changelog data structure as an OrderedDict

    Args:
        current_release_image_tag: the docker image tag for the current release
        current_release_image_hash: the docker image hash for the current release (10 chars only)

    Returns:
        OrderedDict
    """
    latest_version_dir = get_current_release_dir()
    data = get_current_json_file()

    messages = list()
    changes = dict()
    for changelog_file in glob.glob(f"{latest_version_dir}/*.yaml"):
        contents = yaml.safe_load(Path(changelog_file).read_bytes())

        _, pr_number = contents['prLink'].rsplit('/', 1)

        if 'message' in contents:
            messages.append(contents['message'])

        for item in contents['changelog']:
            if item['type'] == "NON_USER_FACING":
                continue

            changes.setdefault(item['type'], []).append(f"{item['description']} (#{pr_number})")

    if len(messages) == 0:
        # legacy code requires an empty message string if no messages.
        messages.append("")

    # Add to existing file
    record = OrderedDict()
    record["date"] = str(date.today())
    record["id"] = current_release_image_hash
    record["changes"] = changes
    record["messages"] = messages
    _, record["version"] = latest_version_dir.rsplit("/", 1)

    data['latest'] = record
    data[current_release_image_tag] = record
    data.move_to_end(current_release_image_tag, last=False)
    data.move_to_end('latest', last=False)

    return data


def render_json(output_dir: str, current_release_image_tag: str, current_release_image_hash: str) -> None:
    """Render the changelog data to a json file.

    Args:
        output_dir: directory to write file
        current_release_image_tag: the docker image tag for the current release
        current_release_image_hash: the docker image hash for the current release (10 chars only)

    Returns:
        None
    """
    data = generate_updated_changelog(current_release_image_tag, current_release_image_hash)
    Path(Path(output_dir).expanduser().absolute(), 'changelog.json').write_text(json.dumps(data, indent=2))


def render_markdown(output_dir: str, current_release_image_tag: str, current_release_image_hash: str) -> None:
    """Render the changelog data to a markdown file.

    Args:
        output_dir: directory to write file
        current_release_image_tag: the docker image tag for the current release
        current_release_image_hash: the docker image hash for the current release (10 chars only)

    Returns:
        None
    """
    data = generate_updated_changelog(current_release_image_tag, current_release_image_hash)
    md = ""

    for tag in data:
        if tag == "latest":
            continue

        item_data = data[tag]
        version_str = f" ({item_data['version']})" if 'version' in item_data else ""
        md = md + f"## {item_data['date']}\n\n"
        md = md + f"### Gigantum Client{version_str}\n\n"
        md = md + f"Image Tag: {tag}\n\n"
        md = md + f"Image ID: {item_data['id']}\n\n"

        for section in item_data['changes']:
            md = md + f"* **{section}**\n"
            for change in item_data['changes'][section]:
                md = md + f"  * {change}\n"

            md = md + "\n"

        md = md + "\n\n"

    Path(Path(output_dir).expanduser().absolute(), 'changelog.md').write_text(md)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()

    # Required positional argument
    parser.add_argument("format", help="Desired output formant. (`json`, `markdown`)")
    parser.add_argument("--directory", '-d', default='.', help="Desired output directory.")
    parser.add_argument('--image-tag', '-t', default=None, help='Client Docker Image tag for this release')
    parser.add_argument('--image-hash', '-i', default=None, help='Client Docker Image id hash (first 10 chars)')

    args = parser.parse_args()

    if args.format == "json":
        render_json(args.directory, args.image_tag, args.image_hash)
    elif args.format == "markdown":
        render_markdown(args.directory, args.image_tag, args.image_hash)
    else:
        raise ValueError(f"Unsupported format: {args.format}")
