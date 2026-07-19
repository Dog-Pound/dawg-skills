#!/usr/bin/env node

import { basename, resolve } from "node:path";
import { lstat, readFile, rename, unlink, writeFile } from "node:fs/promises";

const START = "<!-- dawg-skills:routing:start -->";
const END = "<!-- dawg-skills:routing:end -->";
const check = process.argv.includes("--check");
const positional = process.argv.slice(2).filter((argument) => argument !== "--check");

if (positional.length > 1) {
  throw new Error("usage: sync-agents.mjs [--check] [AGENTS.md]");
}

const target = resolve(positional[0] ?? "AGENTS.md");
const routing = (await readFile(new URL("../references/agents-policy.md", import.meta.url), "utf8")).trimEnd();
const managed = `${START}\n${routing}\n${END}`;

let current = "";
try {
  current = await readFile(target, "utf8");
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}

const starts = current.split(START).length - 1;
const ends = current.split(END).length - 1;
if (starts !== ends || starts > 1 || (starts === 1 && current.indexOf(END) < current.indexOf(START))) {
  throw new Error(`${basename(target)} has malformed or duplicate Dawg Skills routing markers`);
}

let next;
if (starts === 0) {
  const separator = current.endsWith("\n\n") ? "" : current.endsWith("\n") ? "\n" : "\n\n";
  next = current.length === 0 ? `${managed}\n` : `${current}${separator}${managed}\n`;
} else {
  const start = current.indexOf(START);
  const end = current.indexOf(END, start) + END.length;
  next = `${current.slice(0, start)}${managed}${current.slice(end)}`;
}

if (next === current) process.exit(0);
if (check) {
  console.error(`${basename(target)} routing is out of sync`);
  process.exit(1);
}

const temporary = `${target}.${process.pid}.tmp`;
try {
  const mode = await lstat(target).then((details) => {
    if (details.isSymbolicLink()) throw new Error(`${basename(target)} is a symbolic link`);
    return details.mode;
  }).catch((error) => {
    if (error.code === "ENOENT") return 0o666;
    throw error;
  });
  await writeFile(temporary, next, { flag: "wx", mode });
  await rename(temporary, target);
} finally {
  await unlink(temporary).catch((error) => {
    if (error.code !== "ENOENT") throw error;
  });
}
