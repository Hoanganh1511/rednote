import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ComingSoonFeatureEntity } from './coming-soon-feature.entity';
import { HomeNavTabEntity } from './home-nav-tab.entity';

@Injectable()
export class FeaturesService {
  constructor(
    @InjectRepository(ComingSoonFeatureEntity)
    private readonly repo: Repository<ComingSoonFeatureEntity>,
    @InjectRepository(HomeNavTabEntity)
    private readonly homeNavTabRepo: Repository<HomeNavTabEntity>,
  ) {}

  findEnabled(): Promise<ComingSoonFeatureEntity[]> {
    return this.repo.find({ where: { enabled: true } });
  }

  findHomeNavTabs(): Promise<HomeNavTabEntity[]> {
    return this.homeNavTabRepo.find({
      where: { enabled: true },
      order: { sortOrder: 'ASC' },
    });
  }
}
