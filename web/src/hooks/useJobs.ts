import { useQuery } from '@tanstack/react-query';
import { Job, Company, Signal } from '../data/mockJobs';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export function useJobs() {
    return useQuery({
        queryKey: ['jobs'],
        queryFn: async (): Promise<Job[]> => {
            const response = await fetch(`${API_URL}/api/jobs`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();

            return data.map((job: any): Job => {
                // Map backend Company to frontend Company
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
                    skills: [], // We can parse skills later with AI
                    signals: signals,
                    description: job.description || 'No description provided.',
                };
            });
        }
    });
}
