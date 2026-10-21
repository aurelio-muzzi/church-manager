/**
 * ChurchManager — Executive Dashboard & Reports Validation Schemas
 * Multi-Tenant SaaS Platform
 */

import { z } from 'zod';

export const reportFilterSchema = z.object({
  reportType: z.enum([
    'members_roster',
    'financial_cashflow',
    'tithes_offerings',
    'attendance_summary',
    'ministry_volunteers',
  ]),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  congregationId: z.string().optional(),
  search: z.string().optional(),
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().default(10),
  sortBy: z.string().optional(),
  sortDirection: z.enum(['asc', 'desc']).default('asc'),
});

export type ReportFilterFormData = z.infer<typeof reportFilterSchema>;
