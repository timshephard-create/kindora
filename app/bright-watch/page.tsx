import type { Metadata } from 'next';
import { TOOLS } from '@/config/platform';
import BrightWatchTool from './BrightWatchTool';

const tool = TOOLS.media;

export const metadata: Metadata = {
  title: tool.name,
  description: tool.description,
  openGraph: {
    title: `${tool.name} — Media Quality Navigator`,
    description: tool.description,
  },
};

export default function BrightWatchPage() {
  return <BrightWatchTool />;
}
