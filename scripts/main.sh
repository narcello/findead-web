set -e

REPO_URL=$1

git clone $REPO_URL

echo $REPO_URL | grep -o "/.*.git"

rm -rf vocequisdizerlustre