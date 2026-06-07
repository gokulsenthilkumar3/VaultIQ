import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { IsEmail, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AuthService } from './auth.service';

class DevLoginDto {
  @ApiProperty({ example: 'admin@vaultiq.dev' })
  @IsEmail()
  email!: string;
}

class RefreshTokenDto {
  @ApiProperty({ description: 'Refresh token obtained from /auth/dev-login or /auth/azure-callback' })
  @IsString()
  @IsNotEmpty()
  refresh_token!: string;
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('dev-login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Dev only] Login with an email — disabled in production' })
  async devLogin(@Body() dto: DevLoginDto) {
    return this.authService.devLogin(dto.email);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Exchange a refresh token for a new access + refresh token pair' })
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto.refresh_token);
  }
}
