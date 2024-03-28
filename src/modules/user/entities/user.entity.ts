import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { CallbackWithoutResultAndOptionalError, Document } from 'mongoose';
import { EncryptionService } from '../../common/encryption.service';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ type: String, required: true, unique: true })
  username: string;

  @Prop({ type: String, required: true, unique: true })
  email: string;

  @Prop({ type: String, required: true })
  password: string;

  @Prop({ enum: UserRole, required: true })
  role: UserRole;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;
}

const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre(
  'save',
  async function (next: CallbackWithoutResultAndOptionalError) {
    const user = this as User;

    if (!user.isModified('password')) {
      return next();
    }

    try {
      const encryption = new EncryptionService();
      const hashedPassword = await encryption.hash(user.password);
      user.password = hashedPassword;
      next();
    } catch (error) {
      return next(error);
    }
  },
);

export { UserSchema };
