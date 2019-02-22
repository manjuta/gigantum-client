from gtmcore.labbook import LabBook
from gtmcore.activity import ActivityStore
from gtmcore.activity.records import ActivityType, ActivityRecord, ActivityDetailRecord, ActivityDetailType

from resources.es_activity_index import ESActivityIndex

class LabbookIndexer:
#  Adds the records of a labbok to an index.

    def __init__(self, index_name: str, server: str, labbook: LabBook) -> None:
        """
            Connect to the elasticsearch server and determine if the index exists.

            Args:
                index_name -- name of index
                server -- an elasticsearch compatibale server descriptor
                labbook(LabBook) -- needed to lookup commits

            Returns:
                None
        """
        self.aidx = ESActivityIndex(index_name, server)
        self.index_exists = self.aidx.exists() 
        self.labbook = labbook
        self.index_name = index_name

    def index(self) -> None:
        """Index a labbook for the first time. 
            A tiny bit more efficient if it has never been indexed.

            You probably want to use update.
        """ 
        ars = ActivityStore(self.labbook)
        # Iterate over activity records and store them.
        for rec in ars.get_activity_records():
            self.aidx.add(rec, self.labbook.name, self.labbook)

        self.aidx.flush()
    
    def update_index(self) -> None:
        """Update the contents of an index.

            This is almost as efficient as add and eliminates duplicates.
        """ 
        ars = ActivityStore(self.labbook)
        # Iterate over activity records and store them.
        for rec in ars.get_activity_records():
            self.aidx.add_if_doesnt_exist(rec, self.labbook.name, self.labbook)
