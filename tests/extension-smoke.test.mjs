import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { test } from "node:test";

const root = new URL("../", import.meta.url);
const readRootFile = (file) => readFile(new URL(file, root), "utf8");

test("extension package contains Chrome and Firefox background entries", async () => {
  const manifest = JSON.parse(await readRootFile("manifest.json"));
  assert.equal(manifest.background.service_worker, "background.js");
  assert.deepEqual(manifest.background.scripts, ["timer-engine.js", "background.js"]);
  assert.ok(manifest.permissions.includes("notifications"));
  assert.ok(manifest.permissions.includes("offscreen"));
});

test("extension package contains audio runtime assets", async () => {
  for (const file of ["audio.html", "audio.js", "icon-128.png", "sounds/ring-1.mp3", "sounds/ring-2.mp3", "sounds/ring-3.mp3"]) {
    await access(new URL(`../${file}`, import.meta.url));
  }
});

test("popup references its runtime styles and script", async () => {
  const html = await readRootFile("popup.html");
  assert.match(html, /popup\.css/);
  assert.match(html, /popup\.js/);
});
