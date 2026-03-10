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
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCcw, Search, BarChart3, Building2, Briefcase, Zap, AlertCircle, ExternalLink, X } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Header from '@/components/Header';

const renderTableBody = (query: any, colSpan: number, renderRow: (item: any) => React.ReactNode) => {
  if (query.isLoading) {
    return Array.from({ length: 5 }).map((_, i) => (
      <TableRow key={i} className="border-white/5">
        <TableCell colSpan={colSpan}><Skeleton className="h-10 w-full bg-white/5" /></TableCell>
      </TableRow>
    ));
  }
  if (query.isError) {
    return (
      <TableRow>
        <TableCell colSpan={colSpan} className="h-24 text-center text-red-400">
          <AlertCircle className="h-5 w-5 mx-auto mb-2 opacity-50" />
          Failed to load data. Please check your connection or try again later.
        </TableCell>
      </TableRow>
    );
  }
  if (!query.data?.data || query.data.total === 0) {
    return (
      <TableRow>
        <TableCell colSpan={colSpan} className="h-24 text-center text-muted-foreground italic">
          No records found.
        </TableCell>
      </TableRow>
    );
  }
  return query.data.data.map(renderRow);
};

const AdminPage = () => {
  const [companyPage, setCompanyPage] = useState(1);
  const [jobPage, setJobPage] = useState(1);
  
  // Input states (uncontrolled for performance, only sync on button click)
  const [companySearchInput, setCompanySearchInput] = useState('');
  const [jobSearchInput, setJobSearchInput] = useState('');
  
  // Query states (these trigger the API calls)
  const [companySearch, setCompanySearch] = useState('');
  const [jobSearch, setJobSearch] = useState('');
  
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  const statsQuery = useAdminStats();
  const companiesQuery = useAdminCompanies(companyPage, 20, companySearch, sortBy, sortOrder);
  const jobsQuery = useAdminJobs(jobPage, 50, jobSearch);
  
  const forceScrape = useForceScrape();
  const forceEnrich = useForceEnrich();

  const handleForceScrape = (id: string) => {
    forceScrape.mutate(id);
  };

  const handleForceEnrich = (id: string) => {
    forceEnrich.mutate(id);
  };

  const clearCompanySearch = () => {
    setCompanySearchInput('');
    setCompanySearch('');
    setCompanyPage(1);
  };

  const clearJobSearch = () => {
    setJobSearchInput('');
    setJobSearch('');
    setJobPage(1);
  };

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setCompanyPage(1); // Reset to first page on sort
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">Admin Control Center</h1>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => statsQuery.refetch()} className="border-white/10 bg-white/5 hover:bg-white/10">
                <RefreshCcw className={`h-4 w-4 mr-2 ${statsQuery.isFetching ? 'animate-spin' : ''}`} />
                Refresh Stats
              </Button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="glass-card border-white/5 bg-white/5 shadow-none">
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
            
            <Card className="glass-card border-white/5 bg-white/5 shadow-none">
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
            
            <Card className="glass-card border-white/5 bg-white/5 shadow-none">
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
            
            <Card className="glass-card border-white/5 bg-white/5 shadow-none">
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
              <Card className="border-white/5 bg-transparent shadow-none">
                <CardHeader className="px-0">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <CardTitle>Portfolio Companies</CardTitle>
                      <CardDescription>Monitor and trigger primary discovery scrapes for tracked companies.</CardDescription>
                    </div>
                    <div className="flex w-full md:w-80 h-9 items-center rounded-md border border-white/40 bg-white/5 focus-within:border-accent transition-all overflow-hidden">
                      <div className="flex items-center flex-1 px-3">
                        <input 
                          placeholder="Search companies..." 
                          className="w-full bg-transparent border-none text-sm focus:outline-none placeholder:text-muted-foreground"
                          value={companySearchInput}
                          onChange={(e) => setCompanySearchInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              setCompanySearch(companySearchInput);
                              setCompanyPage(1);
                            }
                          }}
                        />
                        {companySearchInput && (
                          <button 
                            onClick={clearCompanySearch}
                            className="p-1 hover:bg-white/10 rounded-full transition-colors ml-1"
                          >
                            <X className="h-3 w-3 text-muted-foreground" />
                          </button>
                        )}
                      </div>
                      <div className="h-full w-px bg-white/40" />
                      <button 
                        className="px-3 h-full hover:bg-white/10 transition-colors flex items-center justify-center shrink-0"
                        onClick={() => {
                          setCompanySearch(companySearchInput);
                          setCompanyPage(1);
                        }}
                      >
                        <Search className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent border-white/10">
                        <TableHead className="cursor-pointer hover:text-accent transition-colors" onClick={() => toggleSort('name')}>
                          Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </TableHead>
                        <TableHead className="cursor-pointer hover:text-accent transition-colors" onClick={() => toggleSort('rank')}>
                          Rank {sortBy === 'rank' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Jobs</TableHead>
                        <TableHead>Pending</TableHead>
                        <TableHead className="cursor-pointer hover:text-accent transition-colors" onClick={() => toggleSort('last_scraped')}>
                          Last Scraped {sortBy === 'last_scraped' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {renderTableBody(companiesQuery, 7, (company: AdminCompany) => (
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
                          </TableCell>
                          <TableCell>
                            <span className="text-xs font-mono bg-white/5 px-1.5 py-0.5 rounded text-muted-foreground">
                              {company.cb_rank || '--'}
                            </span>
                          </TableCell>
                          <TableCell>
                            {company.last_scraped_at ? (
                              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-2 py-0">Synced</Badge>
                            ) : (
                              <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 px-2 py-0">Pending</Badge>
                            )}
                          </TableCell>
                          <TableCell className="font-mono text-sm">{company.job_count}</TableCell>
                          <TableCell className="font-mono text-sm">
                            {company.pending_count > 0 ? (
                              <span className="text-yellow-500 font-bold">{company.pending_count}</span>
                            ) : (
                              <span className="text-muted-foreground opacity-50">0</span>
                            )}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {company.last_scraped_at ? new Date(company.last_scraped_at).toLocaleDateString() : 'Never'}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              size="sm" 
                              variant="secondary" 
                              className="h-8 bg-white/10 hover:bg-white/20 border-none"
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
                  
                  {/* Pagination */}
                  <div className="flex items-center justify-between py-4">
                    <span className="text-xs text-muted-foreground">Showing {(companyPage-1)*20 + 1} to {Math.min(companyPage*20, companiesQuery.data?.total || 0)} of {companiesQuery.data?.total || 0}</span>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCompanyPage(p => Math.max(1, p - 1))}
                        disabled={companyPage === 1}
                        className="hover:bg-white/5"
                      >
                        Previous
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCompanyPage(p => p + 1)}
                        disabled={!companiesQuery.data || companiesQuery.data.data.length < 20}
                        className="hover:bg-white/5"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="jobs" className="space-y-4">
              <Card className="border-white/5 bg-transparent shadow-none">
                <CardHeader className="px-0">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <CardTitle>Global Job Audit</CardTitle>
                      <CardDescription>Review listing status and trigger Phase 2 AI enrichment.</CardDescription>
                    </div>
                    <div className="flex w-full md:w-80 h-9 items-center rounded-md border border-white/40 bg-white/5 focus-within:border-accent transition-all overflow-hidden">
                      <div className="flex items-center flex-1 px-3">
                        <input 
                          placeholder="Search jobs..." 
                          className="w-full bg-transparent border-none text-sm focus:outline-none placeholder:text-muted-foreground"
                          value={jobSearchInput}
                          onChange={(e) => setJobSearchInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              setJobSearch(jobSearchInput);
                              setJobPage(1);
                            }
                          }}
                        />
                        {jobSearchInput && (
                          <button 
                            onClick={clearJobSearch}
                            className="p-1 hover:bg-white/10 rounded-full transition-colors ml-1"
                          >
                            <X className="h-3 w-3 text-muted-foreground" />
                          </button>
                        )}
                      </div>
                      <div className="h-full w-px bg-white/40" />
                      <button 
                        className="px-3 h-full hover:bg-white/10 transition-colors flex items-center justify-center shrink-0"
                        onClick={() => {
                          setJobSearch(jobSearchInput);
                          setJobPage(1);
                        }}
                      >
                        <Search className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-0">
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
                      {renderTableBody(jobsQuery, 6, (job: AdminJob) => (
                        <TableRow key={job.id} className="border-white/5 hover:bg-white/5 transition-colors">
                          <TableCell className="max-w-[200px] truncate font-medium">
                            {job.title}
                          </TableCell>
                          <TableCell className="text-sm opacity-80">{job.company_name}</TableCell>
                          <TableCell>
                            {job.needs_deep_scrape ? (
                              <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 px-2 py-0">Discovery</Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 border-blue-500/20 px-2 py-0">Enriched</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={job.status === 'active' ? 'default' : 'outline'} className={job.status === 'active' ? 'bg-emerald-500/80' : 'text-muted-foreground'}>
                              {job.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-[11px] text-muted-foreground">
                            {new Date(job.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 hover:bg-white/5 text-xs"
                              onClick={() => handleForceEnrich(job.id)}
                              disabled={!job.needs_deep_scrape || forceEnrich.isPending}
                            >
                              <Zap className="h-3.5 w-3.5 mr-2 text-yellow-500" />
                              AI Enrich
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  {/* Pagination */}
                  <div className="flex items-center justify-between py-4">
                    <span className="text-xs text-muted-foreground">Showing {(jobPage-1)*50 + 1} to {Math.min(jobPage*50, jobsQuery.data?.total || 0)} of {jobsQuery.data?.total || 0}</span>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setJobPage(p => Math.max(1, p - 1))}
                        disabled={jobPage === 1}
                        className="hover:bg-white/5"
                      >
                        Previous
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setJobPage(p => p + 1)}
                        disabled={!jobsQuery.data || jobsQuery.data.data.length < 50}
                        className="hover:bg-white/5"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      {/* Processing Indicator */}
      {(forceScrape.isPending || forceEnrich.isPending) && (
        <div className="fixed bottom-6 right-6 bg-accent/90 backdrop-blur-md text-accent-foreground px-5 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 border border-white/10">
          <RefreshCcw className="h-4 w-4 animate-spin" />
          <span className="text-sm font-semibold tracking-wide uppercase">Task Queued</span>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
