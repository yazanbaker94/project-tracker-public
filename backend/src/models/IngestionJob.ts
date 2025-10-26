import pool from '../config/database';
import { IngestionJob, CreateIngestionJobRequest, UpdateIngestionJobRequest, IngestionJobStatus } from '../types';
import { randomBytes } from 'crypto';

export class IngestionJobModel {
  // Generate unique job ID
  static generateJobId(): string {
    return `job_${randomBytes(16).toString('hex')}`;
  }

  // Generate mock upload URL
  static generateUploadUrl(jobId: string): string {
    return `https://mock-storage.example.com/upload/${jobId}`;
  }

  // Create new ingestion job
  static async create(
    jobData: CreateIngestionJobRequest,
    userId: number,
    organizationId: number
  ): Promise<IngestionJob> {
    const jobId = this.generateJobId();
    const uploadUrl = this.generateUploadUrl(jobId);

    const query = `
      INSERT INTO ingestion_jobs (
        job_id, user_id, organization_id, filename, file_type, file_size, 
        status, upload_url
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const values = [
      jobId,
      userId,
      organizationId,
      jobData.filename,
      jobData.file_type,
      jobData.file_size || null,
      'pending',
      uploadUrl
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Find job by job_id
  static async findByJobId(jobId: string, organizationId: number): Promise<IngestionJob | null> {
    const query = `
      SELECT *
      FROM ingestion_jobs
      WHERE job_id = $1 AND organization_id = $2
    `;

    const result = await pool.query(query, [jobId, organizationId]);
    return result.rows[0] || null;
  }

  // Find job by job_id (without org check - for callback)
  static async findByJobIdGlobal(jobId: string): Promise<IngestionJob | null> {
    const query = `
      SELECT *
      FROM ingestion_jobs
      WHERE job_id = $1
    `;

    const result = await pool.query(query, [jobId]);
    return result.rows[0] || null;
  }

  // Get all jobs for a user
  static async findByUserId(userId: number, organizationId: number): Promise<IngestionJob[]> {
    const query = `
      SELECT *
      FROM ingestion_jobs
      WHERE user_id = $1 AND organization_id = $2
      ORDER BY created_at DESC
    `;

    const result = await pool.query(query, [userId, organizationId]);
    return result.rows;
  }

  // Get all jobs for an organization
  static async findByOrganizationId(organizationId: number): Promise<IngestionJob[]> {
    const query = `
      SELECT *
      FROM ingestion_jobs
      WHERE organization_id = $1
      ORDER BY created_at DESC
    `;

    const result = await pool.query(query, [organizationId]);
    return result.rows;
  }

  // Update job status and details
  static async update(jobId: string, updateData: UpdateIngestionJobRequest): Promise<IngestionJob | null> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (updateData.status !== undefined) {
      fields.push(`status = $${paramCount++}`);
      values.push(updateData.status);
    }

    if (updateData.result_url !== undefined) {
      fields.push(`result_url = $${paramCount++}`);
      values.push(updateData.result_url);
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
      UPDATE ingestion_jobs
      SET ${fields.join(', ')}
      WHERE job_id = $${paramCount++}
      RETURNING *
    `;

    values.push(jobId);
    const result = await pool.query(query, values);

    return result.rows[0] || null;
  }

  // Get job statistics for organization
  static async getStatsByOrganizationId(organizationId: number): Promise<{
    total: number;
    pending: number;
    processing: number;
    completed: number;
    failed: number;
  }> {
    const query = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'processing' THEN 1 END) as processing,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed
      FROM ingestion_jobs
      WHERE organization_id = $1
    `;

    const result = await pool.query(query, [organizationId]);
    const stats = result.rows[0];

    return {
      total: parseInt(stats.total),
      pending: parseInt(stats.pending),
      processing: parseInt(stats.processing),
      completed: parseInt(stats.completed),
      failed: parseInt(stats.failed)
    };
  }

  // Get recent jobs (last N jobs)
  static async getRecentJobs(organizationId: number, limit: number = 10): Promise<IngestionJob[]> {
    const query = `
      SELECT *
      FROM ingestion_jobs
      WHERE organization_id = $1
      ORDER BY created_at DESC
      LIMIT $2
    `;

    const result = await pool.query(query, [organizationId, limit]);
    return result.rows;
  }

  // Delete job
  static async delete(jobId: string, organizationId: number): Promise<boolean> {
    const query = `
      DELETE FROM ingestion_jobs
      WHERE job_id = $1 AND organization_id = $2
    `;

    const result = await pool.query(query, [jobId, organizationId]);
    return (result.rowCount ?? 0) > 0;
  }
}

