import React, { useState, useEffect, useCallback } from 'react';
import {
  Table2,
  Database,
  Search,
  RefreshCw,
  Eye,
  FileCode,
  Download,
  AlertCircle,
  CheckCircle2,
  Layers,
  ChevronLeft,
  ChevronRight,
  Code,
  Terminal,
} from 'lucide-react';
import { ENTITY_DATABASE_SCHEMA } from '../../data/dbSchemaData';

interface DatabaseTableBrowserProps {
  lang: 'ar' | 'en';
}

interface TableCountInfo {
  name: string;
  count: number;
}

export const DatabaseTableBrowser: React.FC<DatabaseTableBrowserProps> = ({ lang }) => {
  const isAr = lang === 'ar';
  const [activeTableName, setActiveTableName] = useState<string>('entities');
  const [searchQuery, setSearchQuery] = useState('');
  const [tableCounts, setTableCounts] = useState<TableCountInfo[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRow, setSelectedRow] = useState<any | null>(null);
  const [showSqlModal, setShowSqlModal] = useState(false);

  // Fetch all table counts
  const fetchTableCounts = useCallback(async () => {
    try {
      const res = await fetch('/api/db/tables');
      if (res.ok) {
        const data = await res.json();
        setTableCounts(data);
      }
    } catch (err) {
      console.warn('Failed to fetch table counts from server:', err);
    }
  }, []);

  // Fetch rows for the active table
  const fetchTableRows = useCallback(async (tableName: string, search: string = '') => {
    setIsLoading(true);
    setError(null);
    try {
      const queryParam = search ? `?search=${encodeURIComponent(search)}` : '';
      const res = await fetch(`/api/db/tables/${tableName}${queryParam}`);
      if (res.ok) {
        const data = await res.json();
        setRecords(data.rows || []);
      } else {
        throw new Error(`Failed to load records for table ${tableName}`);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'خطأ في الاتصال بقاعدة البيانات');
      setRecords([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTableCounts();
  }, [fetchTableCounts]);

  useEffect(() => {
    fetchTableRows(activeTableName, searchQuery);
  }, [activeTableName, searchQuery, fetchTableRows]);

  const handleRefresh = () => {
    fetchTableCounts();
    fetchTableRows(activeTableName, searchQuery);
  };

  const currentTableMeta = ENTITY_DATABASE_SCHEMA.find((t) => t.name === activeTableName);
  const columns = records.length > 0 ? Object.keys(records[0]) : [];

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(records, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${activeTableName}_dump_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div id="database-table-browser" className="space-y-6">
      {/* Table Selection Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-stone-800">
        {ENTITY_DATABASE_SCHEMA.map((tbl) => {
          const isActive = activeTableName === tbl.name;
          const countInfo = tableCounts.find((tc) => tc.name === tbl.name);
          const count = countInfo ? countInfo.count : 0;

          return (
            <button
              key={tbl.name}
              onClick={() => {
                setActiveTableName(tbl.name);
                setSearchQuery('');
                setSelectedRow(null);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-md shadow-amber-500/20'
                  : 'bg-stone-900 border border-stone-800 text-stone-400 hover:text-stone-200'
              }`}
            >
              <Table2 className="w-3.5 h-3.5" />
              <span>{tbl.name}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  isActive ? 'bg-stone-950 text-amber-300' : 'bg-stone-800 text-stone-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Table Data Card */}
      <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-amber-400" />
              <h3 className="font-mono text-sm font-bold text-amber-300">
                SELECT * FROM {activeTableName}
              </h3>
              <span className="text-xs text-stone-400 font-heritage">
                ({currentTableMeta?.name_ar || activeTableName})
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">{currentTableMeta?.description}</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative w-full sm:w-56">
              <Search className="w-4 h-4 text-stone-500 absolute top-2.5 right-3" />
              <input
                type="text"
                placeholder={isAr ? 'بحث في السجلات الحية...' : 'Search live records...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-stone-950 border border-stone-700 rounded-xl pr-9 pl-3 py-1.5 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              onClick={handleRefresh}
              title={isAr ? 'تحديث السجلات' : 'Refresh Records'}
              className="p-2 rounded-xl bg-stone-950 border border-stone-700 text-stone-300 hover:text-amber-400 hover:border-amber-500/50 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
            </button>

            <button
              onClick={handleExportJSON}
              title={isAr ? 'تصدير JSON' : 'Export JSON'}
              className="p-2 rounded-xl bg-stone-950 border border-stone-700 text-stone-300 hover:text-amber-400 hover:border-amber-500/50 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowSqlModal(true)}
              title={isAr ? 'معاينة استعلام SQL' : 'Preview SQL Query'}
              className="px-2.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>SQL</span>
            </button>
          </div>
        </div>

        {/* Error Notification if any */}
        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Data Table */}
        <div className="overflow-x-auto border border-stone-800 rounded-xl">
          <table className="w-full text-right text-xs">
            <thead className="bg-stone-950/80">
              <tr className="border-b border-stone-800 text-stone-400 font-mono text-[11px]">
                <th className="p-3 w-10 text-center">#</th>
                {columns.map((col) => (
                  <th key={col} className="p-3 font-semibold whitespace-nowrap">
                    {col}
                  </th>
                ))}
                <th className="p-3 text-center">{isAr ? 'فحص' : 'Inspect'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60 font-sans">
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length + 2} className="text-center py-12 text-xs text-amber-400 font-mono">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-amber-400" />
                    <span>{isAr ? 'جاري جلب السجلات من محرك قاعدة البيانات...' : 'Fetching rows from database...'}</span>
                  </td>
                </tr>
              ) : records.length > 0 ? (
                records.map((row: any, idx) => (
                  <tr key={idx} className="hover:bg-stone-800/40 transition-colors">
                    <td className="p-3 font-mono text-stone-500 text-[10px] text-center">{idx + 1}</td>
                    {columns.map((col) => (
                      <td key={col} className="p-3 font-mono text-stone-300 text-[11px] max-w-xs truncate">
                        {typeof row[col] === 'boolean' ? (
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] ${
                              row[col] ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                            }`}
                          >
                            {row[col] ? 'TRUE' : 'FALSE'}
                          </span>
                        ) : col === 'type' || col === 'status' ? (
                          <span className="px-1.5 py-0.5 rounded bg-stone-800 text-amber-300 border border-stone-700 text-[10px]">
                            {row[col]}
                          </span>
                        ) : typeof row[col] === 'object' && row[col] !== null ? (
                          <span className="font-mono text-stone-400 text-[10px]">
                            {JSON.stringify(row[col])}
                          </span>
                        ) : (
                          <span className="font-sans text-stone-200" title={String(row[col] ?? '')}>
                            {String(row[col] ?? 'NULL')}
                          </span>
                        )}
                      </td>
                    ))}
                    <td className="p-3 text-center">
                      <button
                        onClick={() => setSelectedRow(row)}
                        className="p-1.5 rounded-lg bg-stone-800 hover:bg-amber-500 hover:text-stone-950 text-stone-300 transition-colors cursor-pointer"
                        title={isAr ? 'معاينة كامل السجل' : 'Inspect row JSON'}
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length + 2} className="text-center py-8 text-xs text-stone-500">
                    {isAr ? 'لا توجد سجلات مطابقة في هذا الجدول حالياً.' : 'No records found in this table.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Row Inspection Modal */}
      {selectedRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-amber-400" />
                <h4 className="text-sm font-bold text-stone-100 font-mono">
                  {activeTableName} : row[{selectedRow.id || selectedRow.slug || 'record'}]
                </h4>
              </div>
              <button
                onClick={() => setSelectedRow(null)}
                className="text-stone-400 hover:text-stone-200 text-xs px-2 py-1 bg-stone-800 rounded-lg cursor-pointer"
              >
                {isAr ? 'إغلاق' : 'Close'}
              </button>
            </div>
            <div className="p-4 overflow-y-auto font-mono text-xs text-stone-300 space-y-3 bg-stone-950">
              <pre className="text-emerald-400 whitespace-pre-wrap break-all leading-relaxed">
                {JSON.stringify(selectedRow, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* SQL Query Modal */}
      {showSqlModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-amber-400" />
                <h4 className="text-sm font-bold text-stone-100 font-mono">
                  {isAr ? 'استعلام SQL المقابل' : 'Equivalent SQL Query'}
                </h4>
              </div>
              <button
                onClick={() => setShowSqlModal(false)}
                className="text-stone-400 hover:text-stone-200 text-xs px-2 py-1 bg-stone-800 rounded-lg cursor-pointer"
              >
                {isAr ? 'إغلاق' : 'Close'}
              </button>
            </div>
            <div className="p-4 bg-stone-950 font-mono text-xs text-amber-300">
              <pre className="whitespace-pre-wrap leading-relaxed">
                {`-- استعلام جلب السجلات الحية\nSELECT *\nFROM ${activeTableName}\n${searchQuery ? `WHERE title ILIKE '%${searchQuery}%' OR name ILIKE '%${searchQuery}%'\n` : ''}ORDER BY created_at DESC\nLIMIT 100;`}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

