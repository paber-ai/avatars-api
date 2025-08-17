import { Version } from "@/types.ts";

export async function getVersions(): Promise<Record<string, Version>> {
  const versions: Record<string, Version> = {};

  versions["x"] = await import("api");

  return versions;
}
