import type { Request, Response, NextFunction } from 'express';
import * as reportService from '../services/report.service.js';

const CSV_COLUMNS: Record<string, { key: string; label: string }[]> = {
  projects: [
    { key: 'title', label: 'Title' },
    { key: 'client_name', label: 'Client' },
    { key: 'status', label: 'Status' },
    { key: 'start_date', label: 'Start Date' },
    { key: 'end_date', label: 'End Date' },
    { key: 'created_at', label: 'Created At' },
  ],
  users: [
    { key: 'first_name', label: 'First Name' },
    { key: 'last_name', label: 'Last Name' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role' },
    { key: 'is_active', label: 'Active' },
    { key: 'created_at', label: 'Created At' },
  ],
  activity: [
    { key: 'action', label: 'Action' },
    { key: 'entity_type', label: 'Entity Type' },
    { key: 'user_name', label: 'User' },
    { key: 'created_at', label: 'Date' },
  ],
};

// Flatten nested objects for CSV export
function flattenData(data: Record<string, unknown>[], type: string): Record<string, unknown>[] {
  return data.map((row) => {
    const flat = { ...row };
    if (type === 'projects' && row.client && typeof row.client === 'object') {
      const c = row.client as Record<string, string>;
      flat.client_name = `${c.first_name || ''} ${c.last_name || ''}`.trim() || '';
    }
    if (type === 'activity' && row.user && typeof row.user === 'object') {
      const u = row.user as Record<string, string>;
      flat.user_name = `${u.first_name || ''} ${u.last_name || ''}`.trim() || '';
    }
    return flat;
  });
}

export const getReports = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type, startDate, endDate } = req.query;

    const data = await reportService.getReportData({
      type: (type as 'projects' | 'users' | 'activity') || undefined,
      startDate: startDate as string | undefined,
      endDate: endDate as string | undefined,
    });

    res.status(200).json({ data });
  } catch (error) {
    next(error);
  }
};

export const exportReports = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type, startDate, endDate } = req.query;
    const reportType = (type as string) || 'projects';

    const data = await reportService.getReportData({
      type: reportType as 'projects' | 'users' | 'activity',
      startDate: startDate as string | undefined,
      endDate: endDate as string | undefined,
    });

    const columns = CSV_COLUMNS[reportType] || CSV_COLUMNS.projects;
    const flattened = flattenData(data, reportType);
    const csv = reportService.exportCsv(flattened, columns);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="report-${reportType}.csv"`);
    res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
};
