import type { Version } from "@/types.ts";
import { kebabCase } from "change-case";
import type { FastifyPluginCallback } from "fastify";
import { styleRoutes } from "./style.ts";

type Options = {
  version: Version;
};

export const collectionRoutes: FastifyPluginCallback<Options> = (
  app,
  { version },
  done,
) => {
  for (const [prefix, style] of Object.entries(version.collection)) {
    app.register(styleRoutes, {
      prefix: `/${kebabCase(prefix)}`,
      core: version.core,
      style,
    });
  }

  done();
};
