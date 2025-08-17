import cors from "@fastify/cors";
import fastify from "fastify";
import { config } from "./config.ts";
import { versionRoutes } from "./routes/version.ts";
import { parseQueryString } from "./utils/query-string.ts";
import { getVersions } from "./utils/versions.ts";

export const app = async () => {
  const app = fastify({
    logger: config.logger,
    querystringParser: (str) => parseQueryString(str),
    ajv: {
      customOptions: {
        coerceTypes: "array",
        removeAdditional: true,
        useDefaults: false,
      },
    },
    maxParamLength: 1024,
  });

  await app.register(cors);

  app.get("/", function handler(request, reply) {
    return { message: "OK 👍" };
  });

  await app.register(versionRoutes, { versions: await getVersions() });

  return app;
};
