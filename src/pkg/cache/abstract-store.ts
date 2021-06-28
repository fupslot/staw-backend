import Redis from "ioredis";

export function string2object(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch (_) {
    return null;
  }
}

export function object2string(record: Record<string, unknown>): string {
  return JSON.stringify(record);
}

export abstract class AbstractStore {
  protected store: Redis.Redis;

  constructor(url: string) {
    this.store = new Redis(url);
  }

  close(): void {
    this.store.disconnect();
  }
}
