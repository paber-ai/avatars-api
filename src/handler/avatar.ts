import type { FastifyReply, FastifyRequest } from 'fastify';
import type { Core } from '../types.js';
import { config } from '../config.js';
import { toJpeg, toPng } from '@dicebear/converter';
import { createRequire } from 'node:module';

export type AvatarRequest = {
  Params: {
    format: 'svg' | 'png' | 'jpg' | 'jpeg' | 'json';
    options?: Record<string, any>;
  };
  Querystring: Record<string, any>;
};

export function avatarHandler(core: Core, style: any) {
  const require = createRequire(import.meta.url);

  const fonts = [
    require.resolve('../fonts/inter/inter-regular.otf'),
    require.resolve('../fonts/inter/inter-bold.otf'),
  ];

  return async (
    request: FastifyRequest<AvatarRequest>,
    reply: FastifyReply
  ) => {
    const options = request.query;

    // Validate Size for PNG Format
    if (request.params.format === 'png') {
      options['size'] = options['size']
        ? Math.min(
            Math.max(options['size'], config.png.size.min),
            config.png.size.max
          )
        : config.png.size.default;
    }

    // Validate Size for JPEG Format
    if (request.params.format === 'jpg') {
      options['size'] = options['size']
        ? Math.min(
            Math.max(options['size'], config.jpeg.size.min),
            config.jpeg.size.max
          )
        : config.png.size.default;
    }

    // Define default seed
    options['seed'] = options['seed'] ?? '';

    // Define filename
    reply.header(
      'Content-Disposition',
      `inline; filename="avatar.${request.params.format}"`
    );

    // Create avatar
    const avatar = core.createAvatar(style, options);

    reply.header('X-Robots-Tag', 'noindex');
    reply.header('Cache-Control', `max-age=${config.cacheControl.avatar}`);

    switch (request.params.format) {
      case 'svg':
        reply.header('Content-Type', 'image/svg+xml');

        return avatar.toString();

      case 'png':
        reply.header('Content-Type', 'image/png');

        const png = await toPng(avatar.toString(), {
          includeExif: config.png.exif,
          fonts,
        }).toArrayBuffer();

        return Buffer.from(png);

      case 'jpg':
      case 'jpeg':
        reply.header('Content-Type', 'image/jpeg');

        const jpeg = await toJpeg(avatar.toString(), {
          includeExif: config.jpeg.exif,
          fonts,
        }).toArrayBuffer();

        return Buffer.from(jpeg);

      case 'json':
        reply.header('Content-Type', 'application/json');

        return JSON.stringify(avatar.toJson());
    }
  };
}
