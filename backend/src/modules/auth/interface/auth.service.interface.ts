import { IRegisterResponseDto, RegisterDto } from '../dto/register.dto';
import { ILoginResponseDto, LoginDto } from '../dto/login.dto';

export abstract class IAuthService {
  abstract register(dto: RegisterDto): Promise<IRegisterResponseDto>;
  abstract login(dto: LoginDto): Promise<ILoginResponseDto>;
}
