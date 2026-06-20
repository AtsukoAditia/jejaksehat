import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const serviceWorker = readFileSync("public/sw.js", "utf8");
const manifest = readFileSync("app/manifest.ts", "utf8");

test("service worker excludes API requests and only caches public navigations", () => {
  assert.match(serviceWorker, /url\.pathname\.startsWith\("\/api\/"\)/);
  assert.match(serviceWorker, /\["\/", "\/offline"\]\.includes\(pathname\)/);
  assert.doesNotMatch(serviceWorker, /dashboard[\s\S]*cache\.put/);
});

test("manifest declares standalone PNG and maskable icons", () => {
  assert.match(manifest, /display: "standalone"/);
  assert.match(manifest, /sizes: "192x192"/);
  assert.match(manifest, /sizes: "512x512"/);
  assert.match(manifest, /purpose: "maskable"/);
});
