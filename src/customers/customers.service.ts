import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { CreateCustomerDto } from './dto/create-customer.dto';

export interface Customer {
  id: string;
  name: string;
  email: string;
}

// In-memory customer store
const customers: Customer[] = [
  { id: uuidv4(), name: 'Alice Johnson', email: 'alice@example.com' },
  { id: uuidv4(), name: 'Bob Martinez', email: 'bob@example.com' },
];

@Injectable()
export class CustomersService {
  findAll(): Customer[] {
    return customers;
  }

  findOne(id: string): Customer {
    const customer = customers.find((c) => c.id === id);
    if (!customer) {
      throw new NotFoundException(`Customer with id ${id} not found`);
    }
    return customer;
  }

  create(dto: CreateCustomerDto): Customer {
    const existing = customers.find((c) => c.email === dto.email);
    if (existing) {
      throw new ConflictException('Customer with this email already exists');
    }
    const customer: Customer = { id: uuidv4(), ...dto };
    customers.push(customer);
    return customer;
  }

  remove(id: string): { message: string } {
    const index = customers.findIndex((c) => c.id === id);
    if (index === -1) {
      throw new NotFoundException(`Customer with id ${id} not found`);
    }
    customers.splice(index, 1);
    return { message: `Customer ${id} deleted` };
  }
}
