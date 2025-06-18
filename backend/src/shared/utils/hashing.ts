import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

export class Hashing {
  static async hashPassword(password: string) {
    const salt = randomBytes(16).toString('hex');
    const buf = (await scryptAsync(password, salt, 32)) as Buffer;
    return `${buf.toString('hex')}.${salt}`;
  }

  static async comparePassword(
    storedPassword: string,
    suppliedPassword: string,
  ): Promise<boolean> {
    const [hashedPassword, salt] = storedPassword.split('.');
    const hashedPasswordBuf = Buffer.from(hashedPassword, 'hex');
    const suppliedPasswordBuf = (await scryptAsync(
      suppliedPassword,
      salt,
      32,
    )) as Buffer;
    return timingSafeEqual(hashedPasswordBuf, suppliedPasswordBuf);
  }
}
