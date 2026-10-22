/**
 * ChurchManager — Executive Dashboard & BI API Service
 * Decoupled REST client with mock adapter for development and testing.
 */

import { http } from '@/services/http/client';
import type {
  ExecutiveMetrics,
  MembershipGrowthPoint,
  FinancialCashflowPoint,
  AttendanceTrendPoint,
  DemographicDataPoint,
  CongregationComparisonPoint,
  ReportFilterParams,
  PaginatedReportResult,
} from '@/modules/dashboard/types';
import {
  MOCK_MEMBERS,
  MOCK_CONGREGATIONS,
  MOCK_VISITORS,
  MOCK_EVENTS,
  MOCK_ATTENDANCE_RECORDS,
  MOCK_FINANCIAL_TRANSACTIONS,
  MOCK_SCHEDULES,
  MOCK_CHANGE_REQUESTS,
} from '@/services/adapters/fixtures';

const IS_MOCK = import.meta.env.VITE_USE_DEV_MOCK !== 'false';

export const dashboardService = {
  /**
   * Resets any state for tests
   */
  resetMockStores() {
    // Stateless queries against fixtures
  },

  /**
   * Executive KPIs for leadership overview
   */
  async getExecutiveMetrics(congregationId?: string): Promise<ExecutiveMetrics> {
    if (IS_MOCK) {
      let members = MOCK_MEMBERS;
      let txs = MOCK_FINANCIAL_TRANSACTIONS;
      const attendance = MOCK_ATTENDANCE_RECORDS;

      if (congregationId && congregationId !== 'all') {
        members = members.filter((m) => m.congregationId === congregationId);
        txs = txs.filter((t) => t.congregationId === congregationId);
      }

      const totalMembers = members.length;
      const activeMembers = members.filter((m) => m.membershipStatus === 'active').length;
      const activeMembersPercent =
        totalMembers > 0 ? Math.round((activeMembers / totalMembers) * 100) : 100;

      const monthlyIncome = txs
        .filter((t) => t.type === 'income' && t.status === 'paid' && t.date.startsWith('2026-10'))
        .reduce((sum, t) => sum + t.amount, 0);

      const monthlyExpenses = txs
        .filter((t) => t.type === 'expense' && t.status === 'paid' && t.date.startsWith('2026-10'))
        .reduce((sum, t) => sum + t.amount, 0);

      const netOperatingBalance = monthlyIncome - monthlyExpenses;

      const averageServiceAttendance =
        attendance.length > 0 ? Math.round(attendance.length / 2) : 280;

      // Count unique volunteers across schedules
      const volunteerSet = new Set<string>();
      MOCK_SCHEDULES.forEach((s) => {
        s.volunteers.forEach((v) => volunteerSet.add(v.memberId));
      });
      const activeVolunteers = volunteerSet.size;
      const volunteerEngagementRate =
        activeMembers > 0 ? Math.round((activeVolunteers / activeMembers) * 100) : 35;

      const convertedVisitors = MOCK_VISITORS.filter((v) => v.status === 'converted').length;
      const visitorConversionRate =
        MOCK_VISITORS.length > 0
          ? Math.round((convertedVisitors / MOCK_VISITORS.length) * 100)
          : 33;

      const pendingSecretaryRequests = MOCK_CHANGE_REQUESTS.filter(
        (r) => r.status === 'pending'
      ).length;

      const unreconciledTransactionsCount = txs.filter((t) => !t.isReconciled).length;

      return {
        totalMembers,
        membersGrowthPercent: 12.5,
        activeMembers,
        activeMembersPercent,
        monthlyIncome,
        incomeGrowthPercent: 14.2,
        monthlyExpenses,
        expensesGrowthPercent: -3.8,
        netOperatingBalance,
        averageServiceAttendance,
        attendanceGrowthPercent: 8.5,
        activeVolunteers,
        volunteerEngagementRate,
        visitorConversionRate,
        pendingSecretaryRequests,
        unreconciledTransactionsCount,
      };
    }

    return http.get<ExecutiveMetrics>('/api/v1/tenant/dashboard/metrics', {
      params: { congregationId },
    });
  },

  /**
   * 12-Month membership growth curve
   */
  async getMembershipGrowthChart(congregationId?: string): Promise<MembershipGrowthPoint[]> {
    if (IS_MOCK) {
      const factor =
        congregationId === 'cong-01' ? 0.65 :
        congregationId === 'cong-02' ? 0.22 :
        congregationId === 'cong-03' ? 0.13 : 1.0;

      const baseGrowth = [
        { month: '2025-11', monthName: 'Nov/25', totalMembers: 410, newAdmissions: 6, transfers: 1 },
        { month: '2025-12', monthName: 'Dez/25', totalMembers: 422, newAdmissions: 14, transfers: 2 },
        { month: '2026-01', monthName: 'Jan/26', totalMembers: 430, newAdmissions: 10, transfers: 2 },
        { month: '2026-02', monthName: 'Fev/26', totalMembers: 442, newAdmissions: 15, transfers: 3 },
        { month: '2026-03', monthName: 'Mar/26', totalMembers: 450, newAdmissions: 11, transfers: 3 },
        { month: '2026-04', monthName: 'Abr/26', totalMembers: 458, newAdmissions: 9, transfers: 1 },
        { month: '2026-05', monthName: 'Mai/26', totalMembers: 465, newAdmissions: 8, transfers: 1 },
        { month: '2026-06', monthName: 'Jun/26', totalMembers: 472, newAdmissions: 12, transfers: 5 },
        { month: '2026-07', monthName: 'Jul/26', totalMembers: 476, newAdmissions: 7, transfers: 3 },
        { month: '2026-08', monthName: 'Ago/26', totalMembers: 480, newAdmissions: 6, transfers: 2 },
        { month: '2026-09', monthName: 'Set/26', totalMembers: 485, newAdmissions: 8, transfers: 3 },
        { month: '2026-10', monthName: 'Out/26', totalMembers: 492, newAdmissions: 11, transfers: 4 },
      ];

      return baseGrowth.map((g) => ({
        ...g,
        totalMembers: Math.max(1, Math.round(g.totalMembers * factor)),
        newAdmissions: Math.max(0, Math.round(g.newAdmissions * factor)),
        transfers: Math.max(0, Math.round(g.transfers * factor)),
      }));
    }

    return http.get<MembershipGrowthPoint[]>('/api/v1/tenant/dashboard/charts/membership', {
      params: { congregationId },
    });
  },

  /**
   * 12-Month income vs expenses comparative chart
   */
  async getFinancialCashflowChart(congregationId?: string): Promise<FinancialCashflowPoint[]> {
    if (IS_MOCK) {
      const factor =
        congregationId === 'cong-01' ? 0.65 :
        congregationId === 'cong-02' ? 0.22 :
        congregationId === 'cong-03' ? 0.13 : 1.0;

      const baseCashflow = [
        { month: '2025-11', monthName: 'Nov/25', income: 38500, tithes: 31000, offerings: 7500, expenses: 31200, net: 7300 },
        { month: '2025-12', monthName: 'Dez/25', income: 52000, tithes: 41000, offerings: 11000, expenses: 38500, net: 13500 },
        { month: '2026-01', monthName: 'Jan/26', income: 41000, tithes: 33000, offerings: 8000, expenses: 32000, net: 9000 },
        { month: '2026-02', monthName: 'Fev/26', income: 43500, tithes: 35000, offerings: 8500, expenses: 33800, net: 9700 },
        { month: '2026-03', monthName: 'Mar/26', income: 46000, tithes: 37500, offerings: 8500, expenses: 35100, net: 10900 },
        { month: '2026-04', monthName: 'Abr/26', income: 44200, tithes: 36000, offerings: 8200, expenses: 34500, net: 9700 },
        { month: '2026-05', monthName: 'Mai/26', income: 48000, tithes: 39000, offerings: 9000, expenses: 36200, net: 11800 },
        { month: '2026-06', monthName: 'Jun/26', income: 47500, tithes: 38000, offerings: 9500, expenses: 35800, net: 11700 },
        { month: '2026-07', monthName: 'Jul/26', income: 46800, tithes: 37200, offerings: 9600, expenses: 36000, net: 10800 },
        { month: '2026-08', monthName: 'Ago/26', income: 49200, tithes: 39500, offerings: 9700, expenses: 37100, net: 12100 },
        { month: '2026-09', monthName: 'Set/26', income: 50500, tithes: 40500, offerings: 10000, expenses: 38200, net: 12300 },
        { month: '2026-10', monthName: 'Out/26', income: 54800, tithes: 44200, offerings: 10600, expenses: 39500, net: 15300 },
      ];

      return baseCashflow.map((c) => ({
        ...c,
        income: Math.round(c.income * factor),
        tithes: Math.round(c.tithes * factor),
        offerings: Math.round(c.offerings * factor),
        expenses: Math.round(c.expenses * factor),
        net: Math.round(c.net * factor),
      }));
    }

    return http.get<FinancialCashflowPoint[]>('/api/v1/tenant/dashboard/charts/cashflow', {
      params: { congregationId },
    });
  },

  /**
   * Recent service attendance trends
   */
  async getAttendanceChart(congregationId?: string): Promise<AttendanceTrendPoint[]> {
    if (IS_MOCK) {
      const factor =
        congregationId === 'cong-01' ? 0.65 :
        congregationId === 'cong-02' ? 0.22 :
        congregationId === 'cong-03' ? 0.13 : 1.0;

      const baseAttendance = [
        { date: '15/09', serviceName: 'Culto Domingo Noite', inPerson: 380, online: 220, total: 600, capacityPercent: 95 },
        { date: '22/09', serviceName: 'Culto Domingo Noite', inPerson: 365, online: 210, total: 575, capacityPercent: 91 },
        { date: '25/09', serviceName: 'Quarta de Ensino', inPerson: 195, online: 160, total: 355, capacityPercent: 49 },
        { date: '29/09', serviceName: 'Culto de Celebração', inPerson: 390, online: 240, total: 630, capacityPercent: 98 },
        { date: '06/10', serviceName: 'Culto de Santa Ceia', inPerson: 410, online: 280, total: 690, capacityPercent: 100 },
        { date: '13/10', serviceName: 'Culto Domingo Noite', inPerson: 375, online: 230, total: 605, capacityPercent: 94 },
        { date: '16/10', serviceName: 'Quarta Doutrina', inPerson: 210, online: 180, total: 390, capacityPercent: 53 },
        { date: '20/10', serviceName: 'Culto da Família', inPerson: 395, online: 250, total: 645, capacityPercent: 99 },
      ];

      return baseAttendance.map((a) => ({
        ...a,
        inPerson: Math.round(a.inPerson * factor),
        online: Math.round(a.online * factor),
        total: Math.round(a.total * factor),
      }));
    }

    return http.get<AttendanceTrendPoint[]>('/api/v1/tenant/dashboard/charts/attendance', {
      params: { congregationId },
    });
  },

  /**
   * Church demographic age group breakdown (with LGPD minor spotlight)
   */
  async getDemographicsChart(congregationId?: string): Promise<DemographicDataPoint[]> {
    if (IS_MOCK) {
      const factor =
        congregationId === 'cong-01' ? 0.65 :
        congregationId === 'cong-02' ? 0.22 :
        congregationId === 'cong-03' ? 0.13 : 1.0;

      const baseDemographics = [
        { group: 'Crianças e Juniores (< 18) • LGPD', count: 88, percentage: 18, color: '#ec4899' },
        { group: 'Jovens e Universitários (18 a 29)', count: 137, percentage: 28, color: '#8b5cf6' },
        { group: 'Adultos e Famílias (30 a 59)', count: 206, percentage: 42, color: '#3b82f6' },
        { group: 'Melhor Idade (60+)', count: 59, percentage: 12, color: '#10b981' },
      ];

      return baseDemographics.map((d) => ({
        ...d,
        count: Math.max(1, Math.round(d.count * factor)),
      }));
    }

    return http.get<DemographicDataPoint[]>('/api/v1/tenant/dashboard/charts/demographics', {
      params: { congregationId },
    });
  },

  /**
   * Sede vs Filiais performance comparison
   */
  async getCongregationComparison(): Promise<CongregationComparisonPoint[]> {
    if (IS_MOCK) {
      return MOCK_CONGREGATIONS.map((c) => ({
        id: c.id,
        name: c.name,
        isMain: c.isMain,
        membersCount: c.membersCount,
        averageAttendance: c.isMain ? 385 : c.id === 'cong-02' ? 120 : 95,
        monthlyIncome: c.isMain ? 38200 : c.id === 'cong-02' ? 9500 : 7100,
        activeVolunteersCount: c.isMain ? 48 : c.id === 'cong-02' ? 18 : 14,
      }));
    }

    return http.get<CongregationComparisonPoint[]>('/api/v1/tenant/dashboard/congregations');
  },

  /**
   * Paginated reporting engine with dynamic schemas and search
   */
  async generateReportData(filters: ReportFilterParams): Promise<PaginatedReportResult> {
    if (IS_MOCK) {
      const page = filters.page || 1;
      const pageSize = filters.pageSize || 10;
      const search = (filters.search || '').toLowerCase().trim();

      switch (filters.reportType) {
        case 'members_roster': {
          let rows = MOCK_MEMBERS.map((m) => ({
            id: m.id,
            matricula: `ROL-${m.id.replace('mem-', '00')}`,
            name: m.name,
            email: m.email || 'Não cadastrado',
            phone: m.phone || '—',
            congregation: m.congregationName || 'Sede',
            maritalStatus: m.maritalStatus,
            baptismDate: m.baptismDate || 'Pendente',
            status: m.membershipStatus,
            isMinor: m.isMinor ? 'Sim (LGPD)' : 'Não',
          }));

          if (search) {
            rows = rows.filter(
              (r) =>
                r.name.toLowerCase().includes(search) ||
                r.matricula.toLowerCase().includes(search) ||
                r.email.toLowerCase().includes(search)
            );
          }

          if (filters.congregationId && filters.congregationId !== 'all') {
            const cong = MOCK_CONGREGATIONS.find((c) => c.id === filters.congregationId);
            if (cong) rows = rows.filter((r) => r.congregation === cong.name);
          }

          const total = rows.length;
          const totalPages = Math.ceil(total / pageSize) || 1;
          const paginatedItems = rows.slice((page - 1) * pageSize, page * pageSize);

          return {
            reportType: 'members_roster',
            title: 'Livro de Rol de Membros Eclesiástico',
            description: 'Relação completa de membros com matrícula, congregação e situação eclesiástica.',
            columns: [
              { key: 'matricula', label: 'Matrícula', format: 'text' },
              { key: 'name', label: 'Nome Completo', format: 'text' },
              { key: 'congregation', label: 'Congregação', format: 'text' },
              { key: 'phone', label: 'Telefone', format: 'text' },
              { key: 'baptismDate', label: 'Batismo', format: 'text' },
              { key: 'isMinor', label: 'Menor de Idade', format: 'badge' },
              { key: 'status', label: 'Situação', format: 'badge' },
            ],
            items: paginatedItems,
            total,
            page,
            pageSize,
            totalPages,
            generatedAt: new Date().toISOString(),
            summaryTotals: { totalMembros: total },
          };
        }

        case 'financial_cashflow': {
          let rows = MOCK_FINANCIAL_TRANSACTIONS.map((t) => ({
            id: t.id,
            date: t.date,
            description: t.description,
            type: t.type === 'income' ? 'Receita' : 'Despesa',
            categoryType: t.categoryType,
            amount: t.amount,
            status: t.status,
            paymentMethod: t.paymentMethod,
            reconciled: t.isReconciled ? 'Conciliado' : 'Pendente',
          }));

          if (search) {
            rows = rows.filter((r) => r.description.toLowerCase().includes(search));
          }

          const totalIncome = rows
            .filter((r) => r.type === 'Receita')
            .reduce((s, r) => s + r.amount, 0);
          const totalExpenses = rows
            .filter((r) => r.type === 'Despesa')
            .reduce((s, r) => s + r.amount, 0);

          const total = rows.length;
          const totalPages = Math.ceil(total / pageSize) || 1;
          const paginatedItems = rows.slice((page - 1) * pageSize, page * pageSize);

          return {
            reportType: 'financial_cashflow',
            title: 'Extrato Geral do Livro Caixa & Fluxo Financeiro',
            description: 'Movimentações detalhadas com classificação contábil e conciliação bancária.',
            columns: [
              { key: 'date', label: 'Data', format: 'date' },
              { key: 'description', label: 'Histórico / Descrição', format: 'text' },
              { key: 'type', label: 'Tipo', format: 'badge' },
              { key: 'paymentMethod', label: 'Método', format: 'text' },
              { key: 'reconciled', label: 'Conciliação', format: 'badge' },
              { key: 'amount', label: 'Valor (R$)', format: 'currency' },
            ],
            items: paginatedItems,
            total,
            page,
            pageSize,
            totalPages,
            generatedAt: new Date().toISOString(),
            summaryTotals: {
              totalReceitas: totalIncome,
              totalDespesas: totalExpenses,
              saldoLiquido: totalIncome - totalExpenses,
            },
          };
        }

        case 'tithes_offerings': {
          let rows = MOCK_FINANCIAL_TRANSACTIONS.filter((t) => t.type === 'income').map((t) => ({
            id: t.id,
            date: t.date,
            receiptNumber: t.receiptNumber || 'REC-S/N',
            contributor: t.contributorName || 'Anônimo / Oferta Altar',
            offeringType: t.offeringType === 'tithe' ? 'Dízimo' : 'Oferta',
            paymentMethod: t.paymentMethod,
            amount: t.amount,
          }));

          if (search) {
            rows = rows.filter(
              (r) =>
                r.contributor.toLowerCase().includes(search) ||
                r.receiptNumber.toLowerCase().includes(search)
            );
          }

          const total = rows.length;
          const totalPages = Math.ceil(total / pageSize) || 1;
          const paginatedItems = rows.slice((page - 1) * pageSize, page * pageSize);
          const totalArrecadado = rows.reduce((s, r) => s + r.amount, 0);

          return {
            reportType: 'tithes_offerings',
            title: 'Relatório Analítico de Dízimos e Ofertas Eclesiásticas',
            description: 'Arrecadações de culto e repasses com comprovantes emitidos pela tesouraria.',
            columns: [
              { key: 'date', label: 'Data', format: 'date' },
              { key: 'receiptNumber', label: 'Nº Recibo', format: 'text' },
              { key: 'contributor', label: 'Contribuinte / Dizimista', format: 'text' },
              { key: 'offeringType', label: 'Finalidade', format: 'badge' },
              { key: 'paymentMethod', label: 'Forma', format: 'text' },
              { key: 'amount', label: 'Valor (R$)', format: 'currency' },
            ],
            items: paginatedItems,
            total,
            page,
            pageSize,
            totalPages,
            generatedAt: new Date().toISOString(),
            summaryTotals: { totalArrecadado },
          };
        }

        case 'attendance_summary': {
          const rows = MOCK_EVENTS.map((e) => {
            const inPersonAttendance = 280;
            const onlineViewers = 150;
            return {
              id: e.id,
              date: e.startDate,
              title: e.title,
              type: e.type === 'service' ? 'Culto Oficial' : 'Evento Especial',
              inPersonAttendance,
              onlineViewers,
              maxCapacity: e.maxCapacity || 400,
              totalAttendance: inPersonAttendance + onlineViewers,
            };
          });

          const total = rows.length;
          const totalPages = Math.ceil(total / pageSize) || 1;
          const paginatedItems = rows.slice((page - 1) * pageSize, page * pageSize);

          return {
            reportType: 'attendance_summary',
            title: 'Relatório Executivo de Presença e Frequência de Cultos',
            description: 'Histórico de público em celebrações com comparação presencial vs online.',
            columns: [
              { key: 'date', label: 'Data', format: 'date' },
              { key: 'title', label: 'Celebração / Culto', format: 'text' },
              { key: 'type', label: 'Categoria', format: 'badge' },
              { key: 'inPersonAttendance', label: 'Presencial', format: 'text' },
              { key: 'onlineViewers', label: 'Online', format: 'text' },
              { key: 'totalAttendance', label: 'Público Total', format: 'text' },
            ],
            items: paginatedItems,
            total,
            page,
            pageSize,
            totalPages,
            generatedAt: new Date().toISOString(),
          };
        }

        case 'ministry_volunteers':
        default: {
          const rows: Record<string, string | number>[] = [];
          MOCK_SCHEDULES.forEach((s) => {
            s.volunteers.forEach((v) => {
              rows.push({
                id: `${s.id}-${v.id}`,
                date: s.date,
                ministry: s.ministryName,
                role: v.roleName,
                memberName: v.memberName,
                scheduleTitle: s.title,
                status: v.status === 'confirmed' ? 'Confirmado' : v.status === 'pending' ? 'Pendente' : 'Recusado',
              });
            });
          });

          const total = rows.length;
          const totalPages = Math.ceil(total / pageSize) || 1;
          const paginatedItems = rows.slice((page - 1) * pageSize, page * pageSize);

          return {
            reportType: 'ministry_volunteers',
            title: 'Quadro Geral de Voluntariado e Escalas Ministeriais',
            description: 'Alocação de voluntários por departamento, funções e respostas de presença.',
            columns: [
              { key: 'date', label: 'Data Escala', format: 'date' },
              { key: 'ministry', label: 'Ministério', format: 'text' },
              { key: 'role', label: 'Função', format: 'badge' },
              { key: 'memberName', label: 'Voluntário', format: 'text' },
              { key: 'scheduleTitle', label: 'Evento / Culto', format: 'text' },
              { key: 'status', label: 'Situação', format: 'badge' },
            ],
            items: paginatedItems,
            total,
            page,
            pageSize,
            totalPages,
            generatedAt: new Date().toISOString(),
          };
        }
      }
    }

    return http.post<PaginatedReportResult>('/api/v1/tenant/dashboard/reports', filters);
  },

  /**
   * Export report as CSV string or download trigger
   */
  async exportReportCsv(filters: ReportFilterParams): Promise<string> {
    const reportData = await this.generateReportData({ ...filters, page: 1, pageSize: 1000 });
    const headers = reportData.columns.map((c) => c.label).join(',');
    const rows = reportData.items.map((item) =>
      reportData.columns.map((col) => `"${String(item[col.key] ?? '')}"`).join(',')
    );
    return [headers, ...rows].join('\n');
  },
};
