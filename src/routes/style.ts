import { config } from "@/config.ts";
import { AvatarRequest, avatarHandler } from "@/handler/avatar.ts";
import { schemaHandler } from "@/handler/schema.ts";
import type { Core } from "@/types.ts";
import { parseQueryString } from "@/utils/query-string.ts";
import type { FastifyPluginCallback } from "fastify";
import type { JSONSchema7 } from "json-schema";

type Options = {
  core: Core;
  style: any;
};

const paramsSchema: JSONSchema7 = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    format: {
      type: "string",
      enum: [
        "svg",
        ...(config.png.enabled ? ["png"] : []),
        ...(config.jpeg.enabled ? ["jpg", "jpeg"] : []),
        ...(config.webp.enabled ? ["webp"] : []),
        ...(config.avif.enabled ? ["avif"] : []),
        ...(config.json.enabled ? ["json"] : []),
      ],
    },
  },
};

export const styleRoutes: FastifyPluginCallback<Options> = (
  app,
  { core, style },
  done,
) => {
  const optionsSchema: JSONSchema7 = {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    properties: {
      ...core.schema.properties,
      ...style.schema?.properties,
    },
  };

  app.route({
    method: "GET",
    url: "/schema.json",
    handler: schemaHandler(optionsSchema),
  });

  app.route<AvatarRequest>({
    method: "GET",
    url: "/:format",
    schema: {
      querystring: optionsSchema,
      params: paramsSchema,
    },
    handler: avatarHandler(app, core, style),
  });

  app.route<AvatarRequest>({
    method: "GET",
    url: "/:format/:options",
    preValidation: async (request) => {
      if (typeof request.params.options === "string") {
        request.query = parseQueryString(request.params.options);
      }
    },
    schema: {
      querystring: optionsSchema,
      params: paramsSchema,
    },
    handler: avatarHandler(app, core, style),
  });

  done();
};
