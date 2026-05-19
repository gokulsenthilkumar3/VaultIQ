import { IsString, IsNotEmpty, IsUUID, IsNumber, Min, IsDateString } from 'class-validator';

export class CreateAssetDto {
  @IsString()
  @IsNotEmpty()
  tagId!: string;

  @IsString()
  @IsNotEmpty()
  serialNumber!: string;

  @IsString()
  @IsNotEmpty()
  modelName!: string;

  @IsUUID()
  typeId!: string;

  @IsUUID()
  locationId!: string;

  @IsNumber()
  @Min(0)
  purchasePrice!: number;

  @IsDateString()
  purchaseDate!: string;
}
