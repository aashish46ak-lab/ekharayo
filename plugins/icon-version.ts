import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import type { Plugin } from "vite";

const ICONS = [
  "icon-192.png",
  "icon-512.png",
  "icon-192-maskable.png",
  "icon-512-maskable.png",
  "favicon.png",
];

function hashOf(file: string): string {
  try {
    return crypto.createHash("md5").update(fs.readFileSync(file)).digest("hex").slice(0, 8);
  } catch {
    return "0";
  }
}

/**
 * Appends a content hash query to every app icon + manifest reference so a
 * changed logo is re-fetched by browsers and by already-installed PWAs
 * instead of being served from an install-time / HTTP cache.
 */
export function iconVersion(publicDir = "public", outDir = "dist"): Plugin {
  const hashes = new Map<string, string>();

  const computeHashes = () => {
    for (const icon of ICONS) hashes.set(icon, hashOf(path.resolve(publicDir, icon)));
  };

  const versioned = (name: string) => `/${name}?v=${hashes.get(name) ?? "0"}`;

  return {
    name: "ekharayo-icon-version",
    apply: "build",
    buildStart() {
      computeHashes();
    },
    transformIndexHtml(html) {
      let out = html
        .replace(/href="\/favicon\.png"/g, `href="${versioned("favicon.png")}"`)
        .replace(/href="\/icon-512\.png"/g, `href="${versioned("icon-512.png")}"`);
      const manifestHash = [...hashes.values()].join("").slice(0, 12);
      out = out.replace(/href="\/manifest\.webmanifest"/g, `href="/manifest.webmanifest?v=${manifestHash}"`);
      return out;
    },
    closeBundle() {
      // Runs after Vite copies `public/` into the build output.
      const manifestPath = path.resolve(outDir, "manifest.webmanifest");
      if (!fs.existsSync(manifestPath)) return;
      const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
      if (Array.isArray(manifest.icons)) {
        manifest.icons = manifest.icons.map((icon: { src: string }) => {
          const name = icon.src.replace(/^\//, "").split("?")[0];
          return hashes.has(name) ? { ...icon, src: versioned(name) } : icon;
        });
      }
      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    },
  };
}
