import pytest

from gtm.client.build import ClientBuilder


@pytest.fixture()
def setup_build_class():
    """Fixture to create a Build instance with a test image name that does not exist and cleanup after"""
    b = ClientBuilder("test-labmanager-image")

    # Make sure image doesn't exist
    if b.image_exists("test-labmanager-image"):
        b.remove_image("test-labmanager-image")

    yield b

    # Remove image post test if it still exists
    if b.image_exists("test-labmanager-image"):
        b.remove_image("test-labmanager-image")


class TestLabManagerBuild(object):
    def test_set_names(self):
        """Test getting and setting the container and image names"""
        b = ClientBuilder("my-image-13242")

        assert b.image_name == "my-image-13242"

        b.container_name = "my-image-43545"
        assert b.container_name == "my-image-43545"

    def test_names(self):
        """Test getting and setting the image name only"""
        b = ClientBuilder("repo/my_image-13242")

        assert b.image_name == "repo/my_image-13242"

        assert b.container_name == "repo.my_image-13242"

    def test_invalid_names(self):
        """Method to test setting invalid names"""
        with pytest.raises(ValueError):
            b = ClientBuilder("my-image-")
            b.container_name

        with pytest.raises(ValueError):
            b = ClientBuilder("-my-image")
            b.container_name

        with pytest.raises(ValueError):
            b = ClientBuilder("my-image324!!")
            b.container_name

        # Now test container names directly
        b = ClientBuilder('irrelevant')

        with pytest.raises(ValueError):
            b.container_name = "my-image-"

        with pytest.raises(ValueError):
            b.container_name = "-my-image"

        with pytest.raises(ValueError):
            b.container_name = "my-image324!!"

        with pytest.raises(ValueError):
            b.container_name = "my-image324/"

        with pytest.raises(ValueError):
            b.container_name = "/my-image324"
