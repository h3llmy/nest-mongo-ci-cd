import { Injectable, Logger } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { User } from './entities/user.entity';

/**
 * Service responsible for user-related operations.
 */
@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  /**
   * Creates a new user.
   * @param createUserDto - Data to create the user.
   * @returns The created user without the password field.
   */
  async create({ username, password, email, role }: CreateUserDto) {
    const data = await this.userModel.create({
      username,
      password,
      email,
      role,
    });
    delete data.password;
    this.logger.log(`create user ${JSON.stringify(data)}`);
    return data;
  }

  /**
   * Retrieves users with pagination.
   * @param page - Page number (default: 1).
   * @param limit - Number of users per page (default: 10).
   * @returns Pagination information and user data.
   */
  async findPagination(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [result] = await this.userModel.aggregate([
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: limit }],
          totalItems: [{ $count: 'count' }],
        },
      },
      {
        $project: {
          totalItems: { $arrayElemAt: ['$totalItems.count', 0] },
          data: {
            $map: {
              input: '$data',
              as: 'item',
              in: {
                _id: '$$item._id',
                username: '$$item.username',
                email: '$$item.email',
                role: '$$item.role',
                createdAt: '$$item.createdAt',
                isActive: '$$item.isActive',
              },
            },
          },
        },
      },
    ]);

    const totalPages = isNaN(result.totalItems)
      ? 1
      : Math.ceil(result.totalItems / limit);

    this.logger.log(`get user pagination`);

    return { currentPage: page, totalPages, ...result };
  }

  /**
   * Finds a user by ID.
   * @param id - ID of the data.
   * @returns user document.
   */
  findById(id: ObjectId) {
    return this.userModel.findById(id);
  }

  /**
   * Finds a user by username.
   * @param username - Username of the user.
   * @returns User document.
   */
  findByUsername(username: string) {
    return this.userModel.findOne({ username });
  }

  /**
   * Updates a user by ID.
   * @param id - ID of the user.
   * @param updateUserDto - Data to update the user.
   * @returns Updated user document.
   */
  update(id: ObjectId, updateUserDto: UpdateUserDto) {
    return this.userModel.findByIdAndUpdate(id, updateUserDto);
  }

  /**
   * Removes a user by ID.
   * @param id - ID of the user.
   * @returns Deleted user document.
   */
  remove(id: ObjectId) {
    return this.userModel.findByIdAndDelete(id);
  }
}
