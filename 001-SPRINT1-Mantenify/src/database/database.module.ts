import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import config from '../config/config';

@Module({
  imports: [
    // Cargar variables de entorno y config.ts
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
      envFilePath:
        process.env.NODE_ENV === 'prod'
          ? '.prod.env'
          : process.env.NODE_ENV === 'stg'
          ? '.stg.env'
          : '.env',
    }),

    // Conexión a PostgreSQL con TypeORM
    TypeOrmModule.forRootAsync({
      name: 'default',
      inject: [config.KEY],
      useFactory: (cfg: ConfigType<typeof config>) => {
        const { postgres } = cfg;
        return {
          type: 'postgres' as const,
          host: postgres.host,
          port: postgres.port,
          username: postgres.user,
          password: postgres.password,
          database: postgres.dbName,
          synchronize: true,          // SOLO en desarrollo
          autoLoadEntities: true,     // Detecta entities automáticamente
          ssl: { rejectUnauthorized: false }, // Para RDS con SSL
          // logging: true,           // Descomenta para ver queries
        };
      },
    }),
  ],
  providers: [],
  exports: [],
})
export class DatabaseModule {}
