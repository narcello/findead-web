REPO_URL=$1
REPO_NAME=$2
FILE_OUTPUT=$3

cd ~
git clone $REPO_URL
findead -r $REPO_NAME > ~/cache_results/$FILE_OUTPUT
rm -rf "$REPO_NAME"