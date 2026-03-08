import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { CreatePolicyDto } from './dto/create-policy.dto';

export interface Policy {
  id: string;
  customerId: string;
  petId: string;
  coverageType: string;
  price: number;
}

// In-memory policy store
const policies: Policy[] = [
  {
    id: uuidv4(),
    customerId: 'seed-customer-1',
    petId: 'seed-pet-1',
    coverageType: 'standard',
    price: 49.99,
  },
  {
    id: uuidv4(),
    customerId: 'seed-customer-2',
    petId: 'seed-pet-2',
    coverageType: 'premium',
    price: 89.99,
  },
];

@Injectable()
export class PoliciesService {
  findAll(): Policy[] {
    return policies;
  }

  findOne(id: string): Policy {
    const policy = policies.find((p) => p.id === id);
    if (!policy) {
      throw new NotFoundException(`Policy with id ${id} not found`);
    }
    return policy;
  }

  create(dto: CreatePolicyDto): Policy {
    const policy: Policy = { id: uuidv4(), ...dto };
    policies.push(policy);
    return policy;
  }

  findByCustomer(customerId: string): Policy[] {
    return policies.filter((p) => p.customerId === customerId);
  }
}
