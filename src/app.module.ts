import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';

import { UserGetController } from './controller/get.controller';
import { UserPostController } from './controller/post.controller';
import { HelperModule } from './helper/helper.module';
import { CronJobService } from './service/cron-job.service';
import { UserService } from './service/user.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    HelperModule,
  ],
  controllers: [UserGetController, UserPostController],
  providers: [CronJobService, UserService],
})
export class AppModule {}
