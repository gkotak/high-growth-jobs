import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL || '';

export interface AdminStats {
  company_count: number;
  job_count: number;
  active_jobs: number;
  pending_enrichment: number;
}

export interface AdminCompany {
  id: string;
  name: string;
  website_url: string | null;
  last_scraped_at: string | null;
  job_count: number;
  pending_count: number;
  cb_rank: number | null;
}

export interface AdminJob {
  id: string;
  title: string;
  company_id: string;
  company_name: string;
  status: string;
  needs_deep_scrape: boolean;
  created_at: string;
  functional_area: string | null;
  experience_level: string | null;
  job_url: string;
}

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async (): Promise<AdminStats> => {
      const response = await fetch(`${API_URL}/api/admin/stats`);
      if (!response.ok) throw new Error('Failed to fetch admin stats');
      return response.json();
    },
  });
}

export function useAdminCompanies(
  page: number = 1, 
  limit: number = 20, 
  search?: string,
  sortBy: string = 'name',
  sortOrder: string = 'asc'
) {
  return useQuery({
    queryKey: ['admin', 'companies', page, limit, search, sortBy, sortOrder],
    queryFn: async (): Promise<{ data: AdminCompany[]; total: number }> => {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (search) params.append('search', search);
      params.append('sort_by', sortBy);
      params.append('sort_order', sortOrder);
      
      const response = await fetch(`${API_URL}/api/admin/companies?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch admin companies');
      return response.json();
    },
  });
}

export function useAdminCompaniesSearch(search?: string) {
  return useQuery({
    queryKey: ['admin', 'companies', 'search', search],
    queryFn: async (): Promise<{ data: AdminCompany[]; total: number }> => {
      if (!search || search.length < 2) return { data: [], total: 0 };
      const params = new URLSearchParams();
      params.append('page', '1');
      params.append('limit', '50');
      params.append('search', search);
      params.append('search_only', 'true');
      
      const response = await fetch(`${API_URL}/api/admin/companies?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch autocomplete companies');
      return response.json();
    },
    enabled: !!search && search.length >= 2,
  });
}

export function useAdminJobs(page: number = 1, limit: number = 50, search?: string, status?: string) {
  return useQuery({
    queryKey: ['admin', 'jobs', page, limit, search, status],
    queryFn: async (): Promise<{ data: AdminJob[]; total: number }> => {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (search) params.append('search', search);
      if (status) params.append('status', status);
      
      const response = await fetch(`${API_URL}/api/admin/jobs?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch admin jobs');
      return response.json();
    },
  });
}

export function useForceScrape() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (companyId: string) => {
      const response = await fetch(`${API_URL}/api/admin/companies/${companyId}/scrape`, {
        method: 'POST',
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to trigger scrape');
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success('Scrape task added to queue');
      // Invalidate queries to eventually show new data
      queryClient.invalidateQueries({ queryKey: ['admin', 'companies'] });
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
}

export function useForceEnrich() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (jobId: string) => {
      const response = await fetch(`${API_URL}/api/admin/jobs/${jobId}/enrich`, {
        method: 'POST',
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to trigger enrichment');
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success('Enrichment task added to queue');
      queryClient.invalidateQueries({ queryKey: ['admin', 'jobs'] });
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
}

export interface ExecutionLog {
  id: string;
  company_id?: string;
  job_id?: string;
  source: string;
  action: string;
  status: string;
  payload: any;
  created_at: string;
}

export function useExecutionLogs(companyId?: string) {
  return useQuery({
    queryKey: ['admin', 'logs', companyId || 'global'],
    queryFn: async (): Promise<ExecutionLog[]> => {
      const endpoint = companyId 
        ? `${API_URL}/api/admin/companies/${companyId}/logs`
        : `${API_URL}/api/admin/logs`;
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error('Failed to fetch logs');
      }
      return response.json();
    },
  });
}
