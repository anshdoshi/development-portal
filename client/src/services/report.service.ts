import api from './api';

export const reportService = {
  getReports: (params?: { type?: string; startDate?: string; endDate?: string }) =>
    api.get('/reports', { params }),
  exportCsv: (params?: { type?: string; startDate?: string; endDate?: string }) =>
    api.get('/reports/export', { params, responseType: 'blob' }),
};
