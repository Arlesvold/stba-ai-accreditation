import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { IkuModule } from './iku/iku.module.js';
import { ResearchModule } from './research/research.module.js';
import { AccreditationModule } from './accreditation/accreditation.module.js';
import { RiskModule } from './risk/risk.module.js';
import { LedModule } from './led/led.module.js';
import { FilesModule } from './files/files.module.js';
import { BkdModule } from './bkd/bkd.module.js';
import { StudentModule } from './student/student.module.js';
import { SpmiModule } from './spmi/spmi.module.js';
import { CooperationModule } from './cooperation/cooperation.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    IkuModule,
    ResearchModule,
    AccreditationModule,
    RiskModule,
    LedModule,
    FilesModule,
    BkdModule,
    StudentModule,
    SpmiModule,
    CooperationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
