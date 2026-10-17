'use strict';

function versionParts(version) {
  const match = /^v?(\d+)\.(\d+)\.(\d+)$/.exec(String(version || ''));
  return match ? match.slice(1).map(Number) : null;
}

function compareVersions(a, b) {
  const pa = versionParts(a);
  const pb = versionParts(b);
  if (!pa || !pb) return 0;
  for (let i = 0; i < 3; i++) {
    if (pa[i] !== pb[i]) return pa[i] - pb[i];
  }
  return 0;
}

function releasesBehind(releases, currentVersion) {
  let count = 0;
  for (const release of releases) {
    if (release.draft || release.prerelease) continue;
    const version = String(release.tag_name || '').replace(/^v/, '');
    if (version === currentVersion) return count;
    if (compareVersions(version, currentVersion) > 0) count++;
  }
  return count;
}

module.exports = { compareVersions, releasesBehind };
