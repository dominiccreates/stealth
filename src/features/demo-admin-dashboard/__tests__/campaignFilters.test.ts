import { describe, it, expect } from "vitest";
import { scoreCampaignMatch, searchCampaigns, filterCampaigns } from "../helpers/campaignFilters";
import type { Campaign, CampaignFilters } from "../types/campaign.types";

// Test fixtures
const testCampaigns: Campaign[] = [
  {
    id: "test-001",
    name: "Welcome Onboarding",
    description: "Automated welcome series for new users",
    status: "active",
    tags: ["onboarding", "automated"],
    audience: "new-users",
    dateCreated: "2026-01-15T10:00:00Z",
    owner: "alice-admin",
    scenario: "activation",
  },
  {
    id: "test-002",
    name: "Product Launch",
    description: "Major product announcement campaign",
    status: "paused",
    tags: ["promotional", "product"],
    audience: "all-users",
    dateCreated: "2026-03-20T14:00:00Z",
    owner: "bob-marketing",
    scenario: "launch",
  },
  {
    id: "test-003",
    name: "Re-engagement Campaign",
    description: "Win back inactive users with special offers",
    status: "active",
    tags: ["re-engagement", "discount"],
    audience: "inactive-users",
    dateCreated: "2026-02-10T09:00:00Z",
    owner: "alice-admin",
    scenario: "retention",
  },
  {
    id: "test-004",
    name: "Weekly Newsletter",
    description: "Regular content digest for subscribers",
    status: "draft",
    tags: ["newsletter", "content"],
    audience: "subscribers",
    dateCreated: "2026-06-01T08:00:00Z",
    owner: "carol-content",
    scenario: "content",
  },
  {
    id: "test-005",
    name: "Holiday Special",
    description: "Seasonal promotional campaign for holidays",
    status: "completed",
    tags: ["promotional", "seasonal"],
    audience: "all-users",
    dateCreated: "2025-12-01T12:00:00Z",
    owner: "bob-marketing",
    scenario: "seasonal",
  },
];

describe("campaignFilters", () => {
  describe("scoreCampaignMatch", () => {
    it("should return 0 for empty query", () => {
      const score = scoreCampaignMatch(testCampaigns[0], "");
      expect(score).toBe(0);
    });

    it("should score exact name match highest (100 points)", () => {
      const score = scoreCampaignMatch(testCampaigns[0], "Welcome Onboarding");
      expect(score).toBeGreaterThanOrEqual(100);
    });

    it("should score exact name match case-insensitively", () => {
      const score = scoreCampaignMatch(testCampaigns[0], "welcome onboarding");
      expect(score).toBeGreaterThanOrEqual(100);
    });

    it("should score partial name match (50 points)", () => {
      const score = scoreCampaignMatch(testCampaigns[0], "Welcome");
      expect(score).toBeGreaterThanOrEqual(50);
      expect(score).toBeLessThan(100); // Should not get exact match bonus
    });

    it("should score description match (25 points)", () => {
      const campaign = testCampaigns[0];
      const score = scoreCampaignMatch(campaign, "Automated");
      // Should match description and possibly name
      expect(score).toBeGreaterThanOrEqual(25);
    });

    it("should score tag matches (15 points per tag)", () => {
      const score = scoreCampaignMatch(testCampaigns[0], "onboarding");
      // Should match tag (15) + name partial (50)
      expect(score).toBeGreaterThanOrEqual(65);
    });

    it("should accumulate scores from multiple matches", () => {
      // "promotional" appears in both tags and as partial match in other content
      const score = scoreCampaignMatch(testCampaigns[1], "promotional");
      expect(score).toBeGreaterThan(0);
    });

    it("should return 0 for no matches", () => {
      const score = scoreCampaignMatch(testCampaigns[0], "zebra");
      expect(score).toBe(0);
    });
  });

  describe("searchCampaigns", () => {
    it("should return all campaigns for empty query", () => {
      const result = searchCampaigns(testCampaigns, "");
      expect(result).toEqual(testCampaigns);
    });

    it("should return only matching campaigns", () => {
      const result = searchCampaigns(testCampaigns, "onboarding");
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((c) => scoreCampaignMatch(c, "onboarding") > 0)).toBe(true);
    });

    it("should sort results by relevance score (highest first)", () => {
      const result = searchCampaigns(testCampaigns, "promotional");
      // Verify descending order
      for (let i = 1; i < result.length; i++) {
        const prevScore = scoreCampaignMatch(result[i - 1], "promotional");
        const currScore = scoreCampaignMatch(result[i], "promotional");
        expect(prevScore).toBeGreaterThanOrEqual(currScore);
      }
    });

    it("should filter out non-matching campaigns", () => {
      const result = searchCampaigns(testCampaigns, "xyz-nonexistent");
      expect(result).toEqual([]);
    });

    it("should be case-insensitive", () => {
      const lowerResult = searchCampaigns(testCampaigns, "newsletter");
      const upperResult = searchCampaigns(testCampaigns, "NEWSLETTER");
      expect(lowerResult).toEqual(upperResult);
    });
  });

  describe("filterCampaigns", () => {
    it("should return all campaigns when no filters are applied", () => {
      const result = filterCampaigns(testCampaigns, {});
      expect(result).toEqual(testCampaigns);
    });

    describe("single filter application", () => {
      it("should filter by status", () => {
        const filters: CampaignFilters = { status: "active" };
        const result = filterCampaigns(testCampaigns, filters);
        expect(result.every((c) => c.status === "active")).toBe(true);
        expect(result.length).toBe(2); // test-001 and test-003
      });

      it("should filter by paused status", () => {
        const filters: CampaignFilters = { status: "paused" };
        const result = filterCampaigns(testCampaigns, filters);
        expect(result.every((c) => c.status === "paused")).toBe(true);
        expect(result.length).toBe(1); // test-002
      });

      it("should filter by single tag", () => {
        const filters: CampaignFilters = { tags: ["onboarding"] };
        const result = filterCampaigns(testCampaigns, filters);
        expect(result.every((c) => c.tags.includes("onboarding"))).toBe(true);
        expect(result.length).toBe(1); // test-001
      });

      it("should filter by audience", () => {
        const filters: CampaignFilters = { audience: "all-users" };
        const result = filterCampaigns(testCampaigns, filters);
        expect(result.every((c) => c.audience === "all-users")).toBe(true);
        expect(result.length).toBe(2); // test-002 and test-005
      });

      it("should filter by owner", () => {
        const filters: CampaignFilters = { owner: "alice-admin" };
        const result = filterCampaigns(testCampaigns, filters);
        expect(result.every((c) => c.owner === "alice-admin")).toBe(true);
        expect(result.length).toBe(2); // test-001 and test-003
      });

      it("should filter by scenario", () => {
        const filters: CampaignFilters = { scenario: "retention" };
        const result = filterCampaigns(testCampaigns, filters);
        expect(result.every((c) => c.scenario === "retention")).toBe(true);
        expect(result.length).toBe(1); // test-003
      });

      it("should filter by date range", () => {
        const filters: CampaignFilters = {
          dateRange: {
            start: "2026-01-01T00:00:00Z",
            end: "2026-02-28T23:59:59Z",
          },
        };
        const result = filterCampaigns(testCampaigns, filters);
        // Should include test-001 (Jan 15) and test-003 (Feb 10)
        expect(result.length).toBe(2);
        expect(result.map((c) => c.id).sort()).toEqual(["test-001", "test-003"]);
      });
    });

    describe("compound filter application", () => {
      it("should apply status + owner filters (AND logic)", () => {
        const filters: CampaignFilters = {
          status: "active",
          owner: "alice-admin",
        };
        const result = filterCampaigns(testCampaigns, filters);
        expect(result.every((c) => c.status === "active" && c.owner === "alice-admin")).toBe(true);
        expect(result.length).toBe(2); // test-001 and test-003
      });

      it("should apply status + audience + tag filters", () => {
        const filters: CampaignFilters = {
          status: "active",
          audience: "new-users",
          tags: ["onboarding"],
        };
        const result = filterCampaigns(testCampaigns, filters);
        expect(
          result.every(
            (c) =>
              c.status === "active" && c.audience === "new-users" && c.tags.includes("onboarding"),
          ),
        ).toBe(true);
        expect(result.length).toBe(1); // test-001
      });

      it("should apply multiple tags with AND logic", () => {
        const filters: CampaignFilters = {
          tags: ["promotional", "seasonal"],
        };
        const result = filterCampaigns(testCampaigns, filters);
        // Both tags must be present
        expect(
          result.every((c) => c.tags.includes("promotional") && c.tags.includes("seasonal")),
        ).toBe(true);
        expect(result.length).toBe(1); // test-005
      });

      it("should combine status + date range + owner", () => {
        const filters: CampaignFilters = {
          status: "active",
          owner: "alice-admin",
          dateRange: {
            start: "2026-02-01T00:00:00Z",
            end: "2026-03-31T23:59:59Z",
          },
        };
        const result = filterCampaigns(testCampaigns, filters);
        expect(result.length).toBe(1); // test-003
        expect(result[0].id).toBe("test-003");
      });
    });

    describe("search query integration", () => {
      it("should apply search query to filtered results", () => {
        const filters: CampaignFilters = {
          status: "active",
          searchQuery: "onboarding",
        };
        const result = filterCampaigns(testCampaigns, filters);
        expect(result.length).toBe(1);
        expect(result[0].id).toBe("test-001");
      });

      it("should combine all filters with search", () => {
        const filters: CampaignFilters = {
          owner: "bob-marketing",
          searchQuery: "promotional",
        };
        const result = filterCampaigns(testCampaigns, filters);
        // Should match test-002 and test-005 (both by bob-marketing with promotional tag)
        expect(result.length).toBe(2);
      });
    });

    describe("edge cases", () => {
      it("should return empty array when no campaigns match", () => {
        const filters: CampaignFilters = {
          status: "active",
          audience: "nonexistent-audience",
        };
        const result = filterCampaigns(testCampaigns, filters);
        expect(result).toEqual([]);
      });

      it("should handle empty tags array as no filter", () => {
        const filters: CampaignFilters = { tags: [] };
        const result = filterCampaigns(testCampaigns, filters);
        expect(result).toEqual(testCampaigns);
      });

      it("should handle whitespace-only search query", () => {
        const filters: CampaignFilters = { searchQuery: "   " };
        const result = filterCampaigns(testCampaigns, filters);
        // Should treat as empty query
        expect(result).toEqual(testCampaigns);
      });

      it("should return empty for impossible filter combinations", () => {
        const filters: CampaignFilters = {
          status: "draft",
          owner: "alice-admin",
          // alice-admin has no drafts in test data
        };
        const result = filterCampaigns(testCampaigns, filters);
        expect(result).toEqual([]);
      });
    });

    describe("date range filtering", () => {
      it("should include campaigns on boundary dates", () => {
        const filters: CampaignFilters = {
          dateRange: {
            start: "2026-01-15T10:00:00Z",
            end: "2026-01-15T10:00:00Z",
          },
        };
        const result = filterCampaigns(testCampaigns, filters);
        expect(result.length).toBe(1);
        expect(result[0].id).toBe("test-001");
      });

      it("should filter across year boundaries", () => {
        const filters: CampaignFilters = {
          dateRange: {
            start: "2025-12-01T00:00:00Z",
            end: "2026-01-31T23:59:59Z",
          },
        };
        const result = filterCampaigns(testCampaigns, filters);
        // Should include test-005 (Dec 2025) and test-001 (Jan 2026)
        expect(result.length).toBe(2);
      });
    });
  });
});
