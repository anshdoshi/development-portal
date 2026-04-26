import { useState } from 'react';
import { FileBarChart, Download, Loader2, FileText } from 'lucide-react';
import { reportService } from '@/services/report.service';
import { useToast } from '@/components/Toast';

type ReportType = 'projects' | 'users' | 'activity';

const REPORT_TYPES: { value: ReportType; label: string }[] = [
  { value: 'projects', label: 'Projects' },
  { value: 'users', label: 'Users' },
  { value: 'activity', label: 'Activity' },
];

function formatDate(d: string | null) {
  if (!d) return '--';
  return new Date(d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatStatus(status: string) {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

const STATUS_BADGE_CLASSES: Record<string, string> = {
  not_started: 'bg-gray-100 text-gray-600',
  in_progress: 'bg-blue-50 text-blue-600',
  on_hold: 'bg-amber-50 text-amber-600',
  completed: 'bg-emerald-50 text-emerald-600',
  cancelled: 'bg-red-50 text-red-600',
};

function getDefaultStartDate() {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString().split('T')[0];
}

function getDefaultEndDate() {
  return new Date().toISOString().split('T')[0];
}

export default function ReportsPage() {
  const { toast } = useToast();
  const [type, setType] = useState<ReportType>('projects');
  const [startDate, setStartDate] = useState(getDefaultStartDate);
  const [endDate, setEndDate] = useState(getDefaultEndDate);
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');
  const [generated, setGenerated] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await reportService.getReports({
        type,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      setData(res.data.data ?? []);
      setGenerated(true);
      toast('Report generated successfully.');
    } catch {
      setError('Failed to generate report.');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const { data } = await reportService.exportCsv({
        type,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      const url = window.URL.createObjectURL(new Blob([data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${type}-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast('Report exported as CSV.');
    } catch {
      setError('Failed to export report.');
    } finally {
      setExporting(false);
    }
  };

  const inputClass =
    'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-300 outline-none transition bg-white';

  const renderTable = () => {
    if (!generated) return null;

    if (data.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="h-12 w-12 rounded-xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
            <FileText className="h-6 w-6 text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium">No results found</p>
          <p className="text-sm text-gray-400 mt-1">Try adjusting your date range or report type</p>
        </div>
      );
    }

    if (type === 'projects') {
      return (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="pb-3 font-medium">Title</th>
                <th className="pb-3 font-medium">Client</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium text-right">Created</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition">
                  <td className="py-3 font-medium text-gray-900">{row.title as string}</td>
                  <td className="py-3 text-gray-500">
                    {row.client && typeof row.client === 'object'
                      ? `${(row.client as Record<string, string>).first_name} ${(row.client as Record<string, string>).last_name}`
                      : '--'}
                  </td>
                  <td className="py-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        STATUS_BADGE_CLASSES[(row.status as string)] ?? 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {formatStatus((row.status as string) ?? '')}
                    </span>
                  </td>
                  <td className="py-3 text-gray-500 text-right">
                    {formatDate(row.created_at as string | null)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (type === 'users') {
      return (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="pb-3 font-medium">Name</th>
                <th className="pb-3 font-medium">Email</th>
                <th className="pb-3 font-medium">Role</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium text-right">Created</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition">
                  <td className="py-3 font-medium text-gray-900">
                    {row.first_name as string} {row.last_name as string}
                  </td>
                  <td className="py-3 text-gray-500">{row.email as string}</td>
                  <td className="py-3">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-600 capitalize">
                      {row.role as string}
                    </span>
                  </td>
                  <td className="py-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        row.is_active
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-red-50 text-red-600'
                      }`}
                    >
                      {row.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 text-gray-500 text-right">
                    {formatDate(row.created_at as string | null)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    // activity
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-100">
              <th className="pb-3 font-medium">Action</th>
              <th className="pb-3 font-medium">Entity Type</th>
              <th className="pb-3 font-medium">User</th>
              <th className="pb-3 font-medium text-right">Date</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition">
                <td className="py-3 font-medium text-gray-900 capitalize">{row.action as string}</td>
                <td className="py-3 text-gray-500 capitalize">{row.entity_type as string}</td>
                <td className="py-3 text-gray-500">
                  {row.user && typeof row.user === 'object'
                    ? `${(row.user as Record<string, string>).first_name} ${(row.user as Record<string, string>).last_name}`
                    : '--'}
                </td>
                <td className="py-3 text-gray-500 text-right">
                  {formatDate(row.created_at as string | null)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="animate-in">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-sm text-gray-500 mt-1">
          Generate and export reports across projects, users, and activity
        </p>
      </div>

      {/* Filter Card */}
      <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Report Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as ReportType)}
              className={inputClass}
            >
              {REPORT_TYPES.map((rt) => (
                <option key={rt.value} value={rt.value}>
                  {rt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileBarChart className="h-4 w-4" />
              )}
              Generate
            </button>
            {generated && data.length > 0 && (
              <button
                onClick={handleExport}
                disabled={exporting}
                className="flex items-center justify-center gap-2 bg-emerald-600 text-white rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition"
              >
                {exporting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                CSV
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 mb-6 text-sm">
          {error}
        </div>
      )}

      {/* Results */}
      {generated ? (
        <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Results <span className="text-sm font-normal text-gray-400">({data.length})</span>
            </h2>
          </div>
          {renderTable()}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-12 text-center">
          <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center mx-auto mb-4">
            <FileBarChart className="h-6 w-6 text-indigo-500" />
          </div>
          <p className="text-gray-500 font-medium">Generate a report to see results</p>
          <p className="text-sm text-gray-400 mt-1">
            Select a report type and click Generate
          </p>
        </div>
      )}
    </div>
  );
}
