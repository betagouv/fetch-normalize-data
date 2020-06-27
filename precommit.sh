#!/bin/bash

# ------
# ESLint Checking using script
#
# If git is reporting that your prettified files are still modified
# after committing, you may need to add a post-commit script
# to update git's index as described in this issue.
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E ".js$|.jsx$")
if [[ "$STAGED_FILES" = "" ]]; then
    exit 0
fi

for FILE in $STAGED_FILES
do
  FILE_PATH=$PWD/$FILE
  ./node_modules/.bin/eslint --quiet --max-warnings 0 "$FILE_PATH"
  if [[ "$?" == 0 ]]; then
    echo "\t\033[32mESLint Passed: $FILE\033[0m"
  else
    echo "\t\033[41mESLint Failed: $FILE\033[0m"
    exit 1
  fi
done

# Prettify all staged .js files
echo "$STAGED_FILES" | xargs ./node_modules/.bin/prettier-eslint --eslint-config-path $PWD/.eslintrc.json --config $PWD/.prettierrc.json --list-different --write
# Add back the modified/prettified files to staging
echo "$STAGED_FILES" | xargs git add

exit 0
