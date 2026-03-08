import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { CreatePetDto } from './dto/create-pet.dto';

export interface Pet {
  id: string;
  name: string;
  type: string;
  age: number;
  customerId: string;
}

// In-memory pet store
const pets: Pet[] = [
  {
    id: uuidv4(),
    name: 'Buddy',
    type: 'Dog',
    age: 3,
    customerId: 'seed-customer-1',
  },
  {
    id: uuidv4(),
    name: 'Whiskers',
    type: 'Cat',
    age: 5,
    customerId: 'seed-customer-2',
  },
];

@Injectable()
export class PetsService {
  findAll(): Pet[] {
    return pets;
  }

  findOne(id: string): Pet {
    const pet = pets.find((p) => p.id === id);
    if (!pet) {
      throw new NotFoundException(`Pet with id ${id} not found`);
    }
    return pet;
  }

  create(dto: CreatePetDto): Pet {
    const pet: Pet = { id: uuidv4(), ...dto };
    pets.push(pet);
    return pet;
  }

  findByCustomer(customerId: string): Pet[] {
    return pets.filter((p) => p.customerId === customerId);
  }
}
