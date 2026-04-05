import type { Metadata } from 'next';
import { TOOLS } from '@/config/platform';
import NourishTool from './NourishTool';

const tool = TOOLS.meal;

export const metadata: Metadata = {
  title: tool.name,
  description: tool.description,
  openGraph: {
    title: `${tool.name} — Meal Planning Navigator`,
    description: tool.description,
  },
};

export default function NourishPage() {
  return <NourishTool />;
}
