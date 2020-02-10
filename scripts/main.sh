set -e

REPO_URL=$1
FILE_OUTPUT=$2

git clone $REPO_URL

findead $REPO_URL > $FILE_OUTPUT

rm -rf $REPO_URL