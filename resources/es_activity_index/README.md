
## `activity_index.py`

Manipulate an index of activity and detail records given a target server and a index name.
For `index_name` the routine creates two indices:
* `f"{index_name}_activity"`
* `f"{index_name}_detail"`
that are queried independently. Separate indices prevent the details from polluting the
activity index.

### schema notes

The activity mapping contains all activity metadata and:
  * a argument-defined project name -- that should be used to connect records to a project
The detail mapping contains all detail metadata and additional fields that all search results
from the detail index alone useful in looking up projects and activity records.
  * project name
  * timestamp -- to search by time
  * commit and linked commit -- to connect to activity records

### other notes

plaintex indexing does not work well with punctuation seperated fields, e.g.
`text/markdown`.  To search for this search for the term `markdown`.

Searching for `text/markdown` will return matches to `text` and `markdown`.

## `labbook_index.py`

Simple routines that take a labbook and indexes the checked out branch.
Note that insertion routines are not deduplicating. If you `add` a record twice, 
you get two hits in the index.

So, we should probably always use the update routine.

## ./scripts

Shows how one might use `labbook_indexer`  and `activity_search` to manipulate
an index called `global_index`.

## Timing

_Conclusion_: insert costs much more than query.  So, `add_if_doesnt_exist()`
is efficient enough for one at a time interfaces.  There are also bulk interfaces
for insert that we should consider for initial indexing?

On my macbook
  add = 33 seconds for 750 records
  add = 33s for 750 more on 750 
  update = 4.5s 750 redundant records 
  update = 34s for 750 new

The way to do this efficiently as needed is probably to:
  (1) query for existence one by one
  (2) build a batch of objects that don't exist.
I can prototype this.

## Usage notes

To run tests and experiment,

Run elasticsearch in another container.
`docker run -p 9200:9200 -p 9300:9300 --name="elasticsearch" -e "discovery.type=single-node" docker.elastic.co/elasticsearch/elasticsearch:6.6.0`

You will need to grab the IP address, something like 172.17.0.2
`docker inspect ...`

Run a gigantum environment
`gtm dev start`
Log into the environment as root -- with docker exec
Install elasticsearch in the container
`pip3 install elasticsearch`  

Then, I go to the gigantum user `/opt/setup.sh`
in `./resources/es_activity_index/tests`
you need to hardwire the IP address.

Then you can run tests or play with scripts using the IP of the elasticsearch container.

### Interacting with ElasticSearch

You can query the search interface in many ways to see what's in the indices.  Through CURL and directly.  Some of the queries that I used are:
* Show all records in an index: `http://localhost:9200/global_index_activity/_search?pretty=true` 
* Show all records a commit message string: `http://localhost:9200/global_index_activity/_search?q=commit_message:nolinkedcommit`

