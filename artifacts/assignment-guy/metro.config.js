const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Block Metro from watching pnpm-store temp directories that expo-secure-store
// creates during postinstall and then removes. Without this, Metro crashes with
// ENOENT when it tries to watch the already-deleted directory.
const blockList = config.resolver.blockList
  ? Array.isArray(config.resolver.blockList)
    ? config.resolver.blockList
    : [config.resolver.blockList]
  : [];

blockList.push(
  // Matches any *_tmp_* directory nested inside a pnpm package dir
  /node_modules\/\.pnpm\/.*_tmp_.*\/.*/,
);

config.resolver.blockList = blockList;

// Monorepo: allow Metro to resolve workspace packages from the repo root
const workspaceRoot = path.resolve(__dirname, '../..');
config.watchFolders = [workspaceRoot];

module.exports = config;
