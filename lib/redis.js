import { Redis } from "@upstash/redis";

export const redis = Redis.fromEnv();

export const ROOM_TTL_SECONDS = 60 * 60 * 24; // rooms auto-expire after 24h of inactivity
