export const PLATFORM = {
  name: 'Famly',
  tagline: 'The systems are broken. We help you navigate them.',
  description:
    'Three tools to help your family find care, understand your health options, and protect your kids\u2019 screen time.',
  domain: 'famly.app',
  url: 'https://famly.app',
  email: {
    fromName: 'The Famly Team',
    fromEmail: 'hello@famly.app',
  },
} as const;

export type ToolId = 'childcare' | 'health' | 'media';

export interface ToolConfig {
  id: ToolId;
  name: string;
  description: string;
  route: string;
  color: string;
  icon: string;
  badge: string;
  emailSubject: string;
  emailCta: string;
  premiumLabel: string;
}

export const TOOLS: Record<ToolId, ToolConfig> = {
  childcare: {
    id: 'childcare',
    name: 'Sprout',
    description:
      'Find childcare you can actually afford. Real providers near you, real savings programs you qualify for, one clear plan.',
    route: '/sprout',
    color: 'sage',
    icon: '\uD83C\uDF31',
    badge: 'Childcare',
    emailSubject: `Your ${PLATFORM.name} childcare plan is ready`,
    emailCta: 'Send me my results + savings plan',
    premiumLabel: 'savings report',
  },
  health: {
    id: 'health',
    name: 'HealthGuide',
    description:
      'Health insurance decoded. Answer a few questions, get a clear recommendation \u2014 no jargon, no sales pitch.',
    route: '/health-guide',
    color: 'sky',
    icon: '\uD83E\uDE7A',
    badge: 'Health Insurance',
    emailSubject: `Your ${PLATFORM.name} health plan breakdown`,
    emailCta: 'Send me my plan breakdown',
    premiumLabel: 'plan comparison',
  },
  media: {
    id: 'media',
    name: 'BrightWatch',
    description:
      "Screen time that supports your child\u2019s brain. Get age-specific picks backed by child development research.",
    route: '/bright-watch',
    color: 'gold',
    icon: '\uD83D\uDCFA',
    badge: 'Media Quality',
    emailSubject: `Your ${PLATFORM.name} media recommendations`,
    emailCta: 'Send my recommendations',
    premiumLabel: 'content library',
  },
} as const;

export const TOOL_LIST = Object.values(TOOLS);

export function getToolByRoute(pathname: string): ToolConfig | undefined {
  return TOOL_LIST.find((tool) => pathname.startsWith(tool.route));
}

export function getToolById(id: ToolId): ToolConfig {
  return TOOLS[id];
}
