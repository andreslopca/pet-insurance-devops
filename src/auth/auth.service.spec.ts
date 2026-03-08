import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mocked-token'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const result = await service.register({
        email: 'test-unique@example.com',
        password: 'password123',
      });
      expect(result).toHaveProperty('userId');
      expect(result.message).toBe('User registered successfully');
    });

    it('should throw ConflictException for duplicate email', async () => {
      await service.register({ email: 'dup@example.com', password: 'pass123' });
      await expect(
        service.register({ email: 'dup@example.com', password: 'pass123' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should return a token for valid credentials', async () => {
      await service.register({ email: 'login@example.com', password: 'pass123' });
      const result = await service.login({ email: 'login@example.com', password: 'pass123' });
      expect(result).toHaveProperty('access_token', 'mocked-token');
    });

    it('should throw UnauthorizedException for unknown email', async () => {
      await expect(
        service.login({ email: 'nobody@example.com', password: 'pass' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      await service.register({ email: 'badpass@example.com', password: 'correct' });
      await expect(
        service.login({ email: 'badpass@example.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
