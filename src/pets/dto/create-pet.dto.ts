import { IsString, IsInt, IsUUID, Min, Max } from 'class-validator';

export class CreatePetDto {
  @IsString()
  name: string;

  @IsString()
  type: string;

  @IsInt()
  @Min(0)
  @Max(30)
  age: number;

  @IsUUID()
  customerId: string;
}
