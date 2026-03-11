/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { IdpModule } from './idp/idp.module';
import { LnaModule } from './lna/lna.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (cfg: ConfigService) => ({
        type: 'postgres',
        host:     cfg.get('DB_HOST'),
        port:    +cfg.get('DB_PORT'),
        username: cfg.get('DB_USERNAME'),
        password: cfg.get('DB_PASSWORD'),
        database: cfg.get('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,  // Creates tables automatically in dev.
                            // Set to false before going to production.
      }),
      inject: [ConfigService],
    }),
    IdpModule,
    LnaModule,
    AuthModule,
    UsersModule,
    // Feature modules go here — added in Section 6
  ],
})
export class AppModule {}