import React from 'react';
import { Link } from 'react-router-dom';
import { FileSpreadsheet, ArrowLeft, ShieldCheck } from 'lucide-react';
import { ReportsViewerTab } from '../components/ReportsViewerTab';

export const ReportsPage: React.FC = () => {
  return (
    <div data-testid="reports-page" className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              to="/admin/dashboard"
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Voltar ao Painel Executivo
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-indigo-600 p-2.5 text-white shadow-md shadow-indigo-600/20">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Central de Relatórios & Exportações
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Geração consolidada de relatórios ministeriais, financeiros e de membresia
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span>Exportação segura e auditada conforme LGPD</span>
        </div>
      </div>

      {/* Reports Viewer Engine */}
      <ReportsViewerTab />
    </div>
  );
};
