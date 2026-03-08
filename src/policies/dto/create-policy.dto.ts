import { IsUUID, IsString, IsNumber, IsIn, Min } from 'class-validator';

export class CreatePolicyDto {
  @IsUUID()
  customerId: string;

  @IsUUID()
  petId: string;

  @IsString()
  @IsIn(['basic', 'standard', 'premium'])
  coverageType: string;

  @IsNumber()
  @Min(0)
  price: number;
}
