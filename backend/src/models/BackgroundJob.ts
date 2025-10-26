import pool from '../config/database';
import { BackgroundJob, CreateBackgroundJobRequest, UpdateBackgroundJobRequest, BackgroundJobType } from '../types';
import { randomBytes } from 'crypto';

export class BackgroundJobModel {
  // Generate unique job ID
  static generateJobId(): string {
    return `bg_job_${randomBytes(16).toString('hex')}`;
  }

  // Create new background job
  static async create(
    jobData: CreateBackgroundJobRequest,
    userId: number,
    organizationId: number
  ): Promise<BackgroundJob> {
    const jobId = this.generateJobId();
    const estimatedTime = this.getEstimatedTime(jobData.job_type);

    const query = `
      INSERT INTO background_jobs (
        job_id, job_type, user_id, organization_id, status, 
        progress_percentage, estimated_time_seconds
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const values = [
      jobId,
      jobData.job_type,
      userId,
      organizationId,
      'queued',
      0,
      estimatedTime
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Get estimated time for job type
  static getEstimatedTime(jobType: BackgroundJobType): number {
    switch (jobType) {
      case 'recompute_analytics':
        return 15;
      case 'archive_old_projects':
        return 30;
      case 'cleanup_old_jobs':
        return 10;
      default:
        return 20;
    }
  }

  // Find job by job_id
  static async findByJobId(jobId: string, organizationId: number): Promise<BackgroundJob | null> {
    const query = `
      SELECT *
      FROM background_jobs
      WHERE job_id = $1 AND organization_id = $2
    `;

    const result = await pool.query(query, [jobId, organizationId]);
    return result.rows[0] || null;
  }

  // Find job by job_id (no org check - for internal processing)
  static async findByJobIdGlobal(jobId: string): Promise<BackgroundJob | null> {
    const query = `
      SELECT *
      FROM background_jobs
      WHERE job_id = $1
    `;

    const result = await pool.query(query, [jobId]);
    return result.rows[0] || null;
  }

  // Get all jobs for organization
  static async findByOrganizationId(organizationId: number, limit: number = 50): Promise<BackgroundJob[]> {
    const query = `
      SELECT *
      FROM background_jobs
      WHERE organization_id = $1
      ORDER BY created_at DESC
      LIMIT $2
    `;

    const result = await pool.query(query, [organizationId, limit]);
    return result.rows;
  }

  // Get jobs by status
  static async findByStatus(organizationId: number, status: string): Promise<BackgroundJob[]> {
    const query = `
      SELECT *
      FROM background_jobs
      WHERE organization_id = $1 AND status = $2
      ORDER BY created_at DESC
    `;

    const result = await pool.query(query, [organizationId, status]);
    return result.rows;
  }

  // Update job
  static async update(jobId: string, updateData: UpdateBackgroundJobRequest): Promise<BackgroundJob | null> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (updateData.status !== undefined) {
      fields.push(`status = $${paramCount++}`);
      values.push(updateData.status);
    }

    if (updateData.progress_percentage !== undefined) {
      fields.push(`progress_percentage = $${paramCount++}`);
      values.push(updateData.progress_percentage);
    }

    if (updateData.current_step !== undefined) {
      fields.push(`current_step = $${paramCount++}`);
      values.push(updateData.current_step);
    }

    if (updateData.result_data !== undefined) {
      fields.push(`result_data = $${paramCount++}`);
      values.push(JSON.stringify(updateData.result_data));
    }

    if (updateData.error_message !== undefined) {
      fields.push(`error_message = $${paramCount++}`);
      values.push(updateData.error_message);
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    const query = `
      UPDATE background_jobs
      SET ${fields.join(', ')}
      WHERE job_id = $${paramCount++}
      RETURNING *
    `;

    values.push(jobId);
    const result = await pool.query(query, values);

    return result.rows[0] || null;
  }

  // Get statistics for organization
  static async getStatsByOrganizationId(organizationId: number): Promise<{
    total: number;
    queued: number;
    running: number;
    completed: number;
    failed: number;
  }> {
    const query = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'queued' THEN 1 END) as queued,
        COUNT(CASE WHEN status = 'running' THEN 1 END) as running,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed
      FROM background_jobs
      WHERE organization_id = $1
    `;

    const result = await pool.query(query, [organizationId]);
    const stats = result.rows[0];

    return {
      total: parseInt(stats.total),
      queued: parseInt(stats.queued),
      running: parseInt(stats.running),
      completed: parseInt(stats.completed),
      failed: parseInt(stats.failed)
    };
  }

  // Delete job
  static async delete(jobId: string, organizationId: number): Promise<boolean> {
    const query = `
      DELETE FROM background_jobs
      WHERE job_id = $1 AND organization_id = $2
    `;

    const result = await pool.query(query, [jobId, organizationId]);
    return (result.rowCount ?? 0) > 0;
  }

  // Get recent jobs
  static async getRecentJobs(organizationId: number, limit: number = 10): Promise<BackgroundJob[]> {
    const query = `
      SELECT *
      FROM background_jobs
      WHERE organization_id = $1
      ORDER BY created_at DESC
      LIMIT $2
    `;

    const result = await pool.query(query, [organizationId, limit]);
    return result.rows;
  }
}

