import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PetsService } from './pets.service';

describe('PetsService', () => {
  let service: PetsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PetsService],
    }).compile();

    service = module.get<PetsService>(PetsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll should return an array', () => {
    expect(Array.isArray(service.findAll())).toBe(true);
  });

  it('should create a pet', () => {
    const pet = service.create({
      name: 'Rex',
      type: 'Dog',
      age: 2,
      customerId: 'customer-uuid',
    });
    expect(pet).toHaveProperty('id');
    expect(pet.name).toBe('Rex');
  });

  it('should throw NotFoundException for unknown id', () => {
    expect(() => service.findOne('not-a-real-id')).toThrow(NotFoundException);
  });

  it('should return pets by customer', () => {
    service.create({ name: 'Spot', type: 'Dog', age: 1, customerId: 'owner-1' });
    const result = service.findByCustomer('owner-1');
    expect(result.every((p) => p.customerId === 'owner-1')).toBe(true);
  });
});
