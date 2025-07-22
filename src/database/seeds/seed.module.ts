// import { Module } from '@nestjs/common';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { Role } from '../../permissions/entities/role.entity';
// import { Permission } from '../../permissions/entities/permission.entity';
// import { Organization } from '../../organizations/entities/organization.entity';
// import { User } from '../../users/entities/user.entity';
// import { UserRole } from '../../users/entities/user-role.entity';
// import { SeedService } from './seed.service';
// import { SeedCommand } from './seed.command';

// @Module({
//   imports: [
//     TypeOrmModule.forFeature([
//       Role,
//       Permission,
//       Organization,
//       User,
//       UserRole,
//     ]),
//   ],
//   providers: [SeedService, SeedCommand],
//   exports: [SeedService],
// })
// export class SeedModule {}

import { Module } from '@nestjs/common';

@Module({
  // Empty module for now - seeding can be added later
})
export class SeedModule {}