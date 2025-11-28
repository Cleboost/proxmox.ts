BASE_VERSION=$(bun -p "require('./package.json').version")
COMMIT_HASH=$(git rev-parse --short HEAD)
NEW_VERSION="$BASE_VERSION-rc.$COMMIT_HASH"
npm version $NEW_VERSION --no-git-tag-version
bun publish --tag rc