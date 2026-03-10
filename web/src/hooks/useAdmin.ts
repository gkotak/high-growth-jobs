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

export function useAdminCompanies(page: number = 1, limit: number = 20) {
  return useQuery({
    queryKey: ['admin', 'companies', page, limit],
    queryFn: async (): Promise<{ data: AdminCompany[]; total: number }> => {
      const response = await fetch(`${API_URL}/api/admin/companies?page=${page}&limit=${limit}`);
      if (!response.ok) throw new Error('Failed to fetch admin companies');
      return response.json();
    },
  });
}

export function useAdminJobs(page: number = 1, limit: number = 50, status?: string) {
  return useQuery({
    queryKey: ['admin', 'jobs', page, limit, status],
    queryFn: async (): Promise<{ data: AdminJob[]; total: number }> => {
      const url = new URL(`${API_URL}/api/admin/jobs`);
      url.searchParams.append('page', page.toString());
      url.searchParams.append('limit', limit.toString());
      if (status) url.searchParams.append('status', status);
      
      const response = await fetch(url.toString());
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
      if (!response.ok) throw new Error('Failed to trigger scrape');
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
      if (!response.ok) throw new Error('Failed to trigger enrichment');
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
