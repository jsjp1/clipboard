import { RedisClientType } from '@redis/client';
import { createClient } from 'redis';

export class RedisClient {
  public isConnected: boolean = false;
  private client!: RedisClientType;
  private host: string;
  private port: number;
  private static hasLoggedConnectionError = false;

  constructor(host: string, port: number) {
    this.host = host;
    this.port = port;
  }

  async connect(): Promise<void> {
    this.client = createClient({
      socket: {
        host: this.host,
        port: this.port,
      }
    });

    this.client.on('error', (err) => {
      if (!RedisClient.hasLoggedConnectionError) {
        if (err?.code === 'ECONNREFUSED') {
          console.warn('\n\n######################\nRedis is not running. Skipping Redis features.\n######################\n\n');
        } else {
          console.error('Redis Client Error:', err);
        }
        RedisClient.hasLoggedConnectionError = true;
        throw err;
      }
    });

    this.client.connect().then(() => {
      this.isConnected = true;
      RedisClient.hasLoggedConnectionError = false;
      console.log('\n\n######################\nRedis client connected: %s:%i.\n######################\n\n', this.host, this.port);
    });
  }

  async disconnect() {
    await this.client.quit();
    this.isConnected = false;
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

  async delete(key: string) {
    await this.client.del(key);
  }
}
