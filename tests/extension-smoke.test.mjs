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
  assert.ok(manifest.permissions.includes("tabs"));
  assert.deepEqual(manifest.content_scripts[0].js, ["content.js"]);
  assert.deepEqual(manifest.content_scripts[0].css, ["content.css"]);
  assert.equal(manifest.commands["toggle-timer"].suggested_key.default, "Ctrl+Shift+F");
  assert.equal(manifest.commands["skip-phase"].suggested_key.default, "Ctrl+Shift+K");
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

test("package includes backup and theme behavior", async () => {
  const background = await readRootFile("background.js");
  const popup = await readRootFile("popup.js");
  const css = await readRootFile("popup.css");
  assert.match(background, /EXPORT_DATA/);
  assert.match(background, /IMPORT_DATA/);
  assert.match(popup, /data-setting="theme"/);
  assert.match(popup, /import-data-file/);
  assert.match(css, /data-theme=\"dark\"/);
});

test("package includes focus mode content assets", async () => {
  await access(new URL("../content.js", import.meta.url));
  await access(new URL("../content.css", import.meta.url));
});
