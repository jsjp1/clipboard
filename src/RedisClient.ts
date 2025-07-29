import { createClient } from 'redis';

export class RedisClient {
  private client;
  private static host: string;
  private static port: number;

  constructor(host: string, port: number) {
    this.client = createClient({
      socket: {
        host: host || RedisClient.host,
        port: port || RedisClient.port,
      },
    });

    this.client.on('error', (err) => console.error('Redis Client Error', err));
  }

  async connect() {
    await this.client.connect();
  }

  async disconnect() {
    await this.client.quit();
  }

  async set(key: string, value: string) {
    await this.client.set(key, value);
  }

  async get(key: string): Promise<string | null> {
    return await this.client.get(key);
  }

  async getAllData(): Promise<Record<string, string>> {
    const keys = await this.client.keys('*');
    const data: Record<string, string> = {};
    
    for (const key of keys) {
      const value = await this.client.get(key);
      if (value !== null) {
        data[key] = value;
      }
    }
    return data;
  }
}