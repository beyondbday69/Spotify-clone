import express from "express";
import { createServer as createViteServer } from "vite";
import { createProxyMiddleware } from "http-proxy-middleware";
import path from "path";
import cors from "cors";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());

  // Proxy YouTube API
  app.use(
    "/api/yt",
    createProxyMiddleware({
      target: "https://yt-api-ten.vercel.app/api",
      changeOrigin: true,
      secure: false,
      pathRewrite: {
        "^/api/yt": "", // strip /api/yt from the URL
      },
    })
  );

  // Proxy Saavn API
  app.use(
    "/api/saavn",
    createProxyMiddleware({
      target: "https://musicapi-gray.vercel.app/api",
      changeOrigin: true,
      secure: false,
      pathRewrite: {
        "^/api/saavn": "", // strip /api/saavn from the URL
      },
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
