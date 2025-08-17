import type { Version } from "@/types.ts";
import type { FastifyPluginCallback } from "fastify";
import { collectionRoutes } from "./collection.ts";

type Options = {
  versions: Record<string, Version>;
};

export const versionRoutes: FastifyPluginCallback<Options> = (
  app,
  { versions },
  done,
) => {
  for (const [prefix, version] of Object.entries(versions)) {
    app.register(collectionRoutes, {
      prefix: `/${prefix}`,
      version,
    });
  }

  done();
};
