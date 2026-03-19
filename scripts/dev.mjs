import http from "node:http";
import path from "node:path";
import { readFile } from "node:fs/promises";

const rootArg = process.argv[2] ?? ".";
const rootDir = path.resolve(process.cwd(), rootArg);
const port = Number(process.env.PORT ?? 5173);

const contentType = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8"
};

function resolveRequestPath(reqUrl) {
  const rawPathname = (reqUrl ?? "/").split("?")[0].split("#")[0];
  const pathname = rawPathname === "/" ? "/index.html" : rawPathname;

  let decodedPath;
  try {
    decodedPath = decodeURIComponent(pathname);
  } catch {
    return { error: 400, message: "Bad request" };
  }

  const relativePath = decodedPath.replace(/^\/+/, "");
  const filePath = path.resolve(rootDir, relativePath);
  const relativeToRoot = path.relative(rootDir, filePath);

  if (relativeToRoot.startsWith("..") || path.isAbsolute(relativeToRoot)) {
    return { error: 403, message: "Forbidden" };
  }

  return { filePath };
}

const server = http.createServer(async (req, res) => {
  const resolvedRequest = resolveRequestPath(req.url);

  if (resolvedRequest.error) {
    res.writeHead(resolvedRequest.error, { "Content-Type": "text/plain; charset=utf-8" });
    res.end(resolvedRequest.message);
    return;
  }

  try {
    const data = await readFile(resolvedRequest.filePath);
    const ext = path.extname(resolvedRequest.filePath);
    res.writeHead(200, { "Content-Type": contentType[ext] ?? "text/plain; charset=utf-8" });
    res.end(data);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
  }
});

server.listen(port, () => {
  console.log(`Serving ${rootDir} at http://localhost:${port}`);
});
