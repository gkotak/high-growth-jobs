import { useQuery } from '@tanstack/react-query';
import { Job, Company, Signal } from '../data/mockJobs';
import { FilterState } from '../widgets/landing/types';

const API_URL = import.meta.env.VITE_API_URL || '';

/** Safe parse for funding strings like "$150M", "$1.2B", or plain numeric strings. Returns 0 on failure. */
function parseAbbreviatedNumber(raw: string | undefined | null): number {
    if (!raw || typeof raw !== 'string') return 0;
    const s = raw.trim().replace(/[$,]/g, '');
    const multipliers: Record<string, number> = { K: 1_000, M: 1_000_000, B: 1_000_000_000 };
    const match = s.match(/^([\d.]+)([KMB])?$/i);
    if (!match) return 0;
    const num = parseFloat(match[1]);
    if (isNaN(num)) return 0;
    const suffix = match[2]?.toUpperCase();
    return suffix ? num * (multipliers[suffix] ?? 1) : num;
}

const FUNDING_STAGE_MAP: Record<string, string[]> = {
    "Seed": ["Seed"],
    "Series A": ["Series A"],
    "Series B": ["Series B"],
    "Series C": ["Series C"],
    "Series D": ["Series D"],
    "Series E+": ["Series E", "Series F", "Series G", "Series H", "Series I"],
};

export function mapJob(job: any): Job {
    if (!job) throw new Error("Job data is undefined");
    const comp = job.company || {};
    const totalFundingNum = parseAbbreviatedNumber(comp.total_funding_amount);

    const websiteUrl = comp.website_url || '';
    const frontendCompany: Company = {
        id: comp.id,
        name: comp.name,
        logo: comp.logo_url || (websiteUrl
            ? `https://logo.clearbit.com/${websiteUrl.replace(/^https?:\/\//, '').split('/')[0]}`
            : `https://ui-avatars.com/api/?name=${encodeURIComponent(comp.name || '?')}&background=f5c518&color=111&bold=true`),
        description: comp.description || `${comp.name} is a high-growth startup.`,
        totalFunding: totalFundingNum,
        lastFundingAmount: comp.last_funding_amount,
        fundingStage: comp.stage || 'Unknown',
        investors: comp.vc_firms ? comp.vc_firms.map((vc: any) => vc.name) : [],
        employeeCount: comp.employee_count || 'Unknown',
        founded: comp.founded_date || 0,
        careerUrl: comp.career_url || job.job_url || comp.website_url,
        linkedinUrl: comp.linkedin_url || '#',
        twitterUrl: comp.twitter_url,
        websiteUrl: comp.website_url,
        glassdoorRating: 0,
        industry: comp.industries || 'Technology'
    };

    const signals: Signal[] = [];
    if (frontendCompany.fundingStage !== 'Unknown') {
        signals.push({ type: 'series', label: frontendCompany.fundingStage });
    }
    if (job.is_remote) {
        signals.push({ type: 'remote', label: 'Remote' });
    }

    return {
        id: job.id,
        title: job.title,
        company: frontendCompany,
        location: job.location || 'Unknown',
        remote: job.is_remote ? 'Remote' : 'On-site',
        salaryMin: 0,
        salaryMax: 0,
        postedAt: job.created_at || new Date().toISOString().split('T')[0],
        roleType: job.functional_area || job.department || 'Other',
        experienceLevel: job.experience_level || 'Mid',
        skills: [],
        signals: signals,
        description: job.description || 'No description provided.',
        extractedDescription: job.details?.extracted_description || undefined,
        extractedRequirements: job.details?.extracted_requirements || undefined,
        extractedBenefits: job.details?.extracted_benefits || undefined,
    };
}

export function useJobs(search: string = "", filters: FilterState, page: number = 1) {
    return useQuery({
        queryKey: ['jobs', search, filters, page],
        queryFn: async (): Promise<{ data: Job[], meta: any }> => {
            const params = new URLSearchParams();
            params.append('page', page.toString());
            params.append('limit', '50');

            if (search) params.append('search', search);

            filters.roleType.forEach(rt => params.append('roleType', rt));
            filters.remote.forEach(rem => params.append('remote', rem));

            // Map fundingStage carefully
            const stagesToFetch = filters.fundingStage.flatMap(fs => FUNDING_STAGE_MAP[fs] || [fs]);
            stagesToFetch.forEach(fs => params.append('fundingStage', fs));

            if (filters.investorTier) params.append('investorTier', 'true');

            const response = await fetch(`${API_URL}/api/jobs?${params.toString()}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const result = await response.json();

            const mappedData = result.data.map(mapJob);

            return {
                data: mappedData,
                meta: result.meta
            };
        },
    });
}

export function useJob(jobId?: string) {
    return useQuery({
        queryKey: ['job', jobId],
        queryFn: async (): Promise<Job> => {
            if (!jobId) throw new Error('No job ID provided');
            const safeJobId = encodeURIComponent(jobId);
            const response = await fetch(`${API_URL}/api/jobs/${safeJobId}`);
            if (response.status === 404) throw new Error('Job not found — it may have been removed.');
            if (!response.ok) throw new Error(`Failed to fetch job (HTTP ${response.status})`);
            const result = await response.json();
            return mapJob(result);
        },
        enabled: !!jobId,
    });
}
