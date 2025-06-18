import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';
import { MetadataResponse } from '../../../shared/http/response/metadata.response';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  login: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  // @Matches('^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$')
  senha: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  nome: string;
}

export class RegisterResponseDtoData {
  @ApiProperty()
  id: number;

  @ApiProperty()
  login: string;

  @ApiProperty()
  nome: string;

  @ApiProperty()
  criado_em: string;
}

export class IRegisterResponseDto {
  @ApiProperty()
  message: string;

  @ApiProperty()
  data: RegisterResponseDtoData;

  @ApiProperty()
  metadata: MetadataResponse;
}
