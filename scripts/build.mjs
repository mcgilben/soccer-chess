import path from "node:path";
import { cp, mkdir, rm } from "node:fs/promises";

const root = process.cwd();
const dist = path.join(root, "dist");

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await cp(path.join(root, "index.html"), path.join(dist, "index.html"));
await cp(path.join(root, "frontend"), path.join(dist, "frontend"), { recursive: true });
await cp(path.join(root, "shared"), path.join(dist, "shared"), { recursive: true });

console.log("Build complete: dist/");
