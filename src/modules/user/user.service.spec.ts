import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getModelToken } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { faker } from '@faker-js/faker';

describe('UserService', () => {
  let service: UserService;
  let model: Model<User>;

  const mockUserService = {
    create: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    aggregate: jest.fn(),
  };

  const userDto: CreateUserDto = {
    username: faker.internet.userName(),
    password: faker.internet.password(),
    email: faker.internet.email(),
    role: faker.helpers.enumValue(UserRole),
  };
  const mockUser = {
    ...userDto,
    _id: new mongoose.Types.ObjectId(),
    createdAt: new Date(),
    isActive: true,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    model = module.get<Model<User>>(getModelToken(User.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(model).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      jest.spyOn(model, 'create').mockResolvedValueOnce(mockUser as any);

      const result = await service.create(userDto);

      expect(result).toEqual(mockUser);
    });
  });

  describe('findPagination', () => {
    it('should return pagination information and user data', async () => {
      const page = 1;
      const limit = 10;
      const expectedResult = {
        currentPage: page,
        totalPages: 1,
        data: [mockUser],
        totalItems: 1,
      };
      jest.spyOn(model, 'aggregate').mockResolvedValueOnce([expectedResult]);

      const result = await service.findPagination(page, limit);

      expect(result).toEqual(expectedResult);
    });
  });

  describe('findById', () => {
    it('should find a user by ID', async () => {
      jest.spyOn(model, 'findById').mockResolvedValueOnce(mockUser);

      const result = await service.findById(mockUser._id as any);

      expect(result).toEqual(mockUser);
    });
  });

  // describe('update', () => {
  //   it('should update a user by ID', async () => {
  //     const userId = 'someId';
  //     const updateUserDto: UpdateUserDto = { /* Updated user data */ };
  //     const updatedUser = { /* Updated user data */ };
  //     jest.spyOn(model, 'findByIdAndUpdate').mockResolvedValueOnce(updatedUser as any);

  //     const result = await service.update(userId, updateUserDto);

  //     expect(result).toEqual(updatedUser);
  //   });
  // });

  // describe('remove', () => {
  //   it('should remove a user by ID', async () => {
  //     const userId = 'someId';
  //     const deletedUser = { /* Deleted user data */ };
  //     jest.spyOn(model, 'findByIdAndDelete').mockResolvedValueOnce(deletedUser as any);

  //     const result = await service.remove(userId);

  //     expect(result).toEqual(deletedUser);
  //   });
  // });
});
