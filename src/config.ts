import { Config } from "./types.ts";

export const config: Config = {
  port: 3000,
  host: "0.0.0.0",
  logger: true,
  workers: 1,
  png: {
    enabled: true,
    size: {
      min: 1,
      max: 256,
      default: 128,
    },
    exif: true,
  },
  jpeg: {
    enabled: true,
    size: {
      min: 1,
      max: 256,
      default: 128,
    },
    exif: true,
  },
  webp: {
    enabled: true,
    size: {
      min: 1,
      max: 256,
      default: 128,
    },
    exif: true,
  },
  avif: {
    enabled:true,
    size: {
      min: 1,
      max: 256,
      default: 128,
    },
    exif: true,
  },
  json: {
    enabled: true,
  },
  versions: ["x"],
  cacheControl: {
    avatar: 60 * 60 * 24 * 365,
  },
};
