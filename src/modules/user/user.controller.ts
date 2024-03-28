import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Permission } from '../../utils/decorator/permission.decorator';
import { UserRole } from './entities/user.entity';
import { ObjectId } from 'mongoose';
import { ParseObjectIdPipe } from 'src/utils/customValidationPipe/objectIdPipe';
import { Auth } from 'src/utils/decorator/user.decorator';
import { ApiHeader, ApiQuery, ApiTags } from '@nestjs/swagger';

@Controller('user')
@ApiTags('User')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  // @Permission(UserRole.ADMIN)
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @Permission(UserRole.USER, UserRole.ADMIN)
  @ApiHeader({
    name: 'Authorization',
    description: 'for user and admin',
    required: true,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number',
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of items per page',
    type: Number,
  })
  findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.userService.findPagination(page, limit);
  }

  @Get('profile')
  @Permission(UserRole.ADMIN)
  @ApiHeader({
    name: 'Authorization',
    description: 'for admin only',
    required: true,
  })
  profileDetail(@Auth() user: any) {
    return user;
  }

  @Get(':id')
  findOne(@Param('id', ParseObjectIdPipe) id: ObjectId) {
    return this.userService.findById(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseObjectIdPipe) id: ObjectId,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseObjectIdPipe) id: ObjectId) {
    return this.userService.remove(id);
  }
}
