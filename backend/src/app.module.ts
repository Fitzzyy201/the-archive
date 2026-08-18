import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { TokoModule } from './toko/toko.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [AuthModule, PrismaModule, TokoModule, AdminModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
