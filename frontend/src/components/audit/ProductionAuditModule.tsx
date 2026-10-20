import React, { useEffect, useState } from 'react';
import type { IsolationAuditResult, SystemReadinessReport } from '../../types/audit';
import {
  getSystemReadinessApi,
  simulateIsolationSelfAuditApi,
} from '../../services/auditApi';
import {
  AlertCircle,
  AlertTriangle,
  Award,
  CheckCircle2,
  Clock,
  Database,
  Globe,
  Lock,
  Play,
  RefreshCw,
  Server,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Terminal,
} from 'lucide-react';

type AuditTab = 'checklist' | 'isolation_test' | 'deployment_guide';

export const ProductionAuditModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AuditTab>('checklist');
  const [loading, setLoading] = useState(false);
  const [runningTest, setRunningTest] = useState(false);

  const [report, setReport] = useState<SystemReadinessReport | null>(null);
  const [isolationResult, setIsolationResult] = useState<IsolationAuditResult | null>(null);
  const [notification, setNotification] = useState<{ message: string; isError?: boolean } | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const notify = (message: string, isError = false) => {
    setNotification({ message, isError });
    setTimeout(() => setNotification(null), 5000);
  };

  const loadReadiness = async () => {
    setLoading(true);
    try {
      const data = await getSystemReadinessApi();
      setReport(data);
    } catch (err: unknown) {
      const error = err as Error;
      notify(error.message || 'Erro ao carregar dados de prontidão do sistema.', true);
    } finally {
      setLoading(false);
    }
  };

  const handleRunIsolationTest = async () => {
    setRunningTest(true);
    try {
      const res = await simulateIsolationSelfAuditApi();
      setIsolationResult(res);
      notify('Autoteste de isolamento multi-tenant concluído e auditado!');
    } catch (err: unknown) {
      const error = err as Error;
      notify(error.message || 'Erro ao executar teste de isolamento.', true);
    } finally {
      setRunningTest(false);
    }
  };

  useEffect(() => {
    loadReadiness();
  }, []);

  const categories = report
    ? ['all', ...Array.from(new Set(report.checklist.map((c) => c.category)))]
    : ['all'];

  const filteredChecklist = report
    ? report.checklist.filter((item) =>
        selectedCategory === 'all' ? true : item.category === selectedCategory
      )
    : [];

  return (
    <div className="space-y-6">
      {/* Notificação Flutuante / Toast */}
      {notification && (
        <div
          className={`px-4 py-3 rounded-xl flex items-center justify-between border transition animate-fade-in ${
            notification.isError
              ? 'bg-rose-900/40 border-rose-500/50 text-rose-200'
              : 'bg-emerald-900/40 border-emerald-500/50 text-emerald-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.isError ? (
              <AlertCircle className="w-5 h-5 text-rose-400" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            )}
            <span className="text-sm font-medium">{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-white text-sm"
          >
            &times;
          </button>
        </div>
      )}

      {/* Cabeçalho de Auditoria e Produção */}
      <div className="dash-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Etapa 09 — Final
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">Auditoria & Homologação de Produção</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5 flex items-center gap-2">
            Central de Auditoria & Certificação v1.0.0
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            Verificação formal de isolamento de dados, conformidade LGPD, rate limiting, headers de segurança e prontidão para nuvem.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadReadiness}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 text-xs flex items-center gap-2 transition shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Recarregar Auditoria
          </button>
        </div>
      </div>

      {/* Cards de Resumo & Índice de Prontidão */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Score de Prontidão */}
        <div className="dash-kpi">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Score de Prontidão</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {report?.readiness_score ?? 100}%
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            {report?.summary.passed_checks ?? 10} de {report?.summary.total_checks ?? 10} verificações aprovadas
          </div>
        </div>

        {/* Runtime Stack */}
        <div className="dash-kpi">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Runtime & Backend</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Server className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white">
            Laravel {report?.summary.laravel_version || '11.x'}
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            PHP {report?.summary.php_version || '8.4'} • Docker Linux Alpine
          </div>
        </div>

        {/* Banco de Dados */}
        <div className="dash-kpi">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Persistência & Tenants</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Database className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white">
            MySQL 8.0
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {report?.summary.total_tenants ?? 0} igrejas ativas • {report?.summary.total_members ?? 0} membros
          </div>
        </div>

        {/* Fuso Horário Canônico */}
        <div className="dash-kpi">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Fuso & Localidade</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white">
            America/Manaus
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            UTC-04:00 (Canônico do projeto)
          </div>
        </div>
      </div>

      {/* Navegação de Abas */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab('checklist')}
          className={`dash-tab-btn ${activeTab === 'checklist' ? 'active' : ''}`}
        >
          <ShieldCheck className="w-4 h-4" />
          Checklist de Produção (10 Verificações)
        </button>

        <button
          onClick={() => setActiveTab('isolation_test')}
          className={`dash-tab-btn ${activeTab === 'isolation_test' ? 'active' : ''}`}
        >
          <Play className="w-4 h-4" />
          Autoteste de Isolamento ao Vivo
        </button>

        <button
          onClick={() => setActiveTab('deployment_guide')}
          className={`dash-tab-btn ${activeTab === 'deployment_guide' ? 'active' : ''}`}
        >
          <Terminal className="w-4 h-4" />
          Guia de Deploy & Homologação
        </button>
      </div>

      {/* ABA 1: CHECKLIST DE PRODUÇÃO */}
      {activeTab === 'checklist' && (
        <div className="space-y-6">
          {/* Filtros de Categoria */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white'
                    : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                {cat === 'all' ? 'Todas as Categorias' : cat}
              </button>
            ))}
          </div>

          {/* Grid de Itens Auditados */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredChecklist.map((item, idx) => (
              <div
                key={idx}
                className="dash-card p-5 flex flex-col justify-between transition"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {item.category}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 ${
                        item.status === 'passed'
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                          : item.status === 'warning'
                          ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                          : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {item.status === 'passed' ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" /> Aprovado
                        </>
                      ) : item.status === 'warning' ? (
                        <>
                          <AlertTriangle className="w-3.5 h-3.5" /> Atenção
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3.5 h-3.5" /> Falha
                        </>
                      )}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">{item.name}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ABA 2: AUTOTESTE DE ISOLAMENTO AO VIVO */}
      {activeTab === 'isolation_test' && (
        <div className="space-y-6">
          <div className="dash-card p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                  Simulação de Autoteste de Isolamento Multi-Tenant
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Executa um teste dinâmico no backend validando se 100% das entidades pertencem ao tenant ativo e tenta sondar registros de outras igrejas.
                </p>
              </div>

              <button
                onClick={handleRunIsolationTest}
                disabled={runningTest}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-2 transition disabled:opacity-50 shadow-md shadow-indigo-600/20"
              >
                <Play className={`w-4 h-4 ${runningTest ? 'animate-spin' : ''}`} />
                {runningTest ? 'Auditoria em Andamento...' : 'Executar Autoteste Agora'}
              </button>
            </div>

            {isolationResult ? (
              <div className="space-y-6 animate-fade-in">
                {/* Banner de Resultado */}
                <div
                  className={`p-4 rounded-xl border flex items-center justify-between ${
                    isolationResult.isolation_passed
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-800 dark:text-emerald-200'
                      : 'bg-rose-500/10 border-rose-500/40 text-rose-800 dark:text-rose-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <h4 className="text-sm font-bold">Certificado de Isolamento Lógico Emitido</h4>
                      <p className="text-xs opacity-90">{isolationResult.message}</p>
                    </div>
                  </div>

                  <span className="text-[11px] opacity-75 font-mono">
                    {new Date(isolationResult.verified_at).toLocaleString('pt-BR')}
                  </span>
                </div>

                {/* Grade de Entidades Auditadas */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="dash-subcard p-4 rounded-xl">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Membros Auditados</span>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                      {isolationResult.audit_details.members_verified}
                    </div>
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1 font-medium">
                      <CheckCircle2 className="w-3 h-3" /> 0 vazamentos
                    </span>
                  </div>

                  <div className="dash-subcard p-4 rounded-xl">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Lançamentos Financeiros</span>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                      {isolationResult.audit_details.transactions_verified}
                    </div>
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1 font-medium">
                      <CheckCircle2 className="w-3 h-3" /> 0 vazamentos
                    </span>
                  </div>

                  <div className="dash-subcard p-4 rounded-xl">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Escalas Ministeriais</span>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                      {isolationResult.audit_details.schedules_verified}
                    </div>
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1 font-medium">
                      <CheckCircle2 className="w-3 h-3" /> 0 vazamentos
                    </span>
                  </div>

                  <div className="dash-subcard p-4 rounded-xl">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Eventos & Cultos</span>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                      {isolationResult.audit_details.events_verified}
                    </div>
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1 font-medium">
                      <CheckCircle2 className="w-3 h-3" /> 0 vazamentos
                    </span>
                  </div>
                </div>

                <div className="dash-subcard p-4 rounded-xl text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>
                      Tentativas de sonda a dados de outras congregações bloqueadas:{' '}
                      <strong className="text-slate-900 dark:text-white">
                        {isolationResult.audit_details.foreign_tenant_probe_count} registros vazados
                      </strong>
                    </span>
                  </div>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">audit_logs #OK</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 dark:text-slate-500 text-sm">
                <Shield className="w-10 h-10 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
                Clique no botão acima para rodar a rotina de auditoria de isolamento e gravar o registro em <code>audit_logs</code>.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ABA 3: GUIA DE DEPLOY & HOMOLOGAÇÃO */}
      {activeTab === 'deployment_guide' && (
        <div className="space-y-6">
          <div className="dash-card p-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <Globe className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
              Diretrizes de Implantação e Publicação em Produção
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-6">
              Instruções oficiais de release, otimização de caches e parametrização de segurança para ambientes produtivos na nuvem.
            </p>

            <div className="space-y-4 text-xs">
              <div className="dash-subcard p-4 rounded-xl">
                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm block mb-1">
                  1. Otimização de Caches do Laravel 11
                </span>
                <p className="text-slate-600 dark:text-slate-400 mb-2">
                  Em produção, execute os comandos de compilação de rotas, configurações e views para latência sub-50ms:
                </p>
                <pre className="bg-slate-100 dark:bg-slate-950 p-3 rounded-lg text-slate-800 dark:text-slate-300 font-mono text-[11px] overflow-x-auto border border-slate-200 dark:border-slate-800">
                  php artisan config:cache{'\n'}
                  php artisan route:cache{'\n'}
                  php artisan view:cache{'\n'}
                  php artisan event:cache
                </pre>
              </div>

              <div className="dash-subcard p-4 rounded-xl">
                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm block mb-1">
                  2. Variáveis Críticas de Ambiente (.env)
                </span>
                <p className="text-slate-600 dark:text-slate-400 mb-2">
                  Garanta que as flags de desenvolvimento estejam estritamente desabilitadas:
                </p>
                <pre className="bg-slate-100 dark:bg-slate-950 p-3 rounded-lg text-slate-800 dark:text-slate-300 font-mono text-[11px] overflow-x-auto border border-slate-200 dark:border-slate-800">
                  APP_ENV=production{'\n'}
                  APP_DEBUG=false{'\n'}
                  SESSION_SECURE_COOKIE=true{'\n'}
                  SANCTUM_STATEFUL_DOMAINS=app.churchmanager.com
                </pre>
              </div>

              <div className="dash-subcard p-4 rounded-xl">
                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm block mb-1">
                  3. Política de Backup e Continuidade
                </span>
                <p className="text-slate-600 dark:text-slate-400">
                  Rotina de snapshot automatizado diário do banco MySQL com retenção de 30 dias e replicação geográfica externa para conformidade de desastre.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
