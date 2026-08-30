import React, { useState } from 'react';
import {
  Database,
  Table,
  Key,
  Link2,
  Code2,
  Search,
  Layers,
  FileCode,
  CheckCircle2,
  Copy,
  Info,
  Server,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { ENTITY_DATABASE_SCHEMA } from '../../data/dbSchemaData';
import { DBTable } from '../../types';

interface DatabaseSchemaViewProps {
  lang: 'ar' | 'en';
}

export const DatabaseSchemaView: React.FC<DatabaseSchemaViewProps> = ({ lang }) => {
  const isAr = lang === 'ar';
  const [selectedTable, setSelectedTable] = useState<DBTable>(ENTITY_DATABASE_SCHEMA[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sqlDialect, setSqlDialect] = useState<'postgres' | 'sqlite' | 'mysql'>('postgres');
  const [copiedSQL, setCopiedSQL] = useState(false);

  const filteredTables = ENTITY_DATABASE_SCHEMA.filter(
    (t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.name_ar.includes(searchTerm) ||
      t.description.includes(searchTerm)
  );

  const generateDDL = (table: DBTable) => {
    let ddl = `-- ==========================================\n`;
    ddl += `-- جدول: ${table.name_ar} (${table.name})\n`;
    ddl += `-- ${table.description}\n`;
    ddl += `-- ==========================================\n\n`;
    ddl += `CREATE TABLE ${table.name} (\n`;

    const columnDefs = table.columns.map((col) => {
      let line = `  ${col.name} ${col.type}`;
      if (col.isPrimary) {
        line += ' PRIMARY KEY';
      }
      if (!col.isNullable && !col.isPrimary) {
        line += ' NOT NULL';
      }
      if (col.defaultValue) {
        line += ` DEFAULT ${col.defaultValue}`;
      }
      if (col.isForeign && col.foreignTable && col.foreignColumn) {
        line += ` REFERENCES ${col.foreignTable}(${col.foreignColumn}) ON DELETE CASCADE`;
      }
      return line;
    });

    ddl += columnDefs.join(',\n');
    ddl += '\n);\n\n';

    if (table.indexes && table.indexes.length > 0) {
      ddl += `-- فهارس الأداء:\n`;
      ddl += table.indexes.join('\n') + '\n';
    }

    return ddl;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateDDL(selectedTable));
    setCopiedSQL(true);
    setTimeout(() => setCopiedSQL(false), 2000);
  };

  return (
    <div id="database-schema-explorer" className="space-y-6">
      {/* Top Banner Overview */}
      <div className="bg-gradient-to-r from-amber-950/40 via-stone-900 to-indigo-950/40 border border-stone-800 rounded-3xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-stone-100 font-heritage">
                  {isAr ? 'بنية قاعدة بيانات مشروع كِيَان (Entity Core DB Schema)' : 'Entity Relational DB Schema Engine'}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  v2.4 Relational Engine
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-1">
                {isAr
                  ? 'مخطط هرمي علائقي يربط الكيانات، العقد التراثية، ملفات الوسائط الممسوحة، المصادر، الأعلام، والحواشي'
                  : 'Relational hierarchical architecture linking entities, content nodes, media assets, storage paths, and scholarly notes'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-stone-950/80 border border-stone-800 p-1.5 rounded-xl">
            {(['postgres', 'sqlite', 'mysql'] as const).map((dialect) => (
              <button
                key={dialect}
                onClick={() => setSqlDialect(dialect)}
                className={`px-3 py-1 text-xs rounded-lg font-mono transition-all uppercase cursor-pointer ${
                  sqlDialect === dialect
                    ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                {dialect}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Tables List & Table Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Tables Directory */}
        <div className="lg:col-span-4 bg-stone-900/90 border border-stone-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-stone-300 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              {isAr ? 'جداول قاعدة البيانات' : 'Database Tables'} ({ENTITY_DATABASE_SCHEMA.length})
            </h3>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-stone-500 absolute top-2.5 right-3" />
            <input
              type="text"
              placeholder={isAr ? 'بحث في الجداول والأعمدة...' : 'Search tables and columns...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-stone-950 border border-stone-800 rounded-xl pr-9 pl-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="space-y-1.5 max-h-[580px] overflow-y-auto pr-1">
            {filteredTables.map((tbl) => {
              const isSelected = selectedTable.name === tbl.name;
              return (
                <button
                  key={tbl.name}
                  onClick={() => setSelectedTable(tbl)}
                  className={`w-full text-right p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-1 ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-500/50 text-amber-300 shadow-md'
                      : 'bg-stone-950/60 border-stone-800/80 text-stone-300 hover:bg-stone-800/60 hover:border-stone-700'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-mono text-xs font-bold">{tbl.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-900 border border-stone-700 text-stone-400">
                      {tbl.columns.length} أعمدة
                    </span>
                  </div>
                  <div className="text-xs text-stone-400 font-heritage">{tbl.name_ar}</div>
                  <div className="text-[10px] text-stone-500 line-clamp-1">{tbl.description}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Table Inspection & DDL */}
        <div className="lg:col-span-8 space-y-6">
          {/* Table Header Details */}
          <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-800">
              <div>
                <div className="flex items-center gap-2">
                  <Table className="w-5 h-5 text-amber-400" />
                  <h3 className="font-mono text-base font-bold text-amber-300">{selectedTable.name}</h3>
                  <span className="text-xs text-stone-400 font-heritage">({selectedTable.name_ar})</span>
                </div>
                <p className="text-xs text-stone-400 mt-1">{selectedTable.description}</p>
              </div>

              <button
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-700 text-xs text-stone-200 flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
              >
                {copiedSQL ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>تم النسخ!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-amber-400" />
                    <span>نسخ SQL DDL</span>
                  </>
                )}
              </button>
            </div>

            {/* Columns Table */}
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-stone-800 text-stone-400 font-mono text-[11px]">
                    <th className="pb-2 font-medium">العمود (Column)</th>
                    <th className="pb-2 font-medium">النوع (Data Type)</th>
                    <th className="pb-2 font-medium">السمات والقيود</th>
                    <th className="pb-2 font-medium">البيان والوظيفة التراثية</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60 font-sans">
                  {selectedTable.columns.map((col) => (
                    <tr key={col.name} className="hover:bg-stone-800/30">
                      <td className="py-2.5 font-mono text-stone-200 font-bold flex items-center gap-1.5">
                        {col.isPrimary && (
                          <span title="Primary Key" className="p-0.5 rounded bg-amber-500/20 text-amber-400">
                            <Key className="w-3 h-3" />
                          </span>
                        )}
                        {col.isForeign && (
                          <span title="Foreign Key" className="p-0.5 rounded bg-sky-500/20 text-sky-400">
                            <Link2 className="w-3 h-3" />
                          </span>
                        )}
                        <span>{col.name}</span>
                      </td>
                      <td className="py-2.5 font-mono text-amber-400/90 text-[11px]">{col.type}</td>
                      <td className="py-2.5 space-x-1">
                        {!col.isNullable && (
                          <span className="px-1.5 py-0.5 rounded bg-stone-800 border border-stone-700 text-stone-300 text-[10px]">
                            NOT NULL
                          </span>
                        )}
                        {col.defaultValue && (
                          <span className="px-1.5 py-0.5 rounded bg-stone-950 border border-stone-800 font-mono text-[10px] text-stone-400">
                            DEF: {col.defaultValue}
                          </span>
                        )}
                        {col.isForeign && col.foreignTable && (
                          <span className="px-1.5 py-0.5 rounded bg-sky-950/60 border border-sky-600/40 text-sky-300 text-[10px] font-mono">
                            FK → {col.foreignTable}.{col.foreignColumn}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 text-stone-400 text-xs">{col.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Relations & Foreign Keys */}
          {selectedTable.relations && selectedTable.relations.length > 0 && (
            <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-5">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Link2 className="w-4 h-4" />
                العلاقات والروابط العلائقية (Relational Mapping)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedTable.relations.map((rel, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-stone-950 border border-stone-800 flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 shrink-0">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-800 text-amber-300 font-mono">
                          {rel.type}
                        </span>
                        <span className="font-mono text-xs font-bold text-stone-200">{rel.targetTable}</span>
                      </div>
                      <div className="text-[11px] text-stone-400 mt-1 font-mono">
                        مفتاح الربط: <code className="text-amber-400">{rel.foreignKey}</code>
                      </div>
                      <div className="text-xs text-stone-500 mt-0.5">{rel.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Generated SQL DDL Preview */}
          <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-stone-300 uppercase tracking-wider flex items-center gap-2">
                <FileCode className="w-4 h-4 text-amber-400" />
                تعريفات إنشاء الجدول البرمجية (DDL Script)
              </h4>
              <span className="text-[11px] font-mono text-stone-500 uppercase">{sqlDialect} compliant</span>
            </div>

            <pre className="p-4 rounded-xl bg-stone-950 border border-stone-800 text-xs font-mono text-amber-300/90 overflow-x-auto leading-relaxed max-h-72">
              <code>{generateDDL(selectedTable)}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
