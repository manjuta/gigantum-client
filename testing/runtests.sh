

if [ -z $1 ]; then
  echo "Usage: $0 <username> <access_token> <id_token>"
  exit 1  
fi

if [ -z $2 ]; then
  echo "Usage: $0 <username> <access_token> <id_token>"
  exit 1
fi

if [ -z $3 ]; then
  echo "Usage: $0 <username> <access_token> <id_token>"
  exit 1
fi

export USERNAME=$1
export ACCESS_TOKEN=$2
export ID_TOKEN=$3

ls Test_*.py | while read testfile
do
  echo "::: Running test $testfile ..."
  python3 $testfile
done

echo "Running cleanup..."
python3 Post_Cleanup.py
