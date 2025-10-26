import { Request, Response } from 'express';
import { ProjectModel } from '../models/Project';
import { CreateProjectRequest, UpdateProjectRequest, ApiResponse, PaginationParams } from '../types';
import { asyncHandler, AppError } from '../middleware/errorHandler';

export const createProject = asyncHandler(async (req: Request, res: Response) => {
  const projectData: CreateProjectRequest = req.body;
  const userId = (req as any).user.id;
  const organizationId = (req as any).user.organization_id;

  const project = await ProjectModel.create(projectData, userId, organizationId);

  const response: ApiResponse = {
    success: true,
    message: 'Project created successfully',
    data: { project }
  };

  res.status(201).json(response);
});

export const getProjects = asyncHandler(async (req: Request, res: Response) => {
  const organizationId = (req as any).user.organization_id;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const sort = (req.query.sort as string) || 'created_at';
  const order = (req.query.order as 'asc' | 'desc') || 'desc';

  const pagination: PaginationParams = { page, limit, sort, order };

  const projects = await ProjectModel.findByOrganizationId(organizationId, pagination);
  const totalCount = await ProjectModel.countByOrganizationId(organizationId);

  const response: ApiResponse = {
    success: true,
    message: 'Projects retrieved successfully',
    data: {
      projects,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    }
  };

  res.status(200).json(response);
});

export const getProject = asyncHandler(async (req: Request, res: Response) => {
  const projectId = parseInt(req.params.id);
  const organizationId = (req as any).user.organization_id;

  if (isNaN(projectId)) {
    throw new AppError('Invalid project ID', 400);
  }

  const project = await ProjectModel.findById(projectId, organizationId);
  if (!project) {
    throw new AppError('Project not found or you do not have permission to access it', 404);
  }

  const response: ApiResponse = {
    success: true,
    message: 'Project retrieved successfully',
    data: { project }
  };

  res.status(200).json(response);
});

export const updateProject = asyncHandler(async (req: Request, res: Response) => {
  const projectId = parseInt(req.params.id);
  const organizationId = (req as any).user.organization_id;
  const updateData: UpdateProjectRequest = req.body;

  if (isNaN(projectId)) {
    throw new AppError('Invalid project ID', 400);
  }

  const project = await ProjectModel.update(projectId, organizationId, updateData);
  if (!project) {
    throw new AppError('Project not found or you do not have permission to update it', 404);
  }

  const response: ApiResponse = {
    success: true,
    message: 'Project updated successfully',
    data: { project }
  };

  res.status(200).json(response);
});

export const deleteProject = asyncHandler(async (req: Request, res: Response) => {
  const projectId = parseInt(req.params.id);
  const organizationId = (req as any).user.organization_id;

  if (isNaN(projectId)) {
    throw new AppError('Invalid project ID', 400);
  }

  const deleted = await ProjectModel.delete(projectId, organizationId);
  if (!deleted) {
    throw new AppError('Project not found or you do not have permission to delete it', 404);
  }

  const response: ApiResponse = {
    success: true,
    message: 'Project deleted successfully'
  };

  res.status(200).json(response);
});

export const getProjectStats = asyncHandler(async (req: Request, res: Response) => {
  const organizationId = (req as any).user.organization_id;

  const stats = await ProjectModel.getStatsByOrganizationId(organizationId);

  const response: ApiResponse = {
    success: true,
    message: 'Project statistics retrieved successfully',
    data: { stats }
  };

  res.status(200).json(response);
});
