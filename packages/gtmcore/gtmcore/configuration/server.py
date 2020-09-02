from typing import Dict, Union
import dataclasses


@dataclasses.dataclass
class ServerConfigData:
    id: str
    name: str
    base_url: str
    git_url: str
    git_server_type: str
    hub_api_url: str
    object_service_url: str
    user_search_url: str
    lfs_enabled: bool

    def to_dict(self) -> Dict[str, Union[str, bool]]:
        return {"id": self.id,
                "name": self.name,
                "base_url": self.base_url,
                "git_url": self.git_url,
                "git_server_type": self.git_server_type,
                "hub_api_url": self.hub_api_url,
                "object_service_url": self.object_service_url,
                "user_search_url": self.user_search_url,
                "lfs_enabled": self.lfs_enabled
                }


def dict_to_server_config(data: dict) -> ServerConfigData:
    return ServerConfigData(id=data['id'],
                            name=data['name'],
                            base_url=data['base_url'],
                            git_url=data['git_url'],
                            git_server_type=data['git_server_type'],
                            hub_api_url=data['hub_api_url'],
                            object_service_url=data['object_service_url'],
                            user_search_url=data['user_search_url'],
                            lfs_enabled=data['lfs_enabled'])
