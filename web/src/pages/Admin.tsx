import React, { useState } from 'react';
import { 
  useAdminStats, 
  useAdminCompanies, 
  useAdminCompaniesSearch,
  useAdminJobs, 
  useForceScrape, 
  useForceEnrich,
  useExecutionLogs,
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
import { RefreshCcw, Search, BarChart3, Building2, Briefcase, Zap, AlertCircle, ExternalLink, X, TerminalSquare, Plus } from 'lucide-react';
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
  // DB Logs
  const [showConsole, setShowConsole] = useState(false);
  const [activeTabs, setActiveTabs] = useState<Array<{name: string, id: string}>>([{ name: 'All', id: '' }]);
  const [activeTabName, setActiveTabName] = useState<string>('All');
  const [isAddingTab, setIsAddingTab] = useState(false);
  const [tabSearch, setTabSearch] = useState('');
  
  const activeTabId = activeTabs.find(t => t.name === activeTabName)?.id || '';
  const logsQuery = useExecutionLogs(activeTabId);
  const searchResults = useAdminCompaniesSearch(tabSearch);

  // Input states (uncontrolled for performance, only sync on button click)
  const [companySearchInput, setCompanySearchInput] = useState('');
  const [jobSearchInput, setJobSearchInput] = useState('');
  
  // Query states (these trigger the API calls)
  const [companySearch, setCompanySearch] = useState('');
  const [jobSearch, setJobSearch] = useState('');
  
  const [sortBy, setSortBy] = useState('rank');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  const statsQuery = useAdminStats();
  const companiesQuery = useAdminCompanies(companyPage, 20, companySearch, sortBy, sortOrder);
  const jobsQuery = useAdminJobs(jobPage, 50, jobSearch);
  
  const forceScrape = useForceScrape();
  const forceEnrich = useForceEnrich();

  const handleForceScrape = (id: string, name: string) => {
    if (!activeTabs.some(t => t.name === name)) setActiveTabs(prev => [...prev, { name, id }]);
    setActiveTabName(name);
    setShowConsole(true);
    forceScrape.mutate(id);
  };

  const handleForceEnrich = (id: string, company_id: string, company_name: string) => {
    if (!activeTabs.some(t => t.name === company_name)) setActiveTabs(prev => [...prev, { name: company_name, id: company_id }]);
    setActiveTabName(company_name);
    setShowConsole(true);
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
      
      <main className={`container mx-auto px-4 py-8 transition-all duration-300 ${showConsole ? 'pr-96' : ''}`}>
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">Admin Control Center</h1>
            <div className="flex gap-2">
              <Button 
                onClick={() => setShowConsole(!showConsole)} 
                variant="outline" 
                size="sm"
                className={`border-white/10 ${showConsole ? 'bg-white/10 hover:bg-white/20' : 'bg-white/5 hover:bg-white/10'}`}
              >
                <TerminalSquare className="h-4 w-4 mr-2" />
                Logs
              </Button>
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
                    <div className="flex w-full md:w-80 h-9 items-center rounded-md border border-zinc-800 bg-white/5 focus-within:border-accent transition-all overflow-hidden">
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
                      <div className="h-full w-px bg-zinc-800" />
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
                        <TableHead className="cursor-pointer hover:text-accent transition-colors" onClick={() => toggleSort('last_scraped')}>
                          Last Scraped {sortBy === 'last_scraped' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </TableHead>
                        <TableHead>Jobs</TableHead>
                        <TableHead>Pending</TableHead>
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
                          <TableCell className="text-[11px] text-muted-foreground whitespace-nowrap">
                            {company.last_scraped_at ? (
                              <div className="flex flex-col">
                                <span>{new Date(company.last_scraped_at).toLocaleDateString()}</span>
                                <span className="text-[10px] opacity-60 font-mono italic">{new Date(company.last_scraped_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                            ) : (
                              <span className="opacity-40">Never</span>
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
                          <TableCell className="text-right">
                            <Button 
                              size="sm" 
                              variant="secondary" 
                              className="h-8 bg-white/10 hover:bg-white/20 border-none transition-all group"
                              onClick={() => handleForceScrape(company.id, company.name)}
                              disabled={forceScrape.isPending}
                            >
                              <Zap className="h-3.5 w-3.5 mr-2 group-hover:text-yellow-500 transition-colors" />
                              Retrieve new jobs
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
                    <div className="flex w-full md:w-80 h-9 items-center rounded-md border border-zinc-800 bg-white/5 focus-within:border-accent transition-all overflow-hidden">
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
                      <div className="h-full w-px bg-zinc-800" />
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
                              onClick={() => handleForceEnrich(job.id, job.company_id, job.company_name)}
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
        
        {/* Activity Console Slide-over */}
        <div 
          className={`fixed right-0 top-[73px] bottom-0 w-96 bg-zinc-950 border-l border-white/10 transform transition-transform duration-300 z-40 flex flex-col ${showConsole ? 'translate-x-0' : 'translate-x-full'}`}
        >
          <div className="h-14 border-b border-white/10 flex items-center justify-between px-4 bg-zinc-900/50 shrink-0">
            <div className="flex items-center gap-2">
              <TerminalSquare className="h-4 w-4 text-emerald-500" />
              <h3 className="text-sm font-semibold tracking-wide uppercase text-zinc-300">Execution History</h3>
            </div>
            <button onClick={() => setShowConsole(false)} className="p-1 hover:bg-white/10 rounded-md transition-colors text-muted-foreground hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <div className="p-2 border-b border-white/5 bg-zinc-900/30 flex flex-col gap-2 shrink-0">
            <div className="flex flex-wrap gap-2 items-center justify-between">
              <div className="flex flex-wrap gap-2 items-center relative">
                {activeTabs.map(tab => (
                  <button
                    key={tab.name}
                    onClick={() => setActiveTabName(tab.name)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
                      activeTabName === tab.name 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                        : 'bg-black/30 text-zinc-400 border border-white/5 hover:bg-white/5'
                    }`}
                  >
                    {tab.name}
                    {tab.name !== 'All' && (
                      <div 
                        className="p-0.5 hover:bg-white/20 rounded-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveTabs(prev => prev.filter(t => t.name !== tab.name));
                          if (activeTabName === tab.name) setActiveTabName('All');
                        }}
                      >
                        <X className="h-3 w-3" />
                      </div>
                    )}
                  </button>
                ))}
                
                <div className="flex items-center gap-1.5 ml-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={`h-7 w-7 p-0 transition-all ${isAddingTab ? 'bg-white/10 text-white border border-white/20' : 'bg-white/5 text-zinc-400 border border-white/5 hover:bg-white/10'}`}
                    onClick={() => {
                      setIsAddingTab(!isAddingTab);
                      if (isAddingTab) setTabSearch('');
                    }}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                  
                  {isAddingTab && (
                    <div className="relative">
                       <Input 
                        placeholder="company name" 
                        autoFocus
                        className="h-7 w-32 bg-black/40 border-white/10 text-[10px] text-zinc-300 focus:bg-black/60 focus:border-emerald-500/50 transition-all px-2 placeholder:text-zinc-600"
                        value={tabSearch}
                        onChange={(e) => setTabSearch(e.target.value)}
                       />
                       
                       {tabSearch.length >= 2 && (
                        <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-zinc-200 rounded-xl shadow-2xl z-50 ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-100 overflow-hidden h-auto">
                           <div className="max-h-72 overflow-y-auto flex flex-col p-2">
                              {searchResults.isLoading ? (
                                <div className="px-4 py-8 text-center text-xs text-zinc-400 italic">Searching...</div>
                              ) : searchResults.data?.data && searchResults.data.data.length > 0 ? (
                                searchResults.data.data.map((c, i) => (
                                  <React.Fragment key={c.id}>
                                    <button
                                      className="text-left px-4 py-3 rounded-lg hover:bg-zinc-50 text-xs text-zinc-700 hover:text-zinc-900 transition-colors truncate font-semibold"
                                      onClick={() => {
                                        if (!activeTabs.some(t => t.id === c.id)) {
                                          setActiveTabs(prev => [...prev, { name: c.name, id: c.id }]);
                                        }
                                        setActiveTabName(c.name);
                                        setIsAddingTab(false);
                                        setTabSearch('');
                                      }}
                                    >
                                      {c.name}
                                    </button>
                                    {i < (searchResults.data?.data.length || 0) - 1 && (
                                      <div className="h-[0.5px] bg-zinc-100/60 mx-2" />
                                    )}
                                  </React.Fragment>
                                ))
                              ) : (
                                <div className="px-4 py-8 text-center text-xs text-zinc-500 italic">No matches discovered</div>
                              )}
                           </div>
                        </div>
                       )}
                    </div>
                  )}
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 px-2 text-zinc-400 hover:text-white"
                onClick={() => {
                  logsQuery.refetch();
                }}
                disabled={logsQuery.isFetching}
              >
                <RefreshCcw className={`h-3 w-3 mr-1 ${logsQuery.isFetching ? 'animate-spin' : ''}`} />
                Ref
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 font-mono text-[11px] leading-relaxed scroll-smooth flex flex-col justify-start min-h-0 bg-black/40">
            <div className="flex flex-col gap-1.5 mt-0">
              {logsQuery.isLoading ? (
                <div className="text-zinc-600 italic">Loading logs...</div>
              ) : logsQuery.isError ? (
                <div className="text-red-400">Failed to load logs.</div>
              ) : !logsQuery.data || logsQuery.data.length === 0 ? (
                <div className="text-zinc-600 italic">No execution history found in the past 30 days.</div>
              ) : (
                logsQuery.data.map((log) => (
                  <div key={log.id} className="mb-2 border-l-2 pl-2 flex flex-col gap-1
                    border-zinc-700
                  ">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs">
                        <span className={`px-1 rounded font-bold ${log.source === 'manual' ? 'text-blue-400' : 'text-purple-400'} bg-white/5`}>
                          [{log.source.toUpperCase()}]
                        </span>
                        <span className="text-zinc-300 font-semibold uppercase tracking-wider">{log.action}</span>
                        <Badge variant="outline" className={`h-4 text-[10px] uppercase font-bold px-1 py-0
                          ${log.status === 'success' ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' : 
                            log.status === 'failed' ? 'text-red-400 border-red-500/30 bg-red-500/10' : 
                            'text-yellow-400 border-yellow-500/30 bg-yellow-500/10'}`}>
                          {log.status}
                        </Badge>
                        {log.payload?.company_name && (
                          <span className="text-zinc-500 text-[10px] font-medium truncate max-w-[100px]">
                            {log.payload.company_name}
                          </span>
                        )}
                      </div>
                      <span className="text-zinc-500 text-[10px]">{new Date(log.created_at).toLocaleString()}</span>
                    </div>
                    {Object.keys(log.payload || {}).filter(k => k !== 'company_name' && k !== 'job_title').length > 0 && (
                      <div className="text-zinc-400 text-[10px] mt-1 bg-black/30 border border-white/5 p-2 rounded whitespace-pre-wrap font-mono relative">
                        {JSON.stringify(
                          Object.fromEntries(
                            Object.entries(log.payload).filter(([k]) => k !== 'company_name' && k !== 'job_title')
                          ), 
                          null, 2
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminPage;
