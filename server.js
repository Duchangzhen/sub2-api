import http from "node:http";
import https from "node:https";

const PORT = Number(process.env.PORT || 3000);
const UPSTREAM_HOST = process.env.UPSTREAM_HOST || "anyrouter.top";
const UPSTREAM_IP = process.env.UPSTREAM_IP || "47.246.23.200";

const hopByHopHeaders = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
  "host"
]);

function filterHeaders(headers) {
  const result = {};
  for (const [name, value] of Object.entries(headers)) {
    if (!hopByHopHeaders.has(name.toLowerCase())) {
      result[name] = value;
    }
  }
  return result;
}

function writeCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "authorization, content-type, x-requested-with");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
}

const server = http.createServer((req, res) => {
  writeCors(res);

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.url === "/" || req.url === "/health") {
    res.writeHead(200, { "content-type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({
      ok: true,
      upstream: UPSTREAM_HOST,
      pinnedIp: UPSTREAM_IP,
      usage: "Use this service as your OpenAI-compatible base URL, for example /v1/chat/completions."
    }));
    return;
  }

  const upstreamReq = https.request({
    protocol: "https:",
    hostname: UPSTREAM_HOST,
    servername: UPSTREAM_HOST,
    port: 443,
    method: req.method,
    path: req.url,
    headers: {
      ...filterHeaders(req.headers),
      host: UPSTREAM_HOST
    },
    lookup(hostname, options, callback) {
      const done = typeof options === "function" ? options : callback;
      if (options?.all) {
        done(null, [{ address: UPSTREAM_IP, family: 4 }]);
        return;
      }
      done(null, UPSTREAM_IP, 4);
    }
  }, (upstreamRes) => {
    writeCors(res);
    res.writeHead(upstreamRes.statusCode || 502, filterHeaders(upstreamRes.headers));
    upstreamRes.pipe(res);
  });

  upstreamReq.on("error", (error) => {
    res.writeHead(502, { "content-type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({
      error: {
        message: `AnyRouter bridge upstream error: ${error.message}`,
        type: "bridge_error"
      }
    }));
  });

  req.pipe(upstreamReq);
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`AnyRouter bridge listening on ${PORT}; ${UPSTREAM_HOST} -> ${UPSTREAM_IP}`);
});
