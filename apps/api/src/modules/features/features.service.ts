import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ComingSoonFeatureEntity } from './coming-soon-feature.entity';

@Injectable()
export class FeaturesService {
  constructor(
    @InjectRepository(ComingSoonFeatureEntity)
    private readonly repo: Repository<ComingSoonFeatureEntity>,
  ) {}

  findEnabled(): Promise<ComingSoonFeatureEntity[]> {
    return this.repo.find({ where: { enabled: true } });
  }
}
