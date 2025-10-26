import pool from '../config/database';
import bcrypt from 'bcryptjs';
import { User, CreateUserRequest } from '../types';

export class UserModel {
  static async create(userData: CreateUserRequest, organizationId: number): Promise<User> {
    const { email, password, first_name, last_name } = userData;
    
    // Hash password
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(password, saltRounds);

    const query = `
      INSERT INTO users (email, password_hash, first_name, last_name, organization_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, email, first_name, last_name, organization_id, created_at, updated_at
    `;

    const values = [email, password_hash, first_name, last_name, organizationId];
    const result = await pool.query(query, values);
    
    return result.rows[0];
  }

  static async findByEmail(email: string): Promise<User & { password_hash: string } | null> {
    const query = `
      SELECT id, email, password_hash, first_name, last_name, organization_id, created_at, updated_at
      FROM users
      WHERE email = $1
    `;

    const result = await pool.query(query, [email]);
    return result.rows[0] || null;
  }

  static async findById(id: number): Promise<User | null> {
    const query = `
      SELECT id, email, first_name, last_name, organization_id, created_at, updated_at
      FROM users
      WHERE id = $1
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  static async emailExists(email: string): Promise<boolean> {
    const query = `
      SELECT 1 FROM users WHERE email = $1
    `;

    const result = await pool.query(query, [email]);
    return result.rows.length > 0;
  }
}
