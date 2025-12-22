import { Injectable, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    // Email kontrolü
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Bu e-posta adresi zaten kullanılıyor');
    }

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Kullanıcı oluştur
    const user = await this.prisma.user.create({
      data: {
        email: createUserDto.email,
        password: hashedPassword,
        name: createUserDto.name,
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        phone: createUserDto.phone,
        birthDate: createUserDto.birthDate,
      },
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        createdAt: true,
        password: false, // Şifreyi döndürme
      },
    });

    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        phone: true,
        birthDate: true,
        role: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        password: false,
      },
    });

    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı');
    }

    return user;
  }

  async validateUser(email: string, password: string) {
    const user = await this.findByEmail(email);
    
    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return null;
    }

    // Şifreyi döndürmeden kullanıcıyı döndür
    const { password: _, ...result } = user;
    return result;
  }

  async findAll(search?: string, limit?: number, offset?: number) {
    const where: any = {};
    
    // Arama kriterleri
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          firstName: true,
          lastName: true,
          phone: true,
          birthDate: true,
          role: true,
          isActive: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
          password: false,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip: offset,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      items,
      total,
      limit: limit || items.length,
      offset: offset || 0,
    };
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.findById(id);
    
    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        phone: true,
        birthDate: true,
        role: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        password: false,
      },
    });
  }

  async remove(id: string, currentUserId: string) {
    const user = await this.findById(id);
    
    // Kendi kendini silmesini engelle
    if (id === currentUserId) {
      throw new ForbiddenException('Kendi hesabınızı silemezsiniz');
    }
    
    // Admin kullanıcıyı silmeyi engelle (güvenlik için)
    if (user.role === 'ADMIN') {
      throw new ForbiddenException('Admin kullanıcılar silinemez');
    }

    return this.prisma.user.delete({
      where: { id },
    });
  }

  async getStats() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [total, thisMonth, lastMonth] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({
        where: {
          createdAt: {
            gte: startOfMonth,
          },
        },
      }),
      this.prisma.user.count({
        where: {
          createdAt: {
            gte: startOfLastMonth,
            lte: endOfLastMonth,
          },
        },
      }),
    ]);

    const change = thisMonth - lastMonth;

    return {
      total,
      thisMonth,
      lastMonth,
      change,
    };
  }
}
