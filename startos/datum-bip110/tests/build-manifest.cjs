const assert = require('node:assert/strict')
const { readFileSync } = require('node:fs')
const { extname, resolve } = require('node:path')
const { manifest } = require('../javascript/index.js')

const dockerfile = readFileSync(resolve(__dirname, '../Dockerfile'), 'utf8')
const defaults = Object.fromEntries(
  [...dockerfile.matchAll(/^ARG (DATUM_[A-Z0-9_]+)=(\S+)$/gm)].map(
    ([, name, value]) => [name, value],
  ),
)
const build = manifest.images.datum.source.dockerBuild
assert.ok(build, 'DATUM image must use the Docker build')
assert.match(defaults.DATUM_COMMIT, /^[a-f0-9]{40}$/)
assert.match(defaults.DATUM_TARBALL_SHA256, /^[a-f0-9]{64}$/)
const effective = { ...defaults, ...build.buildArgs }
for (const name of ['DATUM_COMMIT', 'DATUM_TARBALL_SHA256']) {
  assert.equal(
    effective[name],
    defaults[name],
    `The packaged manifest overrides Dockerfile ${name}`,
  )
}
assert.equal(
  manifest.upstreamRepo,
  `https://github.com/Maveth/datum_gateway/tree/${defaults.DATUM_COMMIT}`,
)
console.log('Packaged manifest uses the Dockerfile source commit and checksum')

for (const [id, dependency] of Object.entries(manifest.dependencies)) {
  const icon = dependency.metadata.icon
  assert.ok(
    !URL.canParse(icon),
    `${id} dependency icon must be bundled locally`,
  )
  assert.equal(extname(icon), '.svg', `${id} dependency icon must be an SVG`)
  const svg = readFileSync(resolve(__dirname, '..', icon), 'utf8')
  assert.match(svg, /<svg\b[^>]*xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)
  assert.match(svg, /<\/svg>\s*$/)
  assert.ok(
    Buffer.byteLength(svg) <= 100 * 1024,
    `${id} icon exceeds the packer limit`,
  )
}
console.log('Packaged manifest references bundled dependency SVG icons')
