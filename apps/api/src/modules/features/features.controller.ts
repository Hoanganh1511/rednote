import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { FeaturesService } from './features.service';
import { ComingSoonFeatureEntity } from './coming-soon-feature.entity';
import { HomeNavTabEntity } from './home-nav-tab.entity';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('features')
@Controller('features')
export class FeaturesController {
  constructor(private readonly featuresService: FeaturesService) {}

  @Public()
  @Get('coming-soon')
  @ApiOperation({ summary: 'Get all enabled coming-soon features' })
  findComingSoon(): Promise<ComingSoonFeatureEntity[]> {
    return this.featuresService.findEnabled();
  }

  @Public()
  @Get('home-nav-tabs')
  @ApiOperation({ summary: 'Tab điều hướng dưới header (Post, Video, …)' })
  findHomeNavTabs(): Promise<HomeNavTabEntity[]> {
    return this.featuresService.findHomeNavTabs();
  }
}
