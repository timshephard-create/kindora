import type { Metadata } from 'next';
import { TOOLS } from '@/config/platform';
import HealthGuideTool from './HealthGuideTool';

const tool = TOOLS.health;

export const metadata: Metadata = {
  title: tool.name,
  description: tool.description,
  openGraph: {
    title: `${tool.name} — Health Insurance Navigation`,
    description: tool.description,
  },
};

export default function HealthGuidePage() {
  return <HealthGuideTool />;
}
