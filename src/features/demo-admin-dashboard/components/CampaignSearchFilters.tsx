import React from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CampaignStatus } from "../types/campaign.types";

export interface CampaignSearchFiltersProps {
  /** Current search query value */
  searchQuery?: string;
  /** Handler for search query changes */
  onSearchQueryChange: (query: string) => void;

  /** Current status filter */
  status?: CampaignStatus;
  /** Handler for status filter changes */
  onStatusChange: (status: CampaignStatus | undefined) => void;

  /** Currently selected tags */
  selectedTags?: string[];
  /** Available tag options */
  availableTags: string[];
  /** Handler for tag toggle */
  onTagToggle: (tag: string) => void;

  /** Current audience filter */
  audience?: string;
  /** Available audience options */
  availableAudiences: string[];
  /** Handler for audience filter changes */
  onAudienceChange: (audience: string | undefined) => void;

  /** Current owner filter */
  owner?: string;
  /** Available owner options */
  availableOwners: string[];
  /** Handler for owner filter changes */
  onOwnerChange: (owner: string | undefined) => void;

  /** Current scenario filter */
  scenario?: string;
  /** Available scenario options */
  availableScenarios: string[];
  /** Handler for scenario filter changes */
  onScenarioChange: (scenario: string | undefined) => void;

  /** Handler for clearing all filters */
  onClearFilters: () => void;

  /** Whether any filters are currently active */
  hasActiveFilters: boolean;

  /** Optional className for the root element */
  className?: string;
}

const STATUS_OPTIONS: { value: CampaignStatus; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "draft", label: "Draft" },
  { value: "completed", label: "Completed" },
];

/**
 * Campaign search and filter UI component.
 *
 * Provides comprehensive filtering controls for campaigns including:
 * - Text search
 * - Status filter
 * - Tag multi-select
 * - Audience filter
 * - Owner filter
 * - Scenario filter
 * - Clear all button
 *
 * Designed to work with the useCampaignFilters hook.
 */
export function CampaignSearchFilters({
  searchQuery = "",
  onSearchQueryChange,
  status,
  onStatusChange,
  selectedTags = [],
  availableTags,
  onTagToggle,
  audience,
  availableAudiences,
  onAudienceChange,
  owner,
  availableOwners,
  onOwnerChange,
  scenario,
  availableScenarios,
  onScenarioChange,
  onClearFilters,
  hasActiveFilters,
  className,
}: CampaignSearchFiltersProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          placeholder="Search campaigns by name, description, or tags..."
          className={cn(
            "w-full pl-10 pr-4 py-2 rounded-lg",
            "bg-white/[0.02] border border-white/[0.06]",
            "text-foreground placeholder:text-muted-foreground",
            "focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400/40",
            "transition-colors",
          )}
          aria-label="Search campaigns"
        />
      </div>

      {/* Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1.5">Status</label>
          <select
            value={status || ""}
            onChange={(e) => onStatusChange((e.target.value as CampaignStatus) || undefined)}
            className={cn(
              "w-full px-3 py-2 rounded-lg",
              "bg-white/[0.02] border border-white/[0.06]",
              "text-foreground",
              "focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400/40",
              "transition-colors cursor-pointer",
            )}
            aria-label="Filter by status"
          >
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Audience Filter */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1.5">Audience</label>
          <select
            value={audience || ""}
            onChange={(e) => onAudienceChange(e.target.value || undefined)}
            className={cn(
              "w-full px-3 py-2 rounded-lg",
              "bg-white/[0.02] border border-white/[0.06]",
              "text-foreground",
              "focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400/40",
              "transition-colors cursor-pointer",
            )}
            aria-label="Filter by audience"
          >
            <option value="">All Audiences</option>
            {availableAudiences.map((aud) => (
              <option key={aud} value={aud}>
                {aud}
              </option>
            ))}
          </select>
        </div>

        {/* Owner Filter */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1.5">Owner</label>
          <select
            value={owner || ""}
            onChange={(e) => onOwnerChange(e.target.value || undefined)}
            className={cn(
              "w-full px-3 py-2 rounded-lg",
              "bg-white/[0.02] border border-white/[0.06]",
              "text-foreground",
              "focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400/40",
              "transition-colors cursor-pointer",
            )}
            aria-label="Filter by owner"
          >
            <option value="">All Owners</option>
            {availableOwners.map((own) => (
              <option key={own} value={own}>
                {own}
              </option>
            ))}
          </select>
        </div>

        {/* Scenario Filter */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1.5">Scenario</label>
          <select
            value={scenario || ""}
            onChange={(e) => onScenarioChange(e.target.value || undefined)}
            className={cn(
              "w-full px-3 py-2 rounded-lg",
              "bg-white/[0.02] border border-white/[0.06]",
              "text-foreground",
              "focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400/40",
              "transition-colors cursor-pointer",
            )}
            aria-label="Filter by scenario"
          >
            <option value="">All Scenarios</option>
            {availableScenarios.map((scen) => (
              <option key={scen} value={scen}>
                {scen}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tag Filter (Multi-select as checkboxes) */}
      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-2">Tags</label>
        <div className="flex flex-wrap gap-2">
          {availableTags.map((tag) => {
            const isSelected = selectedTags.includes(tag);
            return (
              <button
                key={tag}
                onClick={() => onTagToggle(tag)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                  "border",
                  isSelected
                    ? "bg-amber-400/20 border-amber-400/40 text-amber-200"
                    : "bg-white/[0.02] border-white/[0.06] text-muted-foreground hover:bg-white/[0.04] hover:border-white/[0.12]",
                )}
                aria-pressed={isSelected}
                aria-label={`Filter by tag: ${tag}`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <div className="flex justify-end">
          <button
            onClick={onClearFilters}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-lg",
              "bg-white/[0.04] border border-white/[0.08]",
              "text-sm font-medium text-foreground",
              "hover:bg-white/[0.06] hover:border-white/[0.12]",
              "transition-colors",
            )}
            aria-label="Clear all filters"
          >
            <X className="h-4 w-4" />
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}
