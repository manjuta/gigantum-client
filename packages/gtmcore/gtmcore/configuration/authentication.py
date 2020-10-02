from typing import Union, Dict
import dataclasses


@dataclasses.dataclass
class Auth0AuthConfiguration:
    login_type: str
    login_url: str
    audience: str
    issuer: str
    signing_algorithm: str
    public_key_url: str
    auth0_client_id: str

    def to_dict(self) -> Dict[str, str]:
        return {
            "login_type": self.login_type,
            "login_url": self.login_url,
            "audience": self.audience,
            "issuer": self.issuer,
            "signing_algorithm": self.signing_algorithm,
            "public_key_url": self.public_key_url,
            "auth0_client_id": self.auth0_client_id
        }


def dict_to_auth_config(data: dict) -> Union[Auth0AuthConfiguration]:
    """Method to convert a dictionary to an Auth config dataclass. Currently only Auth0AuthConfiguration is supported
    but in the future other auth systems will be added.

    Args:
        data: dictionary containing auth config information

    Returns:
        auth config data class
    """
    if data['login_type'] == "auth0":
        auth_config = Auth0AuthConfiguration(login_type=data['login_type'],
                                             login_url=data['login_url'],
                                             audience=data['audience'],
                                             issuer=data['issuer'],
                                             signing_algorithm=data['signing_algorithm'],
                                             public_key_url=data['public_key_url'],
                                             auth0_client_id=data['auth0_client_id'])
    else:
        raise ValueError(f"Unsupported Auth system type `{data['login_type']}`")

    return auth_config
