import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

export interface User {
  id: string;
  email: string;
  password: string;
}

// In-memory user store
const users: User[] = [
  {
    id: uuidv4(),
    email: 'admin@petinsurance.com',
    password: bcrypt.hashSync('admin123', 10),
  },
];

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async register(dto: RegisterDto): Promise<{ message: string; userId: string }> {
    const existing = users.find((u) => u.email === dto.email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const hashed = await bcrypt.hash(dto.password, 10);
    const user: User = { id: uuidv4(), email: dto.email, password: hashed };
    users.push(user);

    return { message: 'User registered successfully', userId: user.id };
  }

  async login(dto: LoginDto): Promise<{ access_token: string }> {
    const user = users.find((u) => u.email === dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email };
    const access_token = this.jwtService.sign(payload);

    return { access_token };
  }

  findById(id: string): User | undefined {
    return users.find((u) => u.id === id);
  }
}
