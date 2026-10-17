'use strict';

const assert = require('node:assert/strict');
const { test } = require('node:test');
const { compareVersions, releasesBehind } = require('../release-utils');

test('compares Quill release versions numerically', () => {
  assert.equal(compareVersions('v1.10.0', '1.9.9') > 0, true);
  assert.equal(compareVersions('1.5.0', 'v1.5.0'), 0);
  assert.equal(compareVersions('1.4.9', '1.5.0') < 0, true);
});

test('counts published releases since the installed version', () => {
  const releases = [
    { tag_name: 'v1.8.0' },
    { tag_name: 'v1.7.0' },
    { tag_name: 'v1.6.0' },
    { tag_name: 'v1.5.0' },
    { tag_name: 'v1.4.0' }
  ];
  assert.equal(releasesBehind(releases, '1.5.0'), 3);
  assert.equal(releasesBehind(releases.slice(3), '1.5.0'), 0);
});

test('ignores drafts and prereleases and counts ten released versions', () => {
  const releases = [
    { tag_name: 'v1.11.0', draft: true },
    { tag_name: 'v1.10.0-beta.1', prerelease: true },
    ...Array.from({ length: 10 }, (_, i) => ({ tag_name: `v1.${10 - i}.0` })),
    { tag_name: 'v1.0.0' }
  ];
  assert.equal(releasesBehind(releases, '1.0.0'), 10);
  assert.equal(releasesBehind(releases.slice(3), '1.0.0'), 9);
});

test('counts newer releases if the installed version is not in this repository', () => {
  assert.equal(releasesBehind([
    { tag_name: 'v2.0.0' },
    { tag_name: 'v1.9.0' },
    { tag_name: 'v1.0.0' }
  ], '1.5.0'), 2);
});
