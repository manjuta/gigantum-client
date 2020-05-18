import docker


class LabManagerTester(object):
    """Class to manage testing of newly built container.
    """

    def __init__(self, container_name: str):
        self.docker_client = docker.from_env()
        self.container_name = container_name

    def _retrieve_container(self):
        """Return container from name. """
        cns = [c for c in self.docker_client.containers.list() if c.name == self.container_name]
        if len(cns) != 1:
            raise ValueError("Container by name `{}' not found.".format(self.container_name))
        else:
            return cns[0]

    def test(self) -> None:
        """ Shows debug output of running pytest inside the container.

        Note: Throws ValueError if the container does not exist.
        """
        # TODO: Insert jupyter environment variable until generalized
        env_var = {'JUPYTER_RUNTIME_DIR': '/mnt/share/jupyter/runtime'}

        container = self._retrieve_container()

        print("\n** Running mypy type checking (if no output, no errors):\n")

        # Run the type-checker on lmcommon
        [print(p.decode('UTF-8'), end='') for p in container.exec_run(
            "/usr/local/bin/entrypoint.sh /opt/conda/bin/python -m mypy /opt/labmanager-common --ignore-missing-imports",
            stream=True)]

        # Run all py.test unit tests
        print("\n** Running unit tests\n")

        [print(p.decode('UTF-8'), end='') for p in container.exec_run("/usr/local/bin/entrypoint.sh /opt/conda/bin/py.test /opt",
                                                                      stream=True,
                                                                      environment=env_var)]

        # TODO - Capture return code to see if tests pass - this is difficult to do.
