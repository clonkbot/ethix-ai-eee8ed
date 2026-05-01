import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("companies")
      .withIndex("by_ranking")
      .order("asc")
      .collect();
  },
});

export const get = query({
  args: { id: v.id("companies") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("companies").first();
    if (existing) return "Already seeded";

    const companies = [
      {
        name: "Microsoft",
        ticker: "MSFT",
        sector: "Software",
        marketCap: "$3.1T",
        ethicsScore: 78,
        ranking: 1,
        trend: "up" as const,
        keyIssues: ["Data privacy concerns with Copilot", "Military AI contracts"],
        positiveFactors: ["Responsible AI principles", "AI safety research investment", "Transparency reports"],
        lastUpdated: Date.now(),
      },
      {
        name: "Alphabet (Google)",
        ticker: "GOOGL",
        sector: "Internet Services",
        marketCap: "$2.1T",
        ethicsScore: 65,
        ranking: 2,
        trend: "down" as const,
        keyIssues: ["AI ethics team controversies", "Gemini bias issues", "Antitrust AI concerns"],
        positiveFactors: ["DeepMind safety research", "Open-source AI models", "AI Principles published"],
        lastUpdated: Date.now(),
      },
      {
        name: "Apple",
        ticker: "AAPL",
        sector: "Consumer Electronics",
        marketCap: "$3.4T",
        ethicsScore: 82,
        ranking: 3,
        trend: "stable" as const,
        keyIssues: ["On-device AI privacy questions", "Limited AI transparency"],
        positiveFactors: ["Privacy-first AI approach", "On-device processing", "No cloud data training"],
        lastUpdated: Date.now(),
      },
      {
        name: "NVIDIA",
        ticker: "NVDA",
        sector: "Semiconductors",
        marketCap: "$3.0T",
        ethicsScore: 58,
        ranking: 4,
        trend: "down" as const,
        keyIssues: ["Enabling mass surveillance", "Environmental impact of AI chips", "Supply to authoritarian regimes"],
        positiveFactors: ["AI research grants", "Academic partnerships"],
        lastUpdated: Date.now(),
      },
      {
        name: "Meta",
        ticker: "META",
        sector: "Social Media",
        marketCap: "$1.4T",
        ethicsScore: 42,
        ranking: 5,
        trend: "stable" as const,
        keyIssues: ["AI-generated misinformation", "Deepfake concerns", "Data harvesting for AI training"],
        positiveFactors: ["Open-source Llama models", "AI research publications"],
        lastUpdated: Date.now(),
      },
      {
        name: "Amazon",
        ticker: "AMZN",
        sector: "E-commerce/Cloud",
        marketCap: "$2.0T",
        ethicsScore: 45,
        ranking: 6,
        trend: "down" as const,
        keyIssues: ["Facial recognition to police", "Worker surveillance AI", "Alexa privacy breaches"],
        positiveFactors: ["AWS AI ethics guidelines", "Rekognition moratorium"],
        lastUpdated: Date.now(),
      },
      {
        name: "Tesla",
        ticker: "TSLA",
        sector: "Automotive/AI",
        marketCap: "$800B",
        ethicsScore: 35,
        ranking: 7,
        trend: "down" as const,
        keyIssues: ["FSD safety incidents", "Autopilot misleading claims", "Data collection from vehicles"],
        positiveFactors: ["Pushing autonomous vehicle innovation"],
        lastUpdated: Date.now(),
      },
      {
        name: "IBM",
        ticker: "IBM",
        sector: "Enterprise Tech",
        marketCap: "$200B",
        ethicsScore: 85,
        ranking: 8,
        trend: "up" as const,
        keyIssues: ["Legacy bias in Watson Health"],
        positiveFactors: ["Early AI ethics leadership", "Exited facial recognition", "AI Fairness 360 toolkit"],
        lastUpdated: Date.now(),
      },
      {
        name: "Salesforce",
        ticker: "CRM",
        sector: "Enterprise Software",
        marketCap: "$280B",
        ethicsScore: 75,
        ranking: 9,
        trend: "up" as const,
        keyIssues: ["AI use by controversial clients"],
        positiveFactors: ["Chief Ethical AI Officer", "Einstein AI transparency", "Acceptable use policies"],
        lastUpdated: Date.now(),
      },
      {
        name: "Palantir",
        ticker: "PLTR",
        sector: "Data Analytics",
        marketCap: "$65B",
        ethicsScore: 22,
        ranking: 10,
        trend: "stable" as const,
        keyIssues: ["ICE contracts", "Military AI applications", "Surveillance capitalism", "Lack of transparency"],
        positiveFactors: ["Some government oversight compliance"],
        lastUpdated: Date.now(),
      },
    ];

    for (const company of companies) {
      await ctx.db.insert("companies", company);
    }

    return "Seeded successfully";
  },
});

export const vote = mutation({
  args: {
    companyId: v.id("companies"),
    voteType: v.union(v.literal("ethical"), v.literal("unethical"))
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check for existing vote
    const existing = await ctx.db
      .query("votes")
      .withIndex("by_user_and_company", (q) =>
        q.eq("userId", userId).eq("companyId", args.companyId)
      )
      .first();

    if (existing) {
      // Update existing vote
      await ctx.db.patch(existing._id, { voteType: args.voteType });
    } else {
      await ctx.db.insert("votes", {
        companyId: args.companyId,
        userId,
        voteType: args.voteType,
        createdAt: Date.now(),
      });
    }
  },
});

export const getVoteCounts = query({
  args: { companyId: v.id("companies") },
  handler: async (ctx, args) => {
    const votes = await ctx.db
      .query("votes")
      .withIndex("by_company", (q) => q.eq("companyId", args.companyId))
      .collect();

    const ethical = votes.filter(v => v.voteType === "ethical").length;
    const unethical = votes.filter(v => v.voteType === "unethical").length;

    return { ethical, unethical };
  },
});

export const getUserVote = query({
  args: { companyId: v.id("companies") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const vote = await ctx.db
      .query("votes")
      .withIndex("by_user_and_company", (q) =>
        q.eq("userId", userId).eq("companyId", args.companyId)
      )
      .first();

    return vote?.voteType ?? null;
  },
});
