import React, { useState } from 'react';
import { 
  useAdminStats, 
  useAdminCompanies, 
  useAdminJobs, 
  useForceScrape, 
  useForceEnrich,
  AdminCompany,
  AdminJob
} from '@/hooks/useAdmin';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCcw, Search, BarChart3, Building2, Briefcase, Zap, AlertCircle, ExternalLink } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Header from '@/components/Header';

const AdminPage = () => {
  const [companyPage, setCompanyPage] = useState(1);
  const [jobPage, setJobPage] = useState(1);
  
  const statsQuery = useAdminStats();
  const companiesQuery = useAdminCompanies(companyPage);
  const jobsQuery = useAdminJobs(jobPage);
  
  const forceScrape = useForceScrape();
  const forceEnrich = useForceEnrich();

  const handleForceScrape = (id: string) => {
    forceScrape.mutate(id);
  };

  const handleForceEnrich = (id: string) => {
    forceEnrich.mutate(id);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">Admin Control Center</h1>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => statsQuery.refetch()}>
                <RefreshCcw className={`h-4 w-4 mr-2 ${statsQuery.isFetching ? 'animate-spin' : ''}`} />
                Refresh Stats
              </Button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="glass-card border-white/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {statsQuery.isLoading ? <Skeleton className="h-8 w-16" /> : (
                  <div className="text-2xl font-bold">{statsQuery.data?.company_count}</div>
                )}
                <p className="text-xs text-muted-foreground">Managed by HighGrowthJobs</p>
              </CardContent>
            </Card>
            
            <Card className="glass-card border-white/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
                <Briefcase className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                {statsQuery.isLoading ? <Skeleton className="h-8 w-16" /> : (
                  <div className="text-2xl font-bold">{statsQuery.data?.active_jobs}</div>
                )}
                <p className="text-xs text-muted-foreground">Currently published positions</p>
              </CardContent>
            </Card>
            
            <Card className="glass-card border-white/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Enrichment</CardTitle>
                <Zap className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                {statsQuery.isLoading ? <Skeleton className="h-8 w-16" /> : (
                  <div className="text-2xl font-bold">{statsQuery.data?.pending_enrichment}</div>
                )}
                <p className="text-xs text-muted-foreground">Jobs awaiting AI Deep Scrape</p>
              </CardContent>
            </Card>
            
            <Card className="glass-card border-white/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Data Points</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {statsQuery.isLoading ? <Skeleton className="h-8 w-16" /> : (
                  <div className="text-2xl font-bold">{statsQuery.data?.job_count}</div>
                )}
                <p className="text-xs text-muted-foreground">Historical jobs in system</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="companies" className="space-y-4">
            <TabsList className="bg-white/5 border border-white/10">
              <TabsTrigger value="companies">Company Management</TabsTrigger>
              <TabsTrigger value="jobs">Job Management</TabsTrigger>
            </TabsList>

            <TabsContent value="companies" className="space-y-4">
              <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Portfolio Companies</CardTitle>
                  <CardDescription>
                    Monitor and trigger primary discovery scrapes for tracked companies.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent border-white/10">
                        <TableHead>Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Jobs</TableHead>
                        <TableHead>Pending</TableHead>
                        <TableHead>Last Scraped</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {companiesQuery.isLoading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                          <TableRow key={i}>
                            <TableCell colSpan={6}><Skeleton className="h-10 w-full" /></TableCell>
                          </TableRow>
                        ))
                      ) : companiesQuery.data?.data.map((company: AdminCompany) => (
                        <TableRow key={company.id} className="border-white/5 hover:bg-white/5 transition-colors">
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {company.name}
                              {company.website_url && (
                                <a href={company.website_url} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-accent">
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              )}
                            </div>
                            <span className="text-[10px] text-muted-foreground bg-white/5 px-1 rounded">Rank: {company.cb_rank || 'N/A'}</span>
                          </TableCell>
                          <TableCell>
                            {company.last_scraped_at ? (
                              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Synced</Badge>
                            ) : (
                              <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Pending</Badge>
                            )}
                          </TableCell>
                          <TableCell>{company.job_count}</TableCell>
                          <TableCell>
                            {company.pending_count > 0 ? (
                              <span className="text-yellow-500 font-semibold">{company.pending_count}</span>
                            ) : (
                              <span className="text-muted-foreground">0</span>
                            )}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {company.last_scraped_at ? new Date(company.last_scraped_at).toLocaleString() : 'Never'}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              size="sm" 
                              variant="secondary" 
                              className="h-8"
                              onClick={() => handleForceScrape(company.id)}
                              disabled={forceScrape.isPending}
                            >
                              <Zap className="h-3.5 w-3.5 mr-2" />
                              Force Scrape
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  {/* Simple Pagination */}
                  <div className="flex items-center justify-end space-x-2 py-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCompanyPage(p => Math.max(1, p - 1))}
                      disabled={companyPage === 1}
                    >
                      Previous
                    </Button>
                    <div className="text-sm font-medium">Page {companyPage}</div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCompanyPage(p => p + 1)}
                      disabled={!companiesQuery.data || companiesQuery.data.data.length < 20}
                    >
                      Next
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="jobs" className="space-y-4">
              <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Global Job Audit</CardTitle>
                  <CardDescription>
                    Review specific job listings and manually trigger Phase 2 expansion.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent border-white/10">
                        <TableHead>Title</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>AI Status</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {jobsQuery.isLoading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                          <TableRow key={i}>
                            <TableCell colSpan={6}><Skeleton className="h-10 w-full" /></TableCell>
                          </TableRow>
                        ))
                      ) : jobsQuery.data?.data.map((job: AdminJob) => (
                        <TableRow key={job.id} className="border-white/5 hover:bg-white/5 transition-colors">
                          <TableCell className="max-w-[200px] truncate font-medium">
                            {job.title}
                          </TableCell>
                          <TableCell>{job.company_name}</TableCell>
                          <TableCell>
                            {job.needs_deep_scrape ? (
                              <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Discovery</Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 border-blue-500/20">Enriched</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={job.status === 'active' ? 'default' : 'outline'} className={job.status === 'active' ? 'bg-emerald-500' : 'text-muted-foreground'}>
                              {job.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-[11px] text-muted-foreground">
                            {new Date(job.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-8 border-white/10 hover:bg-white/5"
                              onClick={() => handleForceEnrich(job.id)}
                              disabled={!job.needs_deep_scrape || forceEnrich.isPending}
                            >
                              <Zap className="h-3.5 w-3.5 mr-2 text-blue-500" />
                              AI Enrich
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  {/* Simple Pagination */}
                  <div className="flex items-center justify-end space-x-2 py-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setJobPage(p => Math.max(1, p - 1))}
                      disabled={jobPage === 1}
                    >
                      Previous
                    </Button>
                    <div className="text-sm font-medium">Page {jobPage}</div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setJobPage(p => p + 1)}
                      disabled={!jobsQuery.data || jobsQuery.data.data.length < 50}
                    >
                      Next
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      {/* Task Queue Feedback Overlay */}
      {(forceScrape.isPending || forceEnrich.isPending) && (
        <div className="fixed bottom-4 right-4 bg-accent text-accent-foreground px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-in slide-in-from-bottom-4">
          <RefreshCcw className="h-5 w-5 animate-spin" />
          <div className="flex flex-col">
            <span className="text-sm font-bold">Background Task Running</span>
            <span className="text-[10px] opacity-80">Managing concurrency...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
