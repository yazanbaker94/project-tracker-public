import pool from '../config/database';
import { Organization } from '../types';

export class OrganizationModel {
  static async findById(id: number): Promise<Organization | null> {
    const query = `
      SELECT id, name, description, created_at, updated_at
      FROM organizations
      WHERE id = $1
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  static async findAll(): Promise<Organization[]> {
    const query = `
      SELECT id, name, description, created_at, updated_at
      FROM organizations
      ORDER BY name ASC
    `;

    const result = await pool.query(query);
    return result.rows;
  }

  static async create(name: string, description?: string): Promise<Organization> {
    const query = `
      INSERT INTO organizations (name, description)
      VALUES ($1, $2)
      RETURNING id, name, description, created_at, updated_at
    `;

    const result = await pool.query(query, [name, description || '']);
    return result.rows[0];
  }

  static async update(id: number, name: string, description?: string): Promise<Organization | null> {
    const query = `
      UPDATE organizations
      SET name = $1, description = $2
      WHERE id = $3
      RETURNING id, name, description, created_at, updated_at
    `;

    const result = await pool.query(query, [name, description || '', id]);
    return result.rows[0] || null;
  }

  static async getUserCount(organizationId: number): Promise<number> {
    const query = `
      SELECT COUNT(*) as count
      FROM users
      WHERE organization_id = $1
    `;

    const result = await pool.query(query, [organizationId]);
    return parseInt(result.rows[0].count);
  }

  static async getProjectCount(organizationId: number): Promise<number> {
    const query = `
      SELECT COUNT(*) as count
      FROM projects
      WHERE organization_id = $1
    `;

    const result = await pool.query(query, [organizationId]);
    return parseInt(result.rows[0].count);
  }
}
