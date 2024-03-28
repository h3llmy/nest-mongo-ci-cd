import { Injectable } from '@nestjs/common';
import { hash, compare } from 'bcrypt';

/**
 * Utility class for handling password encryption and comparison.
 */
@Injectable()
export class EncryptionService {
  /**
   * Hashes the provided password.
   * @param {string} password - The password to be hashed.
   * @returns {Promise<string>} A promise that resolves to the hashed password.
   */
  async hash(password: string): Promise<string> {
    return await hash(password, 10);
  }

  /**
   * Compares the entered password with the current hashed password.
   * @param {string} enteredPassword - The password entered by the user.
   * @param {string} currentPassword - The currently hashed password stored in the database.
   * @returns {Promise<boolean>} A promise that resolves to true if passwords match, false otherwise.
   */
  async compare(
    enteredPassword: string,
    currentPassword: string,
  ): Promise<boolean> {
    return await compare(enteredPassword, currentPassword);
  }
}
