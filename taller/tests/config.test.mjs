import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../..", import.meta.url));

test("el taller vive fuera de src y el sitio es Astro", () => {
  assert.ok(existsSync(join(ROOT, "astro.config.mjs")), "falta astro.config.mjs");
  assert.ok(existsSync(join(ROOT, "taller", "server.mjs")), "falta taller/server.mjs");
  assert.equal(existsSync(join(ROOT, "src", "taller")), false, "el taller no debe quedar dentro de src");
  assert.equal(existsSync(join(ROOT, "_config.yml")), false, "este repo no usa Jekyll");
});
