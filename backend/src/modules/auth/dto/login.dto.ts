import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MetadataResponse } from '../../../shared/http/response/metadata.response';

export class LoginDto {
  @ApiProperty()
  @IsNotEmpty()
  login: string;

  @ApiProperty()
  @IsNotEmpty()
  senha: string;
}

export class LoginResponseDtoData {
  @ApiProperty()
  accessToken: string;
}

export class ILoginResponseDto {
  @ApiProperty()
  message: string;

  @ApiProperty()
  data: LoginResponseDtoData;

  @ApiProperty()
  metadata: MetadataResponse;
}
