export abstract class IEnvConfigService {
  abstract getDatabaseHost(): string | undefined;
  abstract getDatabaseName(): string | undefined;
  abstract getDatabaseUsername(): string | undefined;
  abstract getDatabasePassword(): string | undefined;
  abstract getDatabasePort(): number | undefined;
  abstract getJwtSecret(): string | undefined;
  abstract getJwtExpire(): string | undefined;
  abstract getEnviroment(): string | undefined;
}
