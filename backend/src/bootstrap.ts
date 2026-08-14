import { initRedis, closeRedis } from "./database/redis/redis";

export async function bootstrapInfrastructure(): Promise<void> {
  await initRedis();
}

export async function shutdownInfrastructure(): Promise<void> {
  await closeRedis();
}
