import pytest
from gtmcore.container.cuda import GPUInventory, GPUNotAvailable
import redis
from gtmcore.configuration import Configuration


@pytest.fixture
def gpu_inventory():
    c = Configuration()
    gpu_inv = GPUInventory()
    yield gpu_inv
    client = redis.Redis(db=gpu_inv.REDIS_DB, decode_responses=True)
    client.delete(gpu_inv.GPU_ASSIGNMENT_KEY)
    client.delete(gpu_inv.GPUS_AVAILABLE_KEY)


class TestGPUInventory(object):
    def test_init(self, gpu_inventory):
        client = redis.Redis(db=gpu_inventory.REDIS_DB, decode_responses=True)

        assert client.exists(gpu_inventory.GPU_ASSIGNMENT_KEY) == 0
        assert client.exists(gpu_inventory.GPUS_AVAILABLE_KEY) == 0

        gpu_inventory.initialize()

        assert client.exists(gpu_inventory.GPU_ASSIGNMENT_KEY) == 0
        assert client.exists(gpu_inventory.GPUS_AVAILABLE_KEY) == 1
        assert client.llen(gpu_inventory.GPUS_AVAILABLE_KEY) == 4

    def test_reserve_release(self, gpu_inventory):
        client = redis.Redis(db=gpu_inventory.REDIS_DB, decode_responses=True)
        gpu_inventory.initialize()

        idx = gpu_inventory.reserve("test-user", "test-user", "my-project")

        assert client.exists(gpu_inventory.GPU_ASSIGNMENT_KEY) == 1
        assert client.exists(gpu_inventory.GPUS_AVAILABLE_KEY) == 1
        assert client.llen(gpu_inventory.GPUS_AVAILABLE_KEY) == 3
        assert client.hlen(gpu_inventory.GPU_ASSIGNMENT_KEY) == 1
        assert client.hget(gpu_inventory.GPU_ASSIGNMENT_KEY, "test-user&test-user&my-project") == str(idx) == str(0)

        gpu_inventory.release("test-user", "test-user", "my-project")
        assert client.exists(gpu_inventory.GPU_ASSIGNMENT_KEY) == 0
        assert client.exists(gpu_inventory.GPUS_AVAILABLE_KEY) == 1
        assert client.llen(gpu_inventory.GPUS_AVAILABLE_KEY) == 4

    def test_reserve_release_reserve(self, gpu_inventory):
        client = redis.Redis(db=gpu_inventory.REDIS_DB, decode_responses=True)
        gpu_inventory.initialize()

        idx0 = gpu_inventory.reserve("test-user", "test-user", "my-project-0")
        idx1 = gpu_inventory.reserve("test-user", "test-user", "my-project-1")
        idx2 = gpu_inventory.reserve("test-user", "test-user", "my-project-2")

        assert client.exists(gpu_inventory.GPU_ASSIGNMENT_KEY) == 1
        assert client.exists(gpu_inventory.GPUS_AVAILABLE_KEY) == 1
        assert client.llen(gpu_inventory.GPUS_AVAILABLE_KEY) == 1
        assert client.hlen(gpu_inventory.GPU_ASSIGNMENT_KEY) == 3
        assert client.hget(gpu_inventory.GPU_ASSIGNMENT_KEY, "test-user&test-user&my-project-0") == str(idx0) == str(0)
        assert client.hget(gpu_inventory.GPU_ASSIGNMENT_KEY, "test-user&test-user&my-project-1") == str(idx1) == str(1)
        assert client.hget(gpu_inventory.GPU_ASSIGNMENT_KEY, "test-user&test-user&my-project-2") == str(idx2) == str(2)

        gpu_inventory.release("test-user", "test-user", "my-project-1")
        assert client.exists(gpu_inventory.GPU_ASSIGNMENT_KEY) == 1
        assert client.exists(gpu_inventory.GPUS_AVAILABLE_KEY) == 1
        assert client.llen(gpu_inventory.GPUS_AVAILABLE_KEY) == 2
        assert client.hlen(gpu_inventory.GPU_ASSIGNMENT_KEY) == 2

        idx3 = gpu_inventory.reserve("test-user", "test-user", "my-project-3")
        idx4 = gpu_inventory.reserve("test-user", "test-user", "my-project-4")
        assert client.exists(gpu_inventory.GPU_ASSIGNMENT_KEY) == 1
        assert client.exists(gpu_inventory.GPUS_AVAILABLE_KEY) == 0
        assert client.llen(gpu_inventory.GPUS_AVAILABLE_KEY) == 0
        assert client.hlen(gpu_inventory.GPU_ASSIGNMENT_KEY) == 4
        assert client.hget(gpu_inventory.GPU_ASSIGNMENT_KEY, "test-user&test-user&my-project-0") == str(idx0) == str(0)
        assert client.hget(gpu_inventory.GPU_ASSIGNMENT_KEY, "test-user&test-user&my-project-2") == str(idx2) == str(2)
        assert client.hget(gpu_inventory.GPU_ASSIGNMENT_KEY, "test-user&test-user&my-project-3") == str(idx3) == str(3)
        assert client.hget(gpu_inventory.GPU_ASSIGNMENT_KEY, "test-user&test-user&my-project-4") == str(idx4) == str(1)

        gpu_inventory.release("test-user", "test-user", "my-project-0")
        assert client.exists(gpu_inventory.GPU_ASSIGNMENT_KEY) == 1
        assert client.exists(gpu_inventory.GPUS_AVAILABLE_KEY) == 1
        assert client.llen(gpu_inventory.GPUS_AVAILABLE_KEY) == 1
        assert client.hlen(gpu_inventory.GPU_ASSIGNMENT_KEY) == 3

    def test_unavailable(self, gpu_inventory):
        gpu_inventory.initialize()

        gpu_inventory.reserve("test-user", "test-user", "my-project-0")
        gpu_inventory.reserve("test-user", "test-user", "my-project-1")
        gpu_inventory.reserve("test-user", "test-user", "my-project-2")
        gpu_inventory.reserve("test-user", "test-user", "my-project-3")

        with pytest.raises(GPUNotAvailable):
            gpu_inventory.reserve("test-user", "test-user", "my-project-4")
