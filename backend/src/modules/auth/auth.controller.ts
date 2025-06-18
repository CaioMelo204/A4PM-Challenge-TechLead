import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { IAuthService } from './interface/auth.service.interface';
import { ILoginResponseDto, LoginDto } from './dto/login.dto';
import { IRegisterResponseDto, RegisterDto } from './dto/register.dto';
import { ApiResponse } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: IAuthService) {}

  @Post('/login')
  @ApiResponse({
    status: 201,
    type: ILoginResponseDto,
  })
  @HttpCode(200)
  login(@Body() loginDto: LoginDto): Promise<ILoginResponseDto> {
    return this.authService.login(loginDto);
  }

  @Post('/register')
  @ApiResponse({
    status: 200,
    type: IRegisterResponseDto,
  })
  register(@Body() registerDto: RegisterDto): Promise<IRegisterResponseDto> {
    return this.authService.register(registerDto);
  }
}
