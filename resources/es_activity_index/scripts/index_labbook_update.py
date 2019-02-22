import argparse

from gtmcore.inventory.inventory import InventoryManager
from gtmcore.labbook import LabBook
from resources.es_activity_index import LabbookIndexer

def main():

    parser = argparse.ArgumentParser(description='Index a labbook (by path) into elasticsearch server (by url/ip).')
    parser.add_argument('labbook_path', action="store")
    parser.add_argument('es_server', action="store")

    result = parser.parse_args()

    lb = InventoryManager().load_labbook_from_directory(result.labbook_path)
    
    lb_idxr = LabbookIndexer("global_index", result.es_server, lb)
    lb_idxr.update_index()

if __name__ == "__main__":
  main()
