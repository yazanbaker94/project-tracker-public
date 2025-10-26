import pool from '../config/database';
import { Project, CreateProjectRequest, UpdateProjectRequest, PaginationParams } from '../types';

export class ProjectModel {
  static async create(projectData: CreateProjectRequest, userId: number, organizationId: number): Promise<Project> {
    const { title, description, status } = projectData;

    const query = `
      INSERT INTO projects (title, description, status, user_id, organization_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, title, description, status, user_id, organization_id, created_at, updated_at, completed_at
    `;

    const values = [title, description, status || 'active', userId, organizationId];
    const result = await pool.query(query, values);
    
    return result.rows[0];
  }

  static async findById(id: number, organizationId: number): Promise<Project | null> {
    const query = `
      SELECT id, title, description, status, user_id, organization_id, created_at, updated_at, completed_at
      FROM projects
      WHERE id = $1 AND organization_id = $2
    `;

    const result = await pool.query(query, [id, organizationId]);
    return result.rows[0] || null;
  }

  static async findByOrganizationId(organizationId: number, pagination?: PaginationParams): Promise<Project[]> {
    const { page = 1, limit = 10, sort = 'created_at', order = 'desc' } = pagination || {};
    const offset = (page - 1) * limit;

    const query = `
      SELECT id, title, description, status, user_id, organization_id, created_at, updated_at, completed_at
      FROM projects
      WHERE organization_id = $1
      ORDER BY ${sort} ${order.toUpperCase()}
      LIMIT $2 OFFSET $3
    `;

    const result = await pool.query(query, [organizationId, limit, offset]);
    return result.rows;
  }

  static async update(id: number, organizationId: number, updateData: UpdateProjectRequest): Promise<Project | null> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (updateData.title !== undefined) {
      fields.push(`title = $${paramCount++}`);
      values.push(updateData.title);
    }

    if (updateData.description !== undefined) {
      fields.push(`description = $${paramCount++}`);
      values.push(updateData.description);
    }

    if (updateData.status !== undefined) {
      fields.push(`status = $${paramCount++}`);
      values.push(updateData.status);
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    const query = `
      UPDATE projects
      SET ${fields.join(', ')}
      WHERE id = $${paramCount++} AND organization_id = $${paramCount++}
      RETURNING id, title, description, status, user_id, organization_id, created_at, updated_at, completed_at
    `;

    values.push(id, organizationId);
    const result = await pool.query(query, values);
    
    return result.rows[0] || null;
  }

  static async delete(id: number, organizationId: number): Promise<boolean> {
    const query = `
      DELETE FROM projects
      WHERE id = $1 AND organization_id = $2
    `;

    const result = await pool.query(query, [id, organizationId]);
    return (result.rowCount ?? 0) > 0;
  }

  static async countByOrganizationId(organizationId: number): Promise<number> {
    const query = `
      SELECT COUNT(*) as count
      FROM projects
      WHERE organization_id = $1
    `;

    const result = await pool.query(query, [organizationId]);
    return parseInt(result.rows[0].count);
  }

  static async getStatsByOrganizationId(organizationId: number): Promise<{ total: number; active: number; completed: number }> {
    const query = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed
      FROM projects
      WHERE organization_id = $1
    `;

    const result = await pool.query(query, [organizationId]);
    const stats = result.rows[0];
    
    return {
      total: parseInt(stats.total),
      active: parseInt(stats.active),
      completed: parseInt(stats.completed)
    };
  }

  // Analytics: Per-user project stats
  static async getStatsByUserId(userId: number, organizationId: number): Promise<{ total: number; active: number; completed: number }> {
    const query = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed
      FROM projects
      WHERE user_id = $1 AND organization_id = $2
    `;

    const result = await pool.query(query, [userId, organizationId]);
    const stats = result.rows[0];
    
    return {
      total: parseInt(stats.total),
      active: parseInt(stats.active),
      completed: parseInt(stats.completed)
    };
  }

  // Analytics: Average completion time in days
  static async getAverageCompletionTime(organizationId: number): Promise<number | null> {
    const query = `
      SELECT AVG(EXTRACT(EPOCH FROM (completed_at - created_at)) / 86400) as avg_days
      FROM projects
      WHERE organization_id = $1 
        AND status = 'completed' 
        AND completed_at IS NOT NULL
    `;

    const result = await pool.query(query, [organizationId]);
    const avgDays = result.rows[0]?.avg_days;
    
    return avgDays ? parseFloat(avgDays) : null;
  }

  // Analytics: Detailed analytics for organization
  static async getDetailedAnalytics(organizationId: number) {
    const statsQuery = `
      SELECT 
        COUNT(*) as total_projects,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_projects,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_projects,
        COUNT(DISTINCT user_id) as total_contributors,
        AVG(EXTRACT(EPOCH FROM (completed_at - created_at)) / 86400) as avg_completion_days
      FROM projects
      WHERE organization_id = $1
    `;

    const userStatsQuery = `
      SELECT 
        user_id,
        COUNT(*) as project_count,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count
      FROM projects
      WHERE organization_id = $1
      GROUP BY user_id
      ORDER BY project_count DESC
      LIMIT 10
    `;

    const recentQuery = `
      SELECT 
        DATE_TRUNC('day', created_at) as date,
        COUNT(*) as projects_created
      FROM projects
      WHERE organization_id = $1
        AND created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE_TRUNC('day', created_at)
      ORDER BY date DESC
    `;

    const [statsResult, userStatsResult, recentResult] = await Promise.all([
      pool.query(statsQuery, [organizationId]),
      pool.query(userStatsQuery, [organizationId]),
      pool.query(recentQuery, [organizationId])
    ]);

    const stats = statsResult.rows[0];
    
    return {
      overview: {
        total_projects: parseInt(stats.total_projects),
        active_projects: parseInt(stats.active_projects),
        completed_projects: parseInt(stats.completed_projects),
        total_contributors: parseInt(stats.total_contributors),
        avg_completion_days: stats.avg_completion_days ? parseFloat(stats.avg_completion_days).toFixed(1) : null,
        completion_rate: stats.total_projects > 0 
          ? ((parseInt(stats.completed_projects) / parseInt(stats.total_projects)) * 100).toFixed(1)
          : '0'
      },
      top_contributors: userStatsResult.rows.map(row => ({
        user_id: row.user_id,
        project_count: parseInt(row.project_count),
        completed_count: parseInt(row.completed_count)
      })),
      recent_activity: recentResult.rows.map(row => ({
        date: row.date,
        projects_created: parseInt(row.projects_created)
      }))
    };
  }
}
