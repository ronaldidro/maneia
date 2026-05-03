import { User } from '@users/entities/user.entity';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import * as bcrypt from 'bcrypt';
import { Role } from '@app/base/role.enum';

export class UserSeeder1777766802586 implements Seeder {
  track = false;

  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<any> {
    const repository = dataSource.getRepository(User);

    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash('admin123', salt);

    await repository.save({
      firstName: 'Ron',
      lastName: 'Didro',
      email: 'admin@maneia.com',
      password: hash,
      role: Role.Admin,
    });
  }
}
