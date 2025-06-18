import { IUserRepository } from '../interface/user.repository.interface';
import { ICreateUserRepositoryDto } from '../dto/create-user.repository.dto';
import { User } from '../../../shared/database/entity/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create({
    nome,
    senha,
    login,
  }: ICreateUserRepositoryDto): Promise<User> {
    return await this.userRepository.save({
      nome,
      senha,
      login,
      criado_em: new Date(),
      alterado_em: new Date(),
    });
  }

  async findById(id: number): Promise<User | null> {
    return await this.userRepository.findOne({
      where: {
        id,
      },
    });
  }

  async findByLogin(login: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: {
        login,
      },
    });
  }
}
