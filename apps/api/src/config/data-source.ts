import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config();

const baseDir = path.join(process.cwd(), 'src');

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env['DB_HOST'] ?? 'localhost',
  port: Number(process.env['DB_PORT'] ?? 5432),
  username: process.env['DB_USERNAME'] ?? 'rednote',
  password: process.env['DB_PASSWORD'] ?? 'rednote_password',
  database: process.env['DB_NAME'] ?? 'rednote_db',
  entities: [path.join(baseDir, '**/*.entity{.ts,.js}')],
  migrations: [path.join(baseDir, 'migrations/*{.ts,.js}')],
  synchronize: false,
});
