import cluster from "node:cluster";
import { app } from "./app.ts";
import { config } from "./config.ts";

const useCluster = config.workers > 1;

if (cluster.isPrimary && useCluster) {
  for (let i = 0; i < config.workers; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.log(
      `Worker ${worker.process.pid} died with code ${code} and signal ${signal}`,
    );

    // Fork a new worker
    cluster.fork();
  });
} else {
  console.log(`Worker ${Deno.pid} started`);

  const server = await app();

  server.listen(
    {
      port: config.port,
      host: config.host,
    },
    (err) => {
      if (err) {
        server.log.error(err);
        Deno.exit(1);
      }

      console.info(`Server listening at http://${config.host}:${config.port}`);
    },
  );
}
