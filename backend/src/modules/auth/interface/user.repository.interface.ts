import { ICreateUserRepositoryDto } from '../dto/create-user.repository.dto';
import { User } from '../../../shared/database/entity/user.entity';

export abstract class IUserRepository {
  abstract create(dto: ICreateUserRepositoryDto): Promise<User>;
  abstract findByLogin(login: string): Promise<User | null>;
  abstract findById(id: number): Promise<User | null>;
}
