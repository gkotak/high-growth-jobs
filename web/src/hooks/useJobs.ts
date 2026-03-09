import { useInfiniteQuery } from '@tanstack/react-query';
import { Job, Company, Signal } from '../data/mockJobs';
import { FilterState } from '../widgets/landing/types';

const API_URL = import.meta.env.VITE_API_URL || '';

const FUNDING_STAGE_MAP: Record<string, string[]> = {
    "Seed": ["Seed"],
    "Series A": ["Series A"],
    "Series B": ["Series B"],
    "Series C": ["Series C"],
    "Series D": ["Series D"],
    "Series E+": ["Series E", "Series F", "Series G", "Series H", "Series I"],
};

export function useJobs(search: string = "", filters: FilterState) {
    return useInfiniteQuery({
        queryKey: ['jobs', search, filters],
        queryFn: async ({ pageParam = 1 }): Promise<{ data: Job[], meta: any }> => {
            const params = new URLSearchParams();
            params.append('page', pageParam.toString());
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

            const mappedData = result.data.map((job: any): Job => {
                const comp = job.company;
                const totalFundingNum = comp.total_funding_amount
                    ? parseInt(comp.total_funding_amount.replace(/[^0-9]/g, ''), 10)
                    : 0;

                const frontendCompany: Company = {
                    id: comp.id,
                    name: comp.name,
                    logo: comp.logo_url || `https://logo.clearbit.com/${comp.website_url.replace(/^https?:\/\//, '').split('/')[0]}`,
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
                };
            });

            return {
                data: mappedData,
                meta: result.meta
            };
        },
        getNextPageParam: (lastPage) => {
            if (lastPage.meta.has_next) {
                return lastPage.meta.page + 1;
            }
            return undefined;
        },
        initialPageParam: 1,
    });
}
