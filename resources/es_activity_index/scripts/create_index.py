import argparse

from gtmcore.inventory.inventory import InventoryManager
from gtmcore.labbook import LabBook
from resources.es_activity_index import ESActivityIndex 

def main():

    parser = argparse.ArgumentParser(description='Destory an index for a labbook (by path) on an elasticsearch server (by url/ip).')
    parser.add_argument('es_server', action="store")

    result = parser.parse_args()

    aidx = ESActivityIndex("global_index", result.es_server, create=True)

if __name__ == "__main__":
  main()
