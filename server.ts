import express from "express";
import { createServer as createViteServer } from "vite";
import { createProxyMiddleware } from "http-proxy-middleware";
import path from "path";
import cors from "cors";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());

  // Proxy API requests to the HTTP backend
  app.use(
    "/api",
    createProxyMiddleware({
      target: "http://103.190.92.19:8000",
      changeOrigin: true,
      pathRewrite: {
        "^/api": "", // strip /api from the URL
      },
      on: {
        error: (err, req, res) => {
          console.error("Proxy Error:", err);
          const response = res as any;
          if (response.headersSent === false && typeof response.status === 'function') {
            response.status(500).send("Proxy Error");
          }
        },
        proxyRes: (proxyRes, req, res) => {
          proxyRes.headers['access-control-allow-origin'] = '*';
        }
      }
    })
  );

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
