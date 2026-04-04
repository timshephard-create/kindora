import type { ToolId } from '@/config/platform';

// --- Places ---

export interface PlaceResult {
  name: string;
  address: string;
  phone: string | null;
  rating: number | null;
  totalRatings: number;
  hours: string[] | null;
  distance: string | null;
  placeId: string;
  mapsUrl: string;
}

// --- Sprout ---

export interface SproutProfile {
  situation: string;
  childAges: string[];
  zip: string;
  income: string;
  schedule: string;
  budget: number;
}

export interface SavingsBreakdown {
  ccdf: number;
  fsa: number;
  ctc: number;
  total: number;
}

// --- HealthGuide ---

export interface HealthProfile {
  householdSize: string;
  income: number;
  employerCoverage: string;
  healthUsage: string;
  priority: string;
  doctorImportance: string;
  riskTolerance: string;
}

export type PlanRank = 'best' | 'strong' | 'consider';

export interface PlanRecommendation {
  rank: PlanRank;
  rankLabel: string;
  name: string;
  why: string;
  pros: string[];
  watchOut: string[];
}

// --- BrightWatch ---

export interface BrightWatchRecommendation {
  name: string;
  type: 'TV Show' | 'App' | 'Game';
  platform: string;
  score: number;
  stimulation: 'Low' | 'Medium' | 'High';
  why: string;
  tip: string;
}

export interface BrightWatchResponse {
  insight: string;
  recommendations: BrightWatchRecommendation[];
  avoid: string;
}

// --- Lead / Email ---

export interface LeadInput {
  name: string;
  email: string;
  tool: string;
  profileSummary?: string;
}

export interface EmailInput {
  name: string;
  email: string;
  tool: string;
}

// --- API Responses ---

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// --- Quiz ---

export type QuestionType = 'single' | 'multi' | 'text' | 'slider';

export interface QuizOption {
  value: string;
  label: string;
}

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  label: string;
  helpText?: string;
  options?: QuizOption[];
  autoAdvance?: boolean;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  placeholder?: string;
  validate?: (value: string) => string | null;
}
