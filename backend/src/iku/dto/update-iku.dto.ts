import { PartialType } from '@nestjs/swagger';
import { CreateIkuDto } from './create-iku.dto.js';

export class UpdateIkuDto extends PartialType(CreateIkuDto) {}
