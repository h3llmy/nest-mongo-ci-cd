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

  @Prop({ type: String })
  otp: string;

  @Prop({ type: Boolean, default: false })
  isVerified: boolean;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;
}

const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre(
  'save',
  async function (next: CallbackWithoutResultAndOptionalError) {
    const user = this as User;

    try {
      const fieldsToHash = ['password', 'otp'];

      for (const field of fieldsToHash) {
        if (user.isModified(field)) {
          const encryption = new EncryptionService();
          const hashedValue = await encryption.hash(user[field]);
          user[field] = hashedValue;
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  },
);

export { UserSchema };
