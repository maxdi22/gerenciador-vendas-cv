import { createServer as createViteServer } from "vite";
import { config as serverConfig } from "./server/config";
import app from "./server/app";

async function startServer() {
  const PORT = Number(serverConfig.PORT) || 3000;

  // Vite middleware for development
  if (serverConfig.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
