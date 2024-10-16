import { Module } from '@nestjs/common';

import { PrismaService } from './prisma.service';
import { HelperService } from './helper.service';
import { EmailClass } from './classes/email';
import { Web3Class } from './classes/web3';

@Module({
  controllers: [],
  providers: [PrismaService, HelperService, EmailClass, Web3Class],
  exports: [PrismaService, HelperService]
})

export class HelperModule { }
