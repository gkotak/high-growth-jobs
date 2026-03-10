export type Job = {
  id: string;
  title: string;
  company: Company;
  location: string;
  remote: "Remote" | "Hybrid" | "On-site";
  salaryMin?: number;
  salaryMax?: number;
  salaryRange?: string;
  postedAt: string;
  roleType: string;
  experienceLevel: string;
  skills: string[];
  signals: Signal[];
  description: string;
  extractedDescription?: string;
  extractedRequirements?: string;
  extractedBenefits?: string;
};

export type Signal = {
  type: "tier1_vc" | "series" | "remote" | "funding";
  label: string;
};

export type Company = {
  id: string;
  name: string;
  logo: string;
  description: string;
  totalFunding: number;
  lastFundingAmount?: string;
  fundingStage: string;
  investors: string[];
  employeeCount: string;
  founded: string | number;
  careerUrl: string;
  linkedinUrl: string;
  twitterUrl?: string;
  websiteUrl: string;
  glassdoorRating: number;
  industry: string;
};

const companies: Company[] = [
  {
    id: "c1", name: "Ramp", logo: "https://logo.clearbit.com/ramp.com",
    description: "Ramp is the ultimate platform for modern finance teams. It combines corporate cards, expense management, bill payments, and accounting automation into one seamless system.",
    totalFunding: 1600000000, fundingStage: "Series D", investors: ["Founders Fund", "Sequoia Capital", "Thrive Capital", "D1 Capital"],
    employeeCount: "800-1000", founded: 2019, careerUrl: "https://ramp.com/careers", linkedinUrl: "https://linkedin.com/company/ramp", websiteUrl: "https://ramp.com", glassdoorRating: 4.4, industry: "Fintech",
    lastFundingAmount: "$150M", twitterUrl: "https://twitter.com/tryramp"
  },
  {
    id: "c2", name: "Vercel", logo: "https://logo.clearbit.com/vercel.com",
    description: "Vercel is the platform for frontend developers, providing the speed and reliability innovators need to create at the moment of inspiration.",
    totalFunding: 563000000, fundingStage: "Series E", investors: ["Accel", "GV", "Bedrock Capital", "Tiger Global"],
    employeeCount: "400-600", founded: 2015, careerUrl: "https://vercel.com/careers", linkedinUrl: "https://linkedin.com/company/vercel", websiteUrl: "https://vercel.com", glassdoorRating: 4.1, industry: "Developer Tools",
    lastFundingAmount: "$250M"
  },
  {
    id: "c3", name: "Linear", logo: "https://logo.clearbit.com/linear.app",
    description: "Linear is the issue tracking tool built for modern software teams. Streamline issues, sprints, and product roadmaps.",
    totalFunding: 52000000, fundingStage: "Series B", investors: ["Sequoia Capital", "01 Advisors", "SV Angel"],
    employeeCount: "50-100", founded: 2019, careerUrl: "https://linear.app/careers", linkedinUrl: "https://linkedin.com/company/linear-app", websiteUrl: "https://linear.app", glassdoorRating: 4.6, industry: "Developer Tools",
    lastFundingAmount: "$35M"
  },
  {
    id: "c4", name: "Notion", logo: "https://logo.clearbit.com/notion.so",
    description: "Notion is the connected workspace where better, faster work happens. It blends everyday work apps into one — notes, docs, wikis, and project management.",
    totalFunding: 343000000, fundingStage: "Series C", investors: ["Sequoia Capital", "Index Ventures", "Coatue Management"],
    employeeCount: "500-800", founded: 2013, careerUrl: "https://notion.so/careers", linkedinUrl: "https://linkedin.com/company/notionhq", websiteUrl: "https://notion.so", glassdoorRating: 4.3, industry: "Productivity",
    lastFundingAmount: "$275M"
  },
  {
    id: "c5", name: "Anthropic", logo: "https://logo.clearbit.com/anthropic.com",
    description: "Anthropic is an AI safety company building reliable, interpretable, and steerable AI systems. Creator of Claude.",
    totalFunding: 7300000000, fundingStage: "Series D", investors: ["Google", "Spark Capital", "Salesforce Ventures", "Menlo Ventures"],
    employeeCount: "500-900", founded: 2021, careerUrl: "https://anthropic.com/careers", linkedinUrl: "https://linkedin.com/company/anthropic-ai", twitterUrl: "https://twitter.com/AnthropicAI", websiteUrl: "https://anthropic.com", glassdoorRating: 4.5, industry: "AI/ML",
    lastFundingAmount: "$450M"
  },
  {
    id: "c6", name: "Cursor", logo: "https://logo.clearbit.com/cursor.com",
    description: "Cursor is the AI-first code editor. Build software faster with an editor designed around AI from the ground up.",
    totalFunding: 400000000, fundingStage: "Series B", investors: ["a16z", "Thrive Capital", "Benchmark"],
    employeeCount: "50-100", founded: 2022, careerUrl: "https://cursor.com/careers", linkedinUrl: "https://linkedin.com/company/cursor-ai", websiteUrl: "https://cursor.com", glassdoorRating: 4.7, industry: "Developer Tools",
    lastFundingAmount: "$60M"
  },
  {
    id: "c7", name: "Stripe", logo: "https://logo.clearbit.com/stripe.com",
    description: "Stripe is a financial infrastructure platform for businesses. Millions of companies use Stripe to accept payments, grow revenue, and accelerate new business.",
    totalFunding: 8700000000, fundingStage: "Series I", investors: ["Sequoia Capital", "a16z", "General Catalyst", "Thrive Capital"],
    employeeCount: "7000+", founded: 2010, careerUrl: "https://stripe.com/jobs", linkedinUrl: "https://linkedin.com/company/stripe", websiteUrl: "https://stripe.com", glassdoorRating: 4.2, industry: "Fintech",
    lastFundingAmount: "$6.5B"
  },
  {
    id: "c8", name: "Figma", logo: "https://logo.clearbit.com/figma.com",
    description: "Figma is a collaborative interface design tool that connects everyone in the design process so teams can deliver better products, faster.",
    totalFunding: 332000000, fundingStage: "Series E", investors: ["a16z", "Greylock", "Kleiner Perkins", "Index Ventures"],
    employeeCount: "1000-1500", founded: 2012, careerUrl: "https://figma.com/careers", linkedinUrl: "https://linkedin.com/company/figma", websiteUrl: "https://figma.com", glassdoorRating: 4.5, industry: "Design",
    lastFundingAmount: "$200M"
  },
];

function formatFunding(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
  return `$${n}`;
}

export { formatFunding };

export const VC_RANKS: Record<string, number> = {
  "Sequoia Capital": 1,
  "a16z": 2,
  "Benchmark": 3,
  "Founders Fund": 4,
  "Thrive Capital": 5,
  "Index Ventures": 6,
  "Accel": 7,
  "General Catalyst": 8,
  "Kleiner Perkins": 9,
  "Tiger Global": 10,
  "Goldman Sachs": 11,
  "SoftBank": 12,
  "Google": 13,
  "Y Combinator": 14,
  "Spark Capital": 15,
  "Coatue Management": 16,
  "Greylock": 17,
  "Social Capital": 18,
  "Lightspeed Venture Partners": 19,
  "Menlo Ventures": 20,
};

// Fallback rank for investors not in our top-tier ranking list
// This ensures unknown investors always appear at the end of the list
const UNKNOWN_RANK = 999999;

export const sortInvestors = (investors: string[]) => {
  return [...(investors || [])].sort((a, b) => {
    const rankA = VC_RANKS[a] || UNKNOWN_RANK;
    const rankB = VC_RANKS[b] || UNKNOWN_RANK;
    return rankA - rankB;
  });
};

export const formatFounded = (founded?: string | number) => {
  // Handle empty, zero, or "0" cases as requested by the USER
  if (!founded || founded === 0 || founded === "0") return "Unknown";
  return String(founded);
};

export const mockJobs: Job[] = [
  { id: "j1", title: "Senior Frontend Engineer", company: companies[0], location: "New York, NY", remote: "Hybrid", salaryMin: 180000, salaryMax: 240000, postedAt: "2026-03-04", roleType: "Engineering", experienceLevel: "Senior", skills: ["React", "TypeScript", "GraphQL"], signals: [{ type: "tier1_vc", label: "Tier 1 VC" }, { type: "series", label: "Series D" }], description: "We're looking for a Senior Frontend Engineer to join Ramp's core product team. You'll work on building beautiful, performant interfaces that help finance teams manage spend more effectively.\n\n**What you'll do**\n- Build and maintain complex React applications with TypeScript\n- Collaborate closely with product and design teams to ship delightful user experiences\n- Architect scalable frontend systems and establish best practices\n- Mentor junior engineers and contribute to engineering culture\n\n**What we're looking for**\n- 5+ years of experience building production web applications\n- Deep expertise in React, TypeScript, and modern frontend tooling\n- Experience with GraphQL and state management patterns\n- Strong product sense and attention to detail\n- Track record of shipping high-quality features end-to-end" },
  { id: "j2", title: "Staff Backend Engineer", company: companies[1], location: "San Francisco, CA", remote: "Remote", salaryMin: 200000, salaryMax: 280000, postedAt: "2026-03-03", roleType: "Engineering", experienceLevel: "Lead", skills: ["Go", "Kubernetes", "AWS"], signals: [{ type: "tier1_vc", label: "Tier 1 VC" }, { type: "remote", label: "Remote" }], description: "Vercel is seeking a Staff Backend Engineer to help scale our infrastructure to support millions of deployments daily.\n\n**What you'll do**\n- Design and implement highly available distributed systems\n- Lead technical architecture decisions for core platform services\n- Optimize performance and reliability of our build and deployment pipeline\n- Drive engineering excellence through code reviews and technical mentorship\n\n**What we're looking for**\n- 8+ years of backend engineering experience\n- Expert-level Go or similar systems language\n- Deep experience with Kubernetes, container orchestration, and cloud infrastructure\n- Proven track record of designing systems at scale" },
  { id: "j3", title: "Product Manager, Core Platform", company: companies[2], location: "San Francisco, CA", remote: "Remote", salaryMin: 160000, salaryMax: 220000, postedAt: "2026-03-05", roleType: "Product", experienceLevel: "Senior", skills: ["Product Strategy", "B2B SaaS", "Analytics"], signals: [{ type: "tier1_vc", label: "Sequoia" }, { type: "series", label: "Series B" }, { type: "remote", label: "Remote" }], description: "Linear is hiring a Product Manager to own and drive the core platform experience used by thousands of engineering teams.\n\n**What you'll do**\n- Define product strategy and roadmap for core platform features\n- Work closely with engineering and design to ship impactful improvements\n- Analyze user behavior and feedback to prioritize features\n- Communicate product vision across the organization\n\n**What we're looking for**\n- 4+ years of product management experience in B2B SaaS\n- Strong analytical skills and data-driven decision making\n- Excellent communication and stakeholder management\n- Passion for developer tools and productivity software" },
  { id: "j4", title: "Senior Product Designer", company: companies[3], location: "New York, NY", remote: "Hybrid", salaryMin: 170000, salaryMax: 230000, postedAt: "2026-03-02", roleType: "Design", experienceLevel: "Senior", skills: ["Figma", "Design Systems", "User Research"], signals: [{ type: "tier1_vc", label: "Tier 1 VC" }, { type: "series", label: "Series C" }], description: "Notion is looking for a Senior Product Designer to help shape the future of how teams organize their work and knowledge.\n\n**What you'll do**\n- Design end-to-end experiences for Notion's core product\n- Contribute to and evolve our design system\n- Conduct user research and usability testing\n- Partner with PMs and engineers to ship polished features\n\n**What we're looking for**\n- 5+ years of product design experience\n- Strong portfolio demonstrating systems thinking and craft\n- Experience with design systems and component libraries\n- Ability to balance user needs with business goals" },
  { id: "j5", title: "ML Research Engineer", company: companies[4], location: "San Francisco, CA", remote: "On-site", salaryMin: 300000, salaryMax: 450000, postedAt: "2026-03-06", roleType: "Engineering", experienceLevel: "Senior", skills: ["Python", "PyTorch", "Transformers"], signals: [{ type: "funding", label: "$7.3B Raised" }, { type: "tier1_vc", label: "Tier 1 VC" }], description: "Anthropic is looking for ML Research Engineers to push the boundaries of AI safety and capabilities.\n\n**What you'll do**\n- Develop and train large language models\n- Design and run experiments to improve model alignment and safety\n- Implement novel research ideas from conception to production\n- Collaborate with researchers to bridge theory and practice\n\n**What we're looking for**\n- MS/PhD in Machine Learning, Computer Science, or related field\n- Strong experience with PyTorch and transformer architectures\n- Publications in top ML venues (NeurIPS, ICML, ICLR) preferred\n- Deep understanding of modern LLM training techniques" },
  { id: "j6", title: "Full Stack Engineer", company: companies[5], location: "San Francisco, CA", remote: "On-site", salaryMin: 190000, salaryMax: 260000, postedAt: "2026-03-05", roleType: "Engineering", experienceLevel: "Mid", skills: ["TypeScript", "Rust", "AI/ML"], signals: [{ type: "tier1_vc", label: "a16z" }, { type: "series", label: "Series B" }], description: "Cursor is hiring Full Stack Engineers to build the next generation of AI-powered development tools.\n\n**What you'll do**\n- Build features across the full stack of our AI code editor\n- Integrate cutting-edge AI models into the editing experience\n- Optimize performance for real-time code completion and generation\n- Ship features that delight developers worldwide\n\n**What we're looking for**\n- 3+ years of full stack engineering experience\n- Proficiency in TypeScript and systems-level thinking\n- Interest in AI/ML and developer tooling\n- Bias for action and shipping quickly" },
  { id: "j7", title: "Senior Account Executive", company: companies[6], location: "Chicago, IL", remote: "Hybrid", salaryMin: 140000, salaryMax: 200000, postedAt: "2026-03-01", roleType: "Sales", experienceLevel: "Senior", skills: ["Enterprise Sales", "SaaS", "Payments"], signals: [{ type: "tier1_vc", label: "Tier 1 VC" }, { type: "funding", label: "$8.7B Raised" }], description: "Stripe is looking for a Senior Account Executive to drive enterprise adoption of our payments platform.\n\n**What you'll do**\n- Manage complex enterprise sales cycles from prospecting to close\n- Build relationships with C-level executives at target accounts\n- Collaborate with solutions engineers to deliver tailored demos\n- Exceed quarterly and annual revenue targets\n\n**What we're looking for**\n- 5+ years of enterprise SaaS sales experience\n- Proven track record of exceeding quota\n- Experience selling technical products to engineering and finance leaders\n- Strong consultative selling and negotiation skills" },
  { id: "j8", title: "Design Engineer", company: companies[7], location: "New York, NY", remote: "Remote", salaryMin: 175000, salaryMax: 245000, postedAt: "2026-03-04", roleType: "Engineering", experienceLevel: "Mid", skills: ["React", "CSS", "Motion Design"], signals: [{ type: "tier1_vc", label: "a16z" }, { type: "remote", label: "Remote" }], description: "Figma is hiring a Design Engineer to bridge the gap between design and engineering.\n\n**What you'll do**\n- Build polished, interactive UI components and prototypes\n- Work at the intersection of design and frontend engineering\n- Create delightful animations and micro-interactions\n- Contribute to Figma's design system and component library\n\n**What we're looking for**\n- 3+ years of experience as a design engineer or frontend developer\n- Strong skills in React, CSS, and animation libraries\n- An eye for visual design and motion\n- Portfolio showcasing craft and attention to detail" },
  { id: "j9", title: "Engineering Manager", company: companies[0], location: "Miami, FL", remote: "Hybrid", salaryMin: 220000, salaryMax: 300000, postedAt: "2026-02-28", roleType: "Engineering", experienceLevel: "Lead", skills: ["Team Leadership", "System Design", "React"], signals: [{ type: "tier1_vc", label: "Founders Fund" }, { type: "series", label: "Series D" }], description: "Ramp is seeking an Engineering Manager to lead a team building core financial infrastructure.\n\n**What you'll do**\n- Lead and grow a team of 6-10 engineers\n- Set technical direction and drive architectural decisions\n- Partner with product and design to define and deliver the roadmap\n- Foster a culture of engineering excellence and continuous improvement\n\n**What we're looking for**\n- 3+ years of engineering management experience\n- Strong technical background in system design and web technologies\n- Experience scaling teams and processes at a high-growth company\n- Ability to balance technical debt with feature velocity" },
  { id: "j10", title: "Product Designer", company: companies[1], location: "Remote", remote: "Remote", salaryMin: 150000, salaryMax: 200000, postedAt: "2026-03-06", roleType: "Design", experienceLevel: "Mid", skills: ["Figma", "Prototyping", "Web Design"], signals: [{ type: "remote", label: "Remote" }, { type: "tier1_vc", label: "Accel" }], description: "Vercel is looking for a Product Designer to craft intuitive experiences for our developer platform.\n\n**What you'll do**\n- Design features for Vercel's dashboard and deployment experience\n- Create wireframes, prototypes, and high-fidelity mockups\n- Conduct user research and iterate based on feedback\n- Collaborate with engineering to ensure pixel-perfect implementation\n\n**What we're looking for**\n- 3+ years of product design experience\n- Proficiency in Figma and prototyping tools\n- Experience designing for developer tools or technical products\n- Strong visual design skills and attention to detail" },
  { id: "j11", title: "Senior Data Engineer", company: companies[4], location: "San Francisco, CA", remote: "Hybrid", salaryMin: 250000, salaryMax: 350000, postedAt: "2026-03-03", roleType: "Engineering", experienceLevel: "Senior", skills: ["Python", "Spark", "dbt"], signals: [{ type: "funding", label: "$7.3B Raised" }], description: "Anthropic is hiring a Senior Data Engineer to build the data infrastructure powering our AI research.\n\n**What you'll do**\n- Design and build scalable data pipelines for training data\n- Create data quality frameworks and monitoring systems\n- Optimize data processing for large-scale ML workloads\n- Build internal tools for data exploration and analysis\n\n**What we're looking for**\n- 5+ years of data engineering experience\n- Expert-level Python and SQL skills\n- Experience with Spark, dbt, and modern data stack\n- Familiarity with ML training data requirements" },
  { id: "j12", title: "Junior Frontend Developer", company: companies[3], location: "San Francisco, CA", remote: "Remote", salaryMin: 110000, salaryMax: 150000, postedAt: "2026-03-05", roleType: "Engineering", experienceLevel: "Junior", skills: ["React", "JavaScript", "CSS"], signals: [{ type: "remote", label: "Remote" }, { type: "series", label: "Series C" }], description: "Notion is hiring a Junior Frontend Developer to join our growing web team.\n\n**What you'll do**\n- Build and maintain features in Notion's web application\n- Write clean, well-tested code following team standards\n- Learn from senior engineers through pair programming and code reviews\n- Contribute to improving our development processes\n\n**What we're looking for**\n- 1-2 years of frontend development experience\n- Proficiency in React, JavaScript, and CSS\n- Eagerness to learn and grow as an engineer\n- Strong fundamentals in web technologies" },
  { id: "j13", title: "Head of Growth", company: companies[5], location: "San Francisco, CA", remote: "On-site", salaryMin: 200000, salaryMax: 280000, postedAt: "2026-03-04", roleType: "Sales", experienceLevel: "Lead", skills: ["Growth Marketing", "PLG", "Analytics"], signals: [{ type: "tier1_vc", label: "Benchmark" }, { type: "series", label: "Series B" }], description: "Cursor is looking for a Head of Growth to drive user acquisition and activation for our AI code editor.\n\n**What you'll do**\n- Define and execute growth strategy across acquisition channels\n- Build and lead a growth team focused on PLG metrics\n- Design experiments to improve activation, retention, and expansion\n- Partner with product and engineering to build growth features\n\n**What we're looking for**\n- 6+ years of growth or marketing experience at a tech company\n- Experience with product-led growth strategies\n- Strong analytical skills and experimentation mindset\n- Track record of driving measurable growth results" },
  { id: "j14", title: "Infrastructure Engineer", company: companies[6], location: "Seattle, WA", remote: "Hybrid", salaryMin: 195000, salaryMax: 270000, postedAt: "2026-03-02", roleType: "Engineering", experienceLevel: "Senior", skills: ["AWS", "Terraform", "Go"], signals: [{ type: "tier1_vc", label: "Sequoia" }], description: "Stripe is hiring an Infrastructure Engineer to help build and maintain the systems that process billions of dollars in payments.\n\n**What you'll do**\n- Design and operate highly available cloud infrastructure\n- Automate infrastructure provisioning with Terraform and custom tooling\n- Improve system reliability, performance, and security\n- Participate in on-call rotations and incident response\n\n**What we're looking for**\n- 5+ years of infrastructure or SRE experience\n- Strong experience with AWS and infrastructure-as-code\n- Proficiency in Go or similar systems languages\n- Experience operating services at scale with high availability requirements" },
  { id: "j15", title: "Product Manager, AI", company: companies[4], location: "San Francisco, CA", remote: "On-site", salaryMin: 220000, salaryMax: 320000, postedAt: "2026-03-06", roleType: "Product", experienceLevel: "Senior", skills: ["AI/ML", "Product Strategy", "Research"], signals: [{ type: "tier1_vc", label: "Tier 1 VC" }, { type: "funding", label: "$7.3B Raised" }], description: "Anthropic is looking for a Product Manager to help shape how Claude is experienced by millions of users.\n\n**What you'll do**\n- Define product strategy for Claude's consumer and API products\n- Work with research and engineering to translate capabilities into features\n- Analyze usage patterns and user feedback to guide priorities\n- Drive cross-functional alignment on product direction\n\n**What we're looking for**\n- 5+ years of product management experience\n- Deep understanding of AI/ML products and capabilities\n- Strong analytical and strategic thinking skills\n- Experience shipping products at scale" },
  { id: "j16", title: "Senior iOS Engineer", company: companies[3], location: "New York, NY", remote: "Hybrid", salaryMin: 185000, salaryMax: 250000, postedAt: "2026-03-01", roleType: "Engineering", experienceLevel: "Senior", skills: ["Swift", "SwiftUI", "iOS"], signals: [{ type: "tier1_vc", label: "Index Ventures" }, { type: "series", label: "Series C" }], description: "Notion is hiring a Senior iOS Engineer to build the best mobile productivity experience.\n\n**What you'll do**\n- Build and maintain Notion's iOS application\n- Implement complex UI interactions and offline sync\n- Optimize app performance and reduce crash rates\n- Collaborate with cross-platform teams on shared architecture\n\n**What we're looking for**\n- 5+ years of iOS development experience\n- Expert-level Swift and SwiftUI skills\n- Experience with complex data sync and offline-first architectures\n- Track record of shipping high-quality iOS apps" },
];
