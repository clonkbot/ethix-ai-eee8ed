import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,

  companies: defineTable({
    name: v.string(),
    ticker: v.string(),
    logoUrl: v.optional(v.string()),
    sector: v.string(),
    marketCap: v.string(),
    ethicsScore: v.number(), // 0-100
    ranking: v.number(),
    trend: v.union(v.literal("up"), v.literal("down"), v.literal("stable")),
    keyIssues: v.array(v.string()),
    positiveFactors: v.array(v.string()),
    lastUpdated: v.number(),
    createdBy: v.optional(v.id("users")),
  }).index("by_ranking", ["ranking"])
    .index("by_ethics_score", ["ethicsScore"]),

  analyses: defineTable({
    companyId: v.id("companies"),
    userId: v.id("users"),
    content: v.string(),
    generatedAt: v.number(),
  }).index("by_company", ["companyId"])
    .index("by_user", ["userId"]),

  votes: defineTable({
    companyId: v.id("companies"),
    userId: v.id("users"),
    voteType: v.union(v.literal("ethical"), v.literal("unethical")),
    createdAt: v.number(),
  }).index("by_company", ["companyId"])
    .index("by_user_and_company", ["userId", "companyId"]),
});
