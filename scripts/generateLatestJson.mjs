import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PLACEHOLDER_OWNER = "TU_USUARIO";
const BUNDLE_DIR = join("src-tauri", "target", "release", "bundle", "nsis");

function fail(message) {
  console.error(message);
  process.exit(1);
}

const config = JSON.parse(readFileSync(join("src-tauri", "tauri.conf.json"), "utf8"));
const { productName, version } = config;
const endpoint = config.plugins?.updater?.endpoints?.[0] ?? "";
const repository = endpoint.match(/github\.com\/([^/]+\/[^/]+)\//)?.[1];

if (!repository) fail("El endpoint del updater en tauri.conf.json no apunta a un repositorio de GitHub.");
if (repository.startsWith(`${PLACEHOLDER_OWNER}/`)) {
  fail(`Reemplazá ${PLACEHOLDER_OWNER} por tu usuario de GitHub en el endpoint de src-tauri/tauri.conf.json.`);
}

const installerName = `${productName}_${version}_x64-setup.exe`;
const signaturePath = join(BUNDLE_DIR, `${installerName}.sig`);

let signature;
try {
  signature = readFileSync(signaturePath, "utf8").trim();
} catch {
  fail(`No se encontró ${signaturePath}. Compilá primero con la clave de firma configurada.`);
}

const notes = process.argv[2] ?? `${productName} ${version}`;
const manifest = {
  version,
  notes,
  pub_date: new Date().toISOString(),
  platforms: {
    "windows-x86_64": {
      signature,
      url: `https://github.com/${repository}/releases/download/v${version}/${installerName}`,
    },
  },
};

const outputPath = join(BUNDLE_DIR, "latest.json");
writeFileSync(outputPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Generado ${outputPath}`);
console.log(`Subí a la release v${version}: ${installerName} y latest.json`);
