import { SidebarLayout } from "@/components/layout/SidebarLayout"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TooltipProvider } from "@/components/ui/tooltip"

function App() {
  return (
    <TooltipProvider>
      <SidebarLayout>
        <div className="max-w-5xl mx-auto space-y-8">
          <header>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2 underline decoration-blue-600 underline-offset-8">Discovery</h1>
            <p className="text-slate-400">Explore the latest opportunities at top VC-backed startups.</p>
          </header>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              { name: "OpenAI", industry: "Artificial Intelligence", funding: "$13B+" },
              { name: "Stripe", industry: "Fintech", funding: "$9B+" },
              { name: "Anthropic", industry: "AI Safety", funding: "$7B+" }
            ].map((company) => (
              <Card key={company.name} className="bg-slate-900/40 border-slate-800/50 hover:border-blue-500/50 transition-colors group cursor-pointer">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border-none">
                      {company.industry}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl text-white group-hover:text-blue-400 transition-colors">
                    {company.name}
                  </CardTitle>
                  <CardDescription className="text-slate-500">
                    High growth potential • {company.funding} Total Funding
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-400 line-clamp-2">
                    Working on state-of-the-art technologies to shape the future of tech.
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </SidebarLayout>
    </TooltipProvider>
  )
}

export default App
