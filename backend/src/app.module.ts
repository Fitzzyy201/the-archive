import { ProdukModule } from './produk/produk.module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { TokoModule } from './toko/toko.module';

@Module({
  imports: [AuthModule, PrismaModule, TokoModule, ProdukModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
