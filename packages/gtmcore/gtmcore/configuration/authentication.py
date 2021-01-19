from typing import Union, Dict
import dataclasses


@dataclasses.dataclass
class OAuth2AuthConfiguration:
    login_type: str
    login_url: str
    audience: str
    issuer: str
    signing_algorithm: str
    public_key_url: str
    client_id: str
    token_url: str
    logout_url: str

    def to_dict(self) -> Dict[str, str]:
        return {
            "login_type": self.login_type,
            "login_url": self.login_url,
            "audience": self.audience,
            "issuer": self.issuer,
            "signing_algorithm": self.signing_algorithm,
            "public_key_url": self.public_key_url,
            "client_id": self.client_id,
            "token_url": self.token_url,
            "logout_url": self.logout_url
        }


def dict_to_auth_config(data: dict) -> OAuth2AuthConfiguration:
    """Method to convert a dictionary to an Auth config dataclass. Currently only OAuth2AuthConfiguration is supported
    but in the future other auth systems will be added.

    Args:
        data: dictionary containing auth config information

    Returns:
        auth config data class
    """
    auth_config = OAuth2AuthConfiguration(login_type=data['login_type'],
                                          login_url=data['login_url'],
                                          audience=data['audience'],
                                          issuer=data['issuer'],
                                          signing_algorithm=data['signing_algorithm'],
                                          public_key_url=data['public_key_url'],
                                          client_id=data['client_id'],
                                          token_url=data['token_url'],
                                          logout_url=data['logout_url'])

    return auth_config
