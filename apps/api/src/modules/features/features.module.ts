import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComingSoonFeatureEntity } from './coming-soon-feature.entity';
import { HomeNavTabEntity } from './home-nav-tab.entity';
import { FeaturesService } from './features.service';
import { FeaturesController } from './features.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ComingSoonFeatureEntity, HomeNavTabEntity])],
  controllers: [FeaturesController],
  providers: [FeaturesService],
})
export class FeaturesModule {}
