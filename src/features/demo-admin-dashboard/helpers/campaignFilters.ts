import type { Campaign, CampaignFilters } from "../types/campaign.types";

/**
 * Campaign filter and search helpers.
 *
 * Pure functions for filtering campaigns by multiple dimensions
 * and scoring text search relevance.
 *
 * All functions are side-effect free and suitable for unit testing.
 */

/**
 * Calculate relevance score for a campaign against a search query.
 *
 * Scoring strategy:
 * - Exact name match: 100 points
 * - Name contains query: 50 points
 * - Description contains query: 25 points
 * - Tag contains query: 15 points per matching tag
 *
 * @param campaign - The campaign to score
 * @param query - The search query (case-insensitive)
 * @returns Relevance score (higher is more relevant)
 */
export function scoreCampaignMatch(campaign: Campaign, query: string): number {
  if (!query || query.trim() === "") {
    return 0;
  }

  const normalizedQuery = query.toLowerCase().trim();
  let score = 0;

  // Exact name match (highest priority)
  if (campaign.name.toLowerCase() === normalizedQuery) {
    score += 100;
  }
  // Partial name match
  else if (campaign.name.toLowerCase().includes(normalizedQuery)) {
    score += 50;
  }

  // Description match
  if (campaign.description.toLowerCase().includes(normalizedQuery)) {
    score += 25;
  }

  // Tag matches (accumulate for multiple matches)
  const matchingTags = campaign.tags.filter((tag) => tag.toLowerCase().includes(normalizedQuery));
  score += matchingTags.length * 15;

  return score;
}

/**
 * Search campaigns by text query and return results sorted by relevance.
 *
 * @param campaigns - Array of campaigns to search
 * @param query - Search query string
 * @returns Campaigns sorted by relevance score (highest first)
 */
export function searchCampaigns(campaigns: Campaign[], query: string): Campaign[] {
  if (!query || query.trim() === "") {
    return campaigns;
  }

  // Score all campaigns
  const scoredCampaigns = campaigns
    .map((campaign) => ({
      campaign,
      score: scoreCampaignMatch(campaign, query),
    }))
    .filter((item) => item.score > 0) // Only include matches
    .sort((a, b) => b.score - a.score); // Sort by score descending

  return scoredCampaigns.map((item) => item.campaign);
}

/**
 * Check if a date string falls within a date range.
 *
 * @param dateStr - ISO 8601 date string to check
 * @param start - Range start date (ISO 8601)
 * @param end - Range end date (ISO 8601)
 * @returns True if date is within range (inclusive)
 */
function isDateInRange(dateStr: string, start: string, end: string): boolean {
  const date = new Date(dateStr);
  const startDate = new Date(start);
  const endDate = new Date(end);
  return date >= startDate && date <= endDate;
}

/**
 * Apply all active filters to a campaign array.
 *
 * Filters are applied with AND logic (all active filters must match).
 * Array filters (tags) use AND logic (all specified tags must be present).
 *
 * @param campaigns - Array of campaigns to filter
 * @param filters - Filter criteria to apply
 * @returns Filtered campaign array
 */
export function filterCampaigns(campaigns: Campaign[], filters: CampaignFilters): Campaign[] {
  let result = campaigns;

  // Filter by status
  if (filters.status) {
    result = result.filter((campaign) => campaign.status === filters.status);
  }

  // Filter by tags (all specified tags must be present)
  if (filters.tags && filters.tags.length > 0) {
    result = result.filter((campaign) => filters.tags!.every((tag) => campaign.tags.includes(tag)));
  }

  // Filter by audience
  if (filters.audience) {
    result = result.filter((campaign) => campaign.audience === filters.audience);
  }

  // Filter by date range
  if (filters.dateRange) {
    result = result.filter((campaign) =>
      isDateInRange(campaign.dateCreated, filters.dateRange!.start, filters.dateRange!.end),
    );
  }

  // Filter by owner
  if (filters.owner) {
    result = result.filter((campaign) => campaign.owner === filters.owner);
  }

  // Filter by scenario
  if (filters.scenario) {
    result = result.filter((campaign) => campaign.scenario === filters.scenario);
  }

  // Apply search query (if present)
  if (filters.searchQuery) {
    result = searchCampaigns(result, filters.searchQuery);
  }

  return result;
}
