import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { CustomersService } from './customers.service';

describe('CustomersService', () => {
  let service: CustomersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CustomersService],
    }).compile();

    service = module.get<CustomersService>(CustomersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll should return an array', () => {
    const result = service.findAll();
    expect(Array.isArray(result)).toBe(true);
  });

  it('should create a new customer', () => {
    const customer = service.create({ name: 'Test User', email: 'unique-test@example.com' });
    expect(customer).toHaveProperty('id');
    expect(customer.name).toBe('Test User');
  });

  it('should throw ConflictException for duplicate email', () => {
    service.create({ name: 'User A', email: 'conflict@example.com' });
    expect(() =>
      service.create({ name: 'User B', email: 'conflict@example.com' }),
    ).toThrow(ConflictException);
  });

  it('should throw NotFoundException for unknown id', () => {
    expect(() => service.findOne('non-existent-id')).toThrow(NotFoundException);
  });

  it('should delete an existing customer', () => {
    const customer = service.create({ name: 'To Delete', email: 'delete@example.com' });
    const result = service.remove(customer.id);
    expect(result.message).toContain(customer.id);
  });
});
