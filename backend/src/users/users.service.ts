import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: { userRoles: { include: { role: true } } },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        fullName: true,
        email: true,
        isActive: true,
        institutionId: true,
        createdAt: true,
        updatedAt: true,
        userRoles: { include: { role: true } },
      },
    });
  }

  async create(dto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const roleCode = dto.roleCode ?? 'STAFF';
    let role = await this.prisma.role.findUnique({ where: { roleCode } });
    if (!role) {
      role = await this.prisma.role.create({
        data: { roleCode, roleName: roleCode },
      });
    }

    return this.prisma.user.create({
      data: {
        fullName: dto.fullName,
        email: dto.email,
        passwordHash: hashedPassword,
        institutionId: dto.institutionId,
        userRoles: {
          create: { roleId: role.id },
        },
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        createdAt: true,
        userRoles: { include: { role: true } },
      },
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        isActive: true,
        institutionId: true,
        createdAt: true,
        userRoles: { include: { role: true } },
      },
    });
  }
}