import assert from "node:assert/strict";
import { mkdtemp, readFile, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";

const script = fileURLToPath(new URL("./sync-agents.mjs", import.meta.url));

async function fixture(content = "") {
  const directory = await mkdtemp(join(tmpdir(), "dawg-routing-"));
  const target = join(directory, "AGENTS.md");
  if (content) await writeFile(target, content);
  return target;
}

function run(target, ...arguments_) {
  return spawnSync(process.execPath, [script, ...arguments_, target], { encoding: "utf8" });
}

test("appends, replaces, checks, and rejects unsafe marker state", async () => {
  const target = await fixture("# Local policy\n \n");

  assert.equal(run(target).status, 0);
  const installed = await readFile(target, "utf8");
  assert.match(installed, /^# Local policy\n \n\n<!-- dawg-skills:routing:start -->/);
  assert.equal(run(target, "--check").status, 0);

  await writeFile(target, installed.replace("## Required routing", "## Stale routing"));
  assert.equal(run(target, "--check").status, 1);
  assert.equal(run(target).status, 0);
  assert.match(await readFile(target, "utf8"), /## Required routing/);

  await writeFile(target, `${installed}\n<!-- dawg-skills:routing:start -->\n`);
  const unsafe = run(target);
  assert.notEqual(unsafe.status, 0);
  assert.match(unsafe.stderr, /malformed or duplicate/);

  const linked = await fixture();
  const source = `${linked}.source`;
  await writeFile(source, "# Source\n");
  await symlink(source, linked);
  const symbolic = run(linked);
  assert.notEqual(symbolic.status, 0);
  assert.match(symbolic.stderr, /symbolic link/);
});
