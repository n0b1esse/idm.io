import { closePool } from "./infrastructure/database/pool.js";
import { createApp } from "./presentation/http/server.js";

const port = Number(process.env.PORT ?? 3000);
const app = createApp();

const server = app.listen(port, () => {
  console.log(`idm-backend listening on http://localhost:${port}`);
});

function shutdown() {
  server.close(async () => {
    await closePool();
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
