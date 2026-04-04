import type { Metadata } from 'next';
import { TOOLS } from '@/config/platform';
import SproutTool from './SproutTool';

const tool = TOOLS.childcare;

export const metadata: Metadata = {
  title: tool.name,
  description: tool.description,
  openGraph: {
    title: `${tool.name} — Childcare Navigation`,
    description: tool.description,
  },
};

export default function SproutPage() {
  return <SproutTool />;
}
