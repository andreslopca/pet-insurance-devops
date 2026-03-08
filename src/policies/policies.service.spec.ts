import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PoliciesService } from './policies.service';

describe('PoliciesService', () => {
  let service: PoliciesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PoliciesService],
    }).compile();

    service = module.get<PoliciesService>(PoliciesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll should return an array', () => {
    expect(Array.isArray(service.findAll())).toBe(true);
  });

  it('should create a policy', () => {
    const policy = service.create({
      customerId: 'cust-uuid',
      petId: 'pet-uuid',
      coverageType: 'basic',
      price: 29.99,
    });
    expect(policy).toHaveProperty('id');
    expect(policy.coverageType).toBe('basic');
  });

  it('should throw NotFoundException for unknown id', () => {
    expect(() => service.findOne('no-such-id')).toThrow(NotFoundException);
  });

  it('should return policies by customer', () => {
    service.create({ customerId: 'cust-a', petId: 'pet-1', coverageType: 'premium', price: 99 });
    const result = service.findByCustomer('cust-a');
    expect(result.every((p) => p.customerId === 'cust-a')).toBe(true);
  });
});
