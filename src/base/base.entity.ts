import { Transform } from 'class-transformer';
import { format } from 'date-fns-tz';
import { es } from 'date-fns/locale';
import {
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Transform(({ value }: { value: string }) => {
    if (!value) return;
    return format(value, 'dd MMMM yyyy', {
      timeZone: 'America/Lima',
      locale: es,
    });
  })
  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', name: 'deleted_at' })
  deletedAt: Date;
}
