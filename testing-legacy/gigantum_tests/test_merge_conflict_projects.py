import os
import logging
import time
from subprocess import Popen, PIPE

import selenium

import testutils


def test_use_mine_merge_conflict_project(driver: selenium.webdriver, *args, **kwargs):
    """
    Test that a merge conflict is properly resolved when the user decides to "use mine."

    Args:
        driver
    """
    # Prepare merge conflict
    username, project_title, collaborator = prep_merge_conflict(driver)

    # Owner resolves the merge conflict with 'Use Mine'
    cloud_project_elts = testutils.CloudProjectElements(driver)
    cloud_project_elts.merge_conflict_modal.wait_to_appear(20)
    time.sleep(2)
    cloud_project_elts.merge_conflict_use_mine_button.click()
    cloud_project_elts.merge_conflict_modal.wait_to_disappear(nsec=20)
    project_control_elts = testutils.ProjectControlElements(driver)
    waiting_start = time.time()
    while "Sync complete" not in project_control_elts.footer_notification_message.find().text:
        time.sleep(0.5)
        if time.time() - waiting_start > 35:
            raise ValueError(f'Timed out waiting for sync to complete')

    # Check that merge conflict resolves to "use mine"
    file_path = os.path.join(os.environ['GIGANTUM_HOME'], 'servers', testutils.current_server_id(),
                             username, username, 'labbooks',
                             project_title, 'input', 'sample-upload.txt')
    with open(file_path, "r") as resolve_merge_conflict_file:
        resolve_merge_conflict_file = resolve_merge_conflict_file.read()

    assert resolve_merge_conflict_file == "owner", \
        f"Merge did not resolve to 'use mine,' expected to see 'owner' in file, " \
        f"but instead got {resolve_merge_conflict_file}"


def test_use_theirs_merge_conflict_project(driver: selenium.webdriver, *args, **kwargs):
    """
    Test that a merge conflict is properly resolved when the user decides to "use theirs."

    Args:
        driver
    """
    # Prepare merge conflict
    username, project_title, collaborator = prep_merge_conflict(driver)

    # Owner uploads file, syncs, and resolves the merge conflict with "use theirs"
    cloud_project_elts = testutils.CloudProjectElements(driver)
    cloud_project_elts.merge_conflict_modal.wait_to_appear(20)
    time.sleep(2)
    cloud_project_elts.merge_conflict_use_theirs_button.click()
    cloud_project_elts.merge_conflict_modal.wait_to_disappear(nsec=20)
    project_control_elts = testutils.ProjectControlElements(driver)
    waiting_start = time.time()
    while "Sync complete" not in project_control_elts.footer_notification_message.find().text:
        time.sleep(0.5)
        if time.time() - waiting_start > 35:
            raise ValueError(f'Timed out waiting for sync to complete')

    # Check that merge conflict resolves to "use theirs"
    file_path = os.path.join(os.environ['GIGANTUM_HOME'], 'servers', testutils.current_server_id(),
                             username, username, 'labbooks',
                             project_title, 'input', 'sample-upload.txt')
    with open(file_path, "r") as resolve_merge_conflict_file:
        resolve_merge_conflict_file = resolve_merge_conflict_file.read()

    assert resolve_merge_conflict_file == "collaborator", \
        f"Merge did not resolve to 'use theirs,' expected to see 'collaborator' in file, " \
        f"but instead got {resolve_merge_conflict_file}"


def test_abort_merge_conflict_project(driver: selenium.webdriver, *args, **kwargs):
    """
    Test that a merge conflict is properly resolved when the user decides to "abort."

    Args:
        driver
    """
    # Prepare merge conflict
    username, project_title, collaborator = prep_merge_conflict(driver)

    # Owner uploads file, syncs, and resolves the merge conflict with "abort"
    cloud_project_elts = testutils.CloudProjectElements(driver)
    project_path = os.path.join(os.environ['GIGANTUM_HOME'], 'servers', testutils.current_server_id(),
                                username, username, 'labbooks', project_title)
    git_get_log_command_1 = Popen(['git', 'log', '--pretty=format%H'], cwd=project_path, stdout=PIPE, stderr=PIPE)
    before_merge_conflict_resolve_stdout = git_get_log_command_1.stdout.readline().decode('utf-8').strip()
    cloud_project_elts.merge_conflict_modal.wait_to_appear(30)
    time.sleep(2)
    cloud_project_elts.merge_conflict_abort_button.click()
    cloud_project_elts.merge_conflict_modal.wait_to_disappear(nsec=20)

    # Check that merge conflict resolves to "abort"
    git_get_log_command_2 = Popen(['git', 'log', '--pretty=format%H'], cwd=project_path, stdout=PIPE, stderr=PIPE)
    after_merge_conflict_resolve_stdout = git_get_log_command_2.stdout.readline().decode('utf-8').strip()

    assert before_merge_conflict_resolve_stdout == after_merge_conflict_resolve_stdout, \
        f"Merge did not resolve to 'abort,' expected to see {before_merge_conflict_resolve_stdout}, " \
        f"but instead got {after_merge_conflict_resolve_stdout}"


def prep_merge_conflict(driver: selenium.webdriver, *args, **kwargs):
    """
    Prepare a merge conflict in a cloud project

    Args:
        driver
    """
    # Owner creates a project, publishes it, adds a collaborator
    r = testutils.prep_py3_minimal_base(driver)
    username, project_title = r.username, r.project_name
    cloud_project_elts = testutils.CloudProjectElements(driver)
    cloud_project_elts.publish_private_project(project_title)
    collaborator = cloud_project_elts.add_collaborator_with_permissions(project_title, permissions="admin")
    side_bar_elts = testutils.SideBarElements(driver)
    side_bar_elts.do_logout(username)

    # Collaborator imports the cloud project
    logging.info(f"Logging in as {collaborator}")
    testutils.log_in(driver, user_index=1)
    guide_elts = testutils.GuideElements(driver)
    logging.info(f"Navigating to {collaborator}'s cloud tab")
    driver.get(f"{os.environ['GIGANTUM_HOST']}/projects/cloud")
    cloud_project_elts.first_cloud_project.wait_to_appear(30)
    cloud_project_elts.import_first_cloud_project_button.find().click()
    project_control = testutils.ProjectControlElements(driver)
    project_control.container_status_stopped.wait_to_appear(30)

    # Collaborator adds a file and syncs
    logging.info(f"Navigating to {collaborator}'s input data tab")
    driver.get(f'{os.environ["GIGANTUM_HOST"]}/projects/{username}/{project_title}/inputData')
    file_browser_elts = testutils.FileBrowserElements(driver)
    file_browser_elts.file_browser_area.wait_to_appear()
    file_browser_elts.drag_drop_file_in_drop_zone(file_content="collaborator")
    cloud_project_elts.sync_cloud_project(project_title)
    side_bar_elts.do_logout(collaborator)

    # Owner adds a file and syncs
    logging.info(f"Logging in as {username}")
    testutils.log_in(driver)
    guide_elts.remove_guide()
    logging.info(f"Navigating to {username}'s input data tab")
    driver.get(f'{os.environ["GIGANTUM_HOST"]}/projects/{username}/{project_title}/inputData')
    file_browser_elts.file_browser_area.wait_to_appear()
    file_browser_elts.drag_drop_file_in_drop_zone(file_content="owner")
    cloud_project_elts.sync_cloud_project_button.click()
    return username, project_title, collaborator
