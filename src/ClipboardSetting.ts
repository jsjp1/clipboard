export class ClipboardSetting {
  public redisHost: string;
  public redisPort: number;

  constructor(redisHost: string, redisPort: number) {
    this.redisHost = redisHost;
    this.redisPort = redisPort;
  }
}