import { useState, useEffect } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";

// Types
type Company = {
  _id: Id<"companies">;
  name: string;
  ticker: string;
  sector: string;
  marketCap: string;
  ethicsScore: number;
  ranking: number;
  trend: "up" | "down" | "stable";
  keyIssues: string[];
  positiveFactors: string[];
  lastUpdated: number;
};

// Auth Component
function AuthScreen() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    try {
      await signIn("password", formData);
    } catch {
      setError(flow === "signIn" ? "Invalid credentials" : "Could not create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center p-4">
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
      }} />

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl md:text-5xl text-[#F5F5DC] mb-2">
            ETHIX<span className="text-emerald-400">.</span>AI
          </h1>
          <p className="font-mono text-sm text-gray-500 tracking-widest uppercase">
            Tech Ethics Accountability Tracker
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#1A1A1A] border border-gray-800 p-6 md:p-8 space-y-5">
          <div className="space-y-1">
            <label className="font-mono text-xs text-gray-500 uppercase tracking-wider">Email</label>
            <input
              name="email"
              type="email"
              required
              className="w-full bg-[#0D0D0D] border border-gray-700 px-4 py-3 text-[#F5F5DC] font-mono focus:outline-none focus:border-emerald-400 transition-colors"
              placeholder="analyst@tech.co"
            />
          </div>
          <div className="space-y-1">
            <label className="font-mono text-xs text-gray-500 uppercase tracking-wider">Password</label>
            <input
              name="password"
              type="password"
              required
              className="w-full bg-[#0D0D0D] border border-gray-700 px-4 py-3 text-[#F5F5DC] font-mono focus:outline-none focus:border-emerald-400 transition-colors"
              placeholder="••••••••"
            />
          </div>
          <input name="flow" type="hidden" value={flow} />

          {error && (
            <div className="text-red-400 font-mono text-sm border border-red-900 bg-red-950/50 px-4 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold py-3 uppercase tracking-wider transition-colors disabled:opacity-50"
          >
            {loading ? "Processing..." : flow === "signIn" ? "Access Terminal" : "Register"}
          </button>

          <button
            type="button"
            onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
            className="w-full text-gray-500 hover:text-[#F5F5DC] font-mono text-sm transition-colors py-2"
          >
            {flow === "signIn" ? "Create new account" : "Already have access?"}
          </button>
        </form>

        <button
          onClick={() => signIn("anonymous")}
          className="w-full mt-4 border border-gray-700 hover:border-gray-500 text-gray-400 hover:text-[#F5F5DC] font-mono text-sm py-3 transition-all"
        >
          Continue as Guest Observer
        </button>
      </div>
    </div>
  );
}

// Score Badge Component
function ScoreBadge({ score }: { score: number }) {
  const getColor = () => {
    if (score >= 70) return "bg-emerald-500/20 text-emerald-400 border-emerald-500/50";
    if (score >= 50) return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50";
    if (score >= 30) return "bg-orange-500/20 text-orange-400 border-orange-500/50";
    return "bg-red-500/20 text-red-400 border-red-500/50";
  };

  const getLabel = () => {
    if (score >= 70) return "ETHICAL";
    if (score >= 50) return "MODERATE";
    if (score >= 30) return "CONCERNING";
    return "PROBLEMATIC";
  };

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 border font-mono text-xs ${getColor()}`}>
      <span className="font-bold">{score}</span>
      <span className="opacity-70">/100</span>
      <span className="hidden sm:inline ml-1">{getLabel()}</span>
    </div>
  );
}

// Trend Indicator
function TrendIndicator({ trend }: { trend: "up" | "down" | "stable" }) {
  if (trend === "up") return <span className="text-emerald-400">▲</span>;
  if (trend === "down") return <span className="text-red-400">▼</span>;
  return <span className="text-gray-500">◆</span>;
}

// Company Card Component
function CompanyCard({
  company,
  onSelect,
  isSelected
}: {
  company: Company;
  onSelect: () => void;
  isSelected: boolean;
}) {
  const isProblematic = company.ethicsScore < 40;

  return (
    <div
      onClick={onSelect}
      className={`
        relative cursor-pointer transition-all duration-300 group
        ${isSelected ? 'ring-2 ring-emerald-400' : ''}
        ${isProblematic
          ? 'bg-gradient-to-br from-red-950/30 to-[#1A1A1A] border-red-900/50 hover:border-red-700'
          : 'bg-[#1A1A1A] border-gray-800 hover:border-emerald-500/50'
        }
        border p-4 md:p-6
      `}
    >
      {/* Rank Badge */}
      <div className={`
        absolute -top-3 -left-3 w-8 h-8 flex items-center justify-center font-mono text-sm font-bold
        ${isProblematic ? 'bg-red-600 text-white' : 'bg-emerald-500 text-black'}
      `}>
        {company.ranking}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-display text-xl md:text-2xl text-[#F5F5DC] truncate">{company.name}</h3>
            <TrendIndicator trend={company.trend} />
          </div>
          <div className="flex flex-wrap items-center gap-2 md:gap-4 font-mono text-xs text-gray-500">
            <span className="bg-gray-800 px-2 py-0.5">{company.ticker}</span>
            <span className="hidden sm:inline">{company.sector}</span>
            <span>{company.marketCap}</span>
          </div>
        </div>
        <ScoreBadge score={company.ethicsScore} />
      </div>

      {/* Issues Preview */}
      <div className="mt-4 space-y-2">
        {company.keyIssues.slice(0, 2).map((issue, i) => (
          <div key={i} className="flex items-start gap-2 text-xs md:text-sm">
            <span className="text-red-400 mt-0.5">×</span>
            <span className="text-gray-400">{issue}</span>
          </div>
        ))}
        {company.positiveFactors.slice(0, 1).map((factor, i) => (
          <div key={i} className="flex items-start gap-2 text-xs md:text-sm">
            <span className="text-emerald-400 mt-0.5">✓</span>
            <span className="text-gray-400">{factor}</span>
          </div>
        ))}
      </div>

      {/* Expand indicator */}
      <div className="absolute bottom-2 right-2 text-gray-600 group-hover:text-emerald-400 transition-colors font-mono text-xs">
        {isSelected ? "CLOSE" : "ANALYZE →"}
      </div>
    </div>
  );
}

// Company Detail Panel
function CompanyDetail({ company, onClose }: { company: Company; onClose: () => void }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const chat = useAction(api.ai.chat);
  const saveAnalysis = useMutation(api.analyses.create);
  const vote = useMutation(api.companies.vote);
  const voteCounts = useQuery(api.companies.getVoteCounts, { companyId: company._id });
  const userVote = useQuery(api.companies.getUserVote, { companyId: company._id });

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setError(null);
    try {
      const result = await chat({
        systemPrompt: `You are an AI ethics analyst providing concise, factual assessments of tech companies' AI practices. Be balanced but direct. Focus on: data privacy, algorithmic bias, transparency, labor practices related to AI, military/surveillance applications, and environmental impact. Keep your analysis to 3-4 short paragraphs.`,
        messages: [{
          role: "user",
          content: `Analyze ${company.name} (${company.ticker})'s ethical AI track record. They currently have an ethics score of ${company.ethicsScore}/100.

Key issues: ${company.keyIssues.join(", ")}
Positive factors: ${company.positiveFactors.join(", ")}

Provide a balanced but honest assessment.`
        }]
      });
      setAnalysis(result);
      await saveAnalysis({ companyId: company._id, content: result });
    } catch {
      setError("Analysis failed. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleVote = async (voteType: "ethical" | "unethical") => {
    try {
      await vote({ companyId: company._id, voteType });
    } catch {
      setError("Vote failed. Please sign in.");
    }
  };

  const isProblematic = company.ethicsScore < 40;

  return (
    <div className={`
      border p-4 md:p-8 animate-fadeIn
      ${isProblematic
        ? 'bg-gradient-to-br from-red-950/20 to-[#0D0D0D] border-red-900/50'
        : 'bg-[#0D0D0D] border-emerald-900/50'
      }
    `}>
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="font-display text-2xl md:text-4xl text-[#F5F5DC] mb-2">{company.name}</h2>
          <div className="flex flex-wrap items-center gap-2 md:gap-4 font-mono text-xs md:text-sm text-gray-500">
            <span>{company.ticker}</span>
            <span>|</span>
            <span>{company.sector}</span>
            <span>|</span>
            <span>{company.marketCap}</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-[#F5F5DC] font-mono text-sm transition-colors self-start"
        >
          [CLOSE]
        </button>
      </div>

      {/* Score Display */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
        <div className={`p-4 md:p-6 border ${isProblematic ? 'border-red-900 bg-red-950/20' : 'border-emerald-900 bg-emerald-950/20'}`}>
          <div className="font-mono text-xs text-gray-500 uppercase mb-2">Ethics Score</div>
          <div className={`font-display text-4xl md:text-5xl ${isProblematic ? 'text-red-400' : 'text-emerald-400'}`}>
            {company.ethicsScore}
          </div>
        </div>
        <div className="p-4 md:p-6 border border-gray-800 bg-gray-900/20">
          <div className="font-mono text-xs text-gray-500 uppercase mb-2">Ranking</div>
          <div className="font-display text-4xl md:text-5xl text-[#F5F5DC]">
            #{company.ranking}
          </div>
        </div>
        <div className="p-4 md:p-6 border border-gray-800 bg-gray-900/20">
          <div className="font-mono text-xs text-gray-500 uppercase mb-2">Trend</div>
          <div className="font-display text-4xl md:text-5xl">
            <TrendIndicator trend={company.trend} />
            <span className="text-xl md:text-2xl text-gray-400 ml-2 capitalize">{company.trend}</span>
          </div>
        </div>
      </div>

      {/* Issues & Positives */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <h3 className="font-mono text-xs text-red-400 uppercase tracking-wider mb-3">Key Issues</h3>
          <ul className="space-y-2">
            {company.keyIssues.map((issue, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="text-red-400 mt-0.5">×</span>
                <span className="text-gray-300">{issue}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-mono text-xs text-emerald-400 uppercase tracking-wider mb-3">Positive Factors</h3>
          <ul className="space-y-2">
            {company.positiveFactors.map((factor, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="text-emerald-400 mt-0.5">✓</span>
                <span className="text-gray-300">{factor}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Community Vote */}
      <div className="border border-gray-800 p-4 md:p-6 mb-8">
        <h3 className="font-mono text-xs text-gray-500 uppercase tracking-wider mb-4">Community Assessment</h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => handleVote("ethical")}
            className={`flex-1 py-3 font-mono text-sm transition-all border ${
              userVote === "ethical"
                ? 'bg-emerald-500 text-black border-emerald-500'
                : 'border-emerald-700 text-emerald-400 hover:bg-emerald-950'
            }`}
          >
            ETHICAL ({voteCounts?.ethical ?? 0})
          </button>
          <button
            onClick={() => handleVote("unethical")}
            className={`flex-1 py-3 font-mono text-sm transition-all border ${
              userVote === "unethical"
                ? 'bg-red-500 text-white border-red-500'
                : 'border-red-700 text-red-400 hover:bg-red-950'
            }`}
          >
            UNETHICAL ({voteCounts?.unethical ?? 0})
          </button>
        </div>
      </div>

      {/* AI Analysis */}
      <div className="border border-gray-800 p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h3 className="font-mono text-xs text-gray-500 uppercase tracking-wider">AI-Powered Deep Analysis</h3>
          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="bg-[#F5F5DC] hover:bg-white text-black font-mono text-sm px-4 py-2 transition-colors disabled:opacity-50"
          >
            {analyzing ? "ANALYZING..." : "GENERATE ANALYSIS"}
          </button>
        </div>

        {analyzing && (
          <div className="flex items-center gap-3 py-8">
            <div className="w-3 h-3 bg-emerald-400 animate-pulse rounded-full"></div>
            <span className="font-mono text-sm text-gray-400">Processing ethics data...</span>
          </div>
        )}

        {error && (
          <div className="text-red-400 font-mono text-sm border border-red-900 bg-red-950/50 px-4 py-3">
            {error}
          </div>
        )}

        {analysis && (
          <div className="prose prose-invert max-w-none">
            <div className="font-mono text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
              {analysis}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Filter Bar
function FilterBar({
  filter,
  setFilter,
  sortBy,
  setSortBy
}: {
  filter: string;
  setFilter: (f: string) => void;
  sortBy: string;
  setSortBy: (s: string) => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-8">
      <div className="flex flex-wrap gap-2">
        {["all", "ethical", "moderate", "problematic"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 md:px-4 py-2 font-mono text-xs uppercase transition-all ${
              filter === f
                ? 'bg-emerald-500 text-black'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {f}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2 sm:ml-auto">
        <span className="font-mono text-xs text-gray-500">SORT:</span>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-gray-800 border border-gray-700 text-[#F5F5DC] font-mono text-xs px-3 py-2 focus:outline-none focus:border-emerald-500"
        >
          <option value="ranking">Ranking</option>
          <option value="score-high">Score (High to Low)</option>
          <option value="score-low">Score (Low to High)</option>
          <option value="name">Name</option>
        </select>
      </div>
    </div>
  );
}

// Main Dashboard
function Dashboard() {
  const { signOut } = useAuthActions();
  const companies = useQuery(api.companies.list);
  const seedCompanies = useMutation(api.companies.seed);
  const [selectedId, setSelectedId] = useState<Id<"companies"> | null>(null);
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("ranking");
  const [seeded, setSeeded] = useState(false);

  useEffect(() => {
    if (companies && companies.length === 0 && !seeded) {
      seedCompanies();
      setSeeded(true);
    }
  }, [companies, seeded, seedCompanies]);

  const filteredCompanies = (companies ?? [])
    .filter((c: Company) => {
      if (filter === "all") return true;
      if (filter === "ethical") return c.ethicsScore >= 70;
      if (filter === "moderate") return c.ethicsScore >= 40 && c.ethicsScore < 70;
      if (filter === "problematic") return c.ethicsScore < 40;
      return true;
    })
    .sort((a: Company, b: Company) => {
      if (sortBy === "ranking") return a.ranking - b.ranking;
      if (sortBy === "score-high") return b.ethicsScore - a.ethicsScore;
      if (sortBy === "score-low") return a.ethicsScore - b.ethicsScore;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return 0;
    });

  const selectedCompany = companies?.find((c: Company) => c._id === selectedId);

  const stats = companies ? {
    total: companies.length,
    avgScore: Math.round(companies.reduce((a: number, c: Company) => a + c.ethicsScore, 0) / companies.length),
    ethical: companies.filter((c: Company) => c.ethicsScore >= 70).length,
    problematic: companies.filter((c: Company) => c.ethicsScore < 40).length,
  } : null;

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex flex-col">
      {/* Grain overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-20" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
      }} />

      {/* Header */}
      <header className="relative z-10 border-b border-gray-800 px-4 md:px-8 py-4 md:py-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl md:text-3xl text-[#F5F5DC]">
              ETHIX<span className="text-emerald-400">.</span>AI
            </h1>
            <p className="font-mono text-xs text-gray-500 tracking-wider">
              PUBLIC TECH ETHICS ACCOUNTABILITY TRACKER
            </p>
          </div>
          <button
            onClick={() => signOut()}
            className="text-gray-500 hover:text-red-400 font-mono text-xs transition-colors self-start sm:self-center"
          >
            [SIGN OUT]
          </button>
        </div>
      </header>

      {/* Stats Bar */}
      {stats && (
        <div className="relative z-10 border-b border-gray-800 bg-gray-900/50 px-4 md:px-8 py-4">
          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            <div>
              <div className="font-mono text-xs text-gray-500">TRACKING</div>
              <div className="font-display text-xl md:text-2xl text-[#F5F5DC]">{stats.total} <span className="text-sm text-gray-500">companies</span></div>
            </div>
            <div>
              <div className="font-mono text-xs text-gray-500">AVG SCORE</div>
              <div className="font-display text-xl md:text-2xl text-yellow-400">{stats.avgScore}/100</div>
            </div>
            <div>
              <div className="font-mono text-xs text-gray-500">ETHICAL</div>
              <div className="font-display text-xl md:text-2xl text-emerald-400">{stats.ethical}</div>
            </div>
            <div>
              <div className="font-mono text-xs text-gray-500">PROBLEMATIC</div>
              <div className="font-display text-xl md:text-2xl text-red-400">{stats.problematic}</div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="relative z-10 flex-1 px-4 md:px-8 py-6 md:py-8">
        <div className="max-w-7xl mx-auto">
          <FilterBar
            filter={filter}
            setFilter={setFilter}
            sortBy={sortBy}
            setSortBy={setSortBy}
          />

          {!companies && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {[1,2,3,4].map((i) => (
                <div key={i} className="bg-gray-800/50 border border-gray-800 h-40 animate-pulse" />
              ))}
            </div>
          )}

          {companies && companies.length === 0 && (
            <div className="text-center py-12">
              <div className="font-mono text-gray-500">Loading company data...</div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8">
            {filteredCompanies.map((company: Company, index: number) => (
              <div
                key={company._id}
                className="animate-fadeIn"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CompanyCard
                  company={company}
                  onSelect={() => setSelectedId(selectedId === company._id ? null : company._id)}
                  isSelected={selectedId === company._id}
                />
              </div>
            ))}
          </div>

          {selectedCompany && (
            <CompanyDetail
              company={selectedCompany}
              onClose={() => setSelectedId(null)}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-800 px-4 md:px-8 py-4 md:py-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="font-mono text-xs text-gray-600">
            Data updated in real-time · Powered by AI analysis
          </div>
          <div className="font-mono text-xs text-gray-600">
            Requested by <span className="text-gray-500">@donethedirt</span> · Built by <span className="text-gray-500">@clonkbot</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Main App
export default function App() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-emerald-400 animate-pulse rounded-full"></div>
          <span className="font-mono text-sm text-gray-400">Initializing ETHIX.AI...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  return <Dashboard />;
}
