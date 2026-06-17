# Campaign Search & Filters

**Issue:** #281  
**Status:** Implemented  
**Scope:** `src/features/demo-admin-dashboard/`

---

## Overview

This module provides a complete search and filtering system for campaigns in the Demo Admin Dashboard. All data is fake, deterministic, and safe for public repository review.

---

## Architecture

### Types (`types/campaign.types.ts`)

#### `Campaign`

Represents a single campaign record with the following fields:

```typescript
interface Campaign {
  id: string; // Unique identifier
  name: string; // Campaign name
  description: string; // Campaign description
  status: CampaignStatus; // "active" | "paused" | "draft" | "completed"
  tags: string[]; // Associated tags for categorization
  audience: string; // Target audience segment
  dateCreated: string; // ISO 8601 date string
  owner: string; // Campaign owner/creator
  scenario: string; // Scenario type
}
```

#### `CampaignFilters`

Defines available filter dimensions:

```typescript
interface CampaignFilters {
  searchQuery?: string; // Text search
  status?: CampaignStatus; // Exact status match
  tags?: string[]; // All tags must match (AND)
  audience?: string; // Exact audience match
  dateRange?: { start: string; end: string }; // Inclusive date range
  owner?: string; // Exact owner match
  scenario?: string; // Exact scenario match
}
```

---

## Filter Logic

### Filter Combination

All active filters use **AND logic** — a campaign must satisfy every active filter to be included in results.

### Tag Filtering

When multiple tags are specified, **all tags must be present** on the campaign (AND logic, not OR).

### Date Range Filtering

Date ranges are **inclusive** on both boundaries. Dates are compared using ISO 8601 string parsing.

---

## Search Scoring

The search algorithm scores campaigns based on text match quality:

| Match Type         | Points     | Description                                            |
| ------------------ | ---------- | ------------------------------------------------------ |
| Exact name match   | 100        | Query exactly matches campaign name (case-insensitive) |
| Partial name match | 50         | Campaign name contains the query                       |
| Description match  | 25         | Campaign description contains the query                |
| Tag match          | 15 per tag | Query matches one or more tags                         |

Search results are sorted by **descending score** (most relevant first).

### Search Behavior

- Case-insensitive matching
- Partial substring matching (not fuzzy/Levenshtein)
- Multiple matches accumulate points
- Zero-score results are excluded from output

---

## API Reference

### Helper Functions

#### `scoreCampaignMatch(campaign, query): number`

Calculate relevance score for a single campaign.

**Parameters:**

- `campaign: Campaign` — Campaign to score
- `query: string` — Search query

**Returns:** Numeric score (higher = more relevant)

---

#### `searchCampaigns(campaigns, query): Campaign[]`

Search campaigns and return sorted results.

**Parameters:**

- `campaigns: Campaign[]` — Array of campaigns to search
- `query: string` — Search query

**Returns:** Campaigns sorted by relevance (highest first)

---

#### `filterCampaigns(campaigns, filters): Campaign[]`

Apply all active filters to campaign array.

**Parameters:**

- `campaigns: Campaign[]` — Array to filter
- `filters: CampaignFilters` — Filter criteria

**Returns:** Filtered campaign array

---

### React Hook

#### `useCampaignFilters(initialData)`

Manages filter state and applies filters with memoization.

**Parameters:**

- `initialData: Campaign[]` — Array of campaigns to filter

**Returns:**

```typescript
{
  // State
  filters: CampaignFilters;
  filteredResults: Campaign[];
  hasActiveFilters: boolean;

  // Update functions
  setSearchQuery: (query: string) => void;
  setStatus: (status: CampaignStatus | undefined) => void;
  toggleTag: (tag: string) => void;
  setTags: (tags: string[] | undefined) => void;
  setAudience: (audience: string | undefined) => void;
  setDateRange: (range: { start: string; end: string } | undefined) => void;
  setOwner: (owner: string | undefined) => void;
  setScenario: (scenario: string | undefined) => void;
  resetFilters: () => void;
}
```

---

### UI Component

#### `<CampaignSearchFilters />`

Provides a complete UI for search and filtering.

**Required Props:**

- `onSearchQueryChange: (query: string) => void`
- `onStatusChange: (status: CampaignStatus | undefined) => void`
- `onTagToggle: (tag: string) => void`
- `onAudienceChange: (audience: string | undefined) => void`
- `onOwnerChange: (owner: string | undefined) => void`
- `onScenarioChange: (scenario: string | undefined) => void`
- `onClearFilters: () => void`
- `hasActiveFilters: boolean`
- `availableTags: string[]`
- `availableAudiences: string[]`
- `availableOwners: string[]`
- `availableScenarios: string[]`

**Optional Props:**

- `searchQuery?: string`
- `status?: CampaignStatus`
- `selectedTags?: string[]`
- `audience?: string`
- `owner?: string`
- `scenario?: string`
- `className?: string`

---

## Fixtures

### `campaignFixtures` (`fixtures/campaigns.fixture.ts`)

Provides 22 deterministic campaign records covering:

- All 4 status values
- 20+ unique tags
- 15+ audience segments
- Dates spanning Nov 2025 - Jun 2026
- 4 different owners
- 15+ scenario types

**Usage:**

```typescript
import { campaignFixtures } from "../fixtures/campaigns.fixture";
```

---

## Testing

Tests are located in `__tests__/campaignFilters.test.ts` and cover:

### Search Scoring

- Empty query handling
- Exact name matches (100 points)
- Partial name matches (50 points)
- Description matches (25 points)
- Tag matches (15 points per tag)
- Score accumulation
- Case-insensitive matching

### Search Function

- Empty query returns all campaigns
- Results sorted by score
- Zero-score campaigns excluded
- Case-insensitive behavior

### Single Filter Tests

- Status filter
- Tag filter (single and multiple)
- Audience filter
- Owner filter
- Scenario filter
- Date range filter (inclusive boundaries, cross-year)

### Compound Filter Tests

- Status + Owner
- Status + Audience + Tags
- Multiple tags (AND logic)
- Status + Date Range + Owner
- All filters combined

### Search + Filter Integration

- Search applied to filtered results
- All filters with search query

### Edge Cases

- No matches return empty array
- Empty tag array treated as no filter
- Whitespace-only search query
- Impossible filter combinations
- Boundary date matching

**Run tests:**

```bash
npm test -- campaignFilters.test.ts
```

---

## Follow-up Integration Notes

### How to Consume This Module

This module is **self-contained** and ready for integration into the wider admin dashboard. Here's how to wire it up:

#### 1. Import the Hook and Component

```typescript
import { useCampaignFilters } from "@/features/demo-admin-dashboard/hooks/useCampaignFilters";
import { CampaignSearchFilters } from "@/features/demo-admin-dashboard/components/CampaignSearchFilters";
import { campaignFixtures } from "@/features/demo-admin-dashboard/fixtures/campaigns.fixture";
```

#### 2. Use in a Dashboard Page

```typescript
function CampaignManagementPage() {
  const {
    filters,
    filteredResults,
    setSearchQuery,
    setStatus,
    toggleTag,
    setAudience,
    setOwner,
    setScenario,
    resetFilters,
    hasActiveFilters,
  } = useCampaignFilters(campaignFixtures);

  // Extract unique values for dropdowns
  const availableTags = Array.from(new Set(campaignFixtures.flatMap(c => c.tags)));
  const availableAudiences = Array.from(new Set(campaignFixtures.map(c => c.audience)));
  const availableOwners = Array.from(new Set(campaignFixtures.map(c => c.owner)));
  const availableScenarios = Array.from(new Set(campaignFixtures.map(c => c.scenario)));

  return (
    <div>
      <CampaignSearchFilters
        searchQuery={filters.searchQuery}
        onSearchQueryChange={setSearchQuery}
        status={filters.status}
        onStatusChange={setStatus}
        selectedTags={filters.tags}
        availableTags={availableTags}
        onTagToggle={toggleTag}
        audience={filters.audience}
        availableAudiences={availableAudiences}
        onAudienceChange={setAudience}
        owner={filters.owner}
        availableOwners={availableOwners}
        onOwnerChange={setOwner}
        scenario={filters.scenario}
        availableScenarios={availableScenarios}
        onScenarioChange={setScenario}
        onClearFilters={resetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Render filteredResults in a table or card grid */}
      <div>
        {filteredResults.map(campaign => (
          <div key={campaign.id}>{campaign.name}</div>
        ))}
      </div>
    </div>
  );
}
```

#### 3. Replace Fixture Data with Real Data

When connecting to a live data source:

- Replace `campaignFixtures` with API response data
- Ensure data conforms to the `Campaign` interface
- Keep using `useCampaignFilters` hook unchanged

#### 4. Add Routing (If Needed)

To make this a routed page in the dashboard:

- Add a route entry in your router configuration
- Link to it from the dashboard navigation
- This should **not** require modifying files outside `src/features/demo-admin-dashboard/`

#### 5. Styling Customization

The component uses Tailwind utility classes compatible with the existing design system. Adjust colors/spacing via the `className` prop if needed.

---

## Adding New Filter Dimensions

To add a new filter dimension (e.g., `priority`):

1. **Update `Campaign` type** in `types/campaign.types.ts`:

   ```typescript
   interface Campaign {
     // ... existing fields
     priority: "low" | "medium" | "high";
   }
   ```

2. **Update `CampaignFilters` type**:

   ```typescript
   interface CampaignFilters {
     // ... existing fields
     priority?: "low" | "medium" | "high";
   }
   ```

3. **Update `filterCampaigns` helper** in `helpers/campaignFilters.ts`:

   ```typescript
   if (filters.priority) {
     result = result.filter((campaign) => campaign.priority === filters.priority);
   }
   ```

4. **Update hook** in `hooks/useCampaignFilters.ts`:

   ```typescript
   const setPriority = (priority: "low" | "medium" | "high" | undefined) => {
     setFilters((prev) => ({ ...prev, priority }));
   };
   // Add to return object
   ```

5. **Update component** in `components/CampaignSearchFilters.tsx`:
   - Add new prop for `priority` and `onPriorityChange`
   - Add select dropdown for priority filter

6. **Add test cases** in `__tests__/campaignFilters.test.ts`

---

## Constraints & Boundaries

✅ **What This Module Does:**

- Filters campaigns by multiple dimensions
- Scores and ranks search results
- Provides React UI components for filtering
- Works with deterministic fixture data

❌ **Out of Scope (By Design):**

- Campaign CRUD operations (create, update, delete)
- Live API integration
- Persisting filter state to URL/localStorage
- Real user data or secrets
- Modifications to files outside `src/features/demo-admin-dashboard/`

---

## Future Enhancements

Potential improvements (not required for issue #281):

- Fuzzy/Levenshtein matching for search
- Search highlighting in results
- URL query parameter persistence
- Export filtered results (CSV/JSON)
- Advanced date range picker UI
- Filter preset saving
- Filter analytics (most-used filters)

---

## Compliance

This implementation satisfies all acceptance criteria from Issue #281:

- ✅ All work under `src/features/demo-admin-dashboard/`
- ✅ No files outside the folder modified
- ✅ Campaign tags, metadata, scenario represented
- ✅ Validation via comprehensive tests
- ✅ Documentation included
- ✅ Demo data is fake, deterministic, and public-safe
