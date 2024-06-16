import { config } from './config.js';
import fastify from 'fastify';
import cors from '@fastify/cors';

import { parseQueryString } from './utils/query-string.js';
import { versionRoutes } from './routes/version.js';
import { getVersions } from './utils/versions.js';
import { loadAllFonts } from './utils/fonts.js';
import { Font } from './types.js';

export const app = async (fonts: Font[]) => {
  const app = fastify({
    logger: config.logger,
    querystringParser: (str) => parseQueryString(str),
    ajv: {
      customOptions: {
        coerceTypes: 'array',
        removeAdditional: true,
        useDefaults: false,
      },
    },
    maxParamLength: 1024,
  });

  app.decorate('fonts', fonts);

  await app.register(cors);

  await app.register(versionRoutes, { versions: await getVersions() });

  return app;
};
