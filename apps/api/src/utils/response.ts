import { Response } from 'express';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Typed response builders for a consistent API response shape.
 *
 * Success: { success: true, data, meta? }
 * Error:   { success: false, error: { code, message, details?, requestId } }
 *
 * Always use these helpers instead of calling res.json() directly.
 */

export function ok<T>(res: Response, data: T, meta?: PaginationMeta): Response {
  return res.status(200).json({ success: true, data, ...(meta && { meta }) });
}

export function created<T>(res: Response, data: T): Response {
  return res.status(201).json({ success: true, data });
}

export function accepted<T>(res: Response, data?: T): Response {
  return res.status(202).json({ success: true, ...(data !== undefined && { data }) });
}

export function noContent(res: Response): Response {
  return res.status(204).send();
}

/**
 * Extracts and validates pagination query params with safe defaults.
 * Max limit is capped at 100 to prevent abuse.
 */
export function parsePagination(query: Record<string, unknown>): {
  page: number;
  limit: number;
  skip: number;
} {
  const page = Math.max(1, parseInt(String(query['page'] ?? '1'), 10) || 1);
  const limit = Math.min(
    100,
    Math.max(1, parseInt(String(query['limit'] ?? '20'), 10) || 20),
  );
  return { page, limit, skip: (page - 1) * limit };
}
