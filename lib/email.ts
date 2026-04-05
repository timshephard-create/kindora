import { PLATFORM, TOOLS, type ToolId } from '@/config/platform';

const BREVO_API_KEY = process.env.BREVO_API_KEY || '';
const BREVO_FROM_EMAIL = process.env.BREVO_FROM_EMAIL || PLATFORM.email.fromEmail;
const BREVO_FROM_NAME = process.env.BREVO_FROM_NAME || PLATFORM.email.fromName;

const SITE_URL = 'https://famly-five.vercel.app';

export interface EmailResultsData {
  // Sprout
  savingsTotal?: number;
  ccdf?: number;
  fsa?: number;
  ctc?: number;
  income?: string;
  isGapMode?: boolean;
  // HealthGuide
  topPlanName?: string;
  topPlanWhy?: string;
  topWatchOut?: string;
  employerCoverage?: string;
  // BrightWatch
  childAge?: string;
  context?: string;
  recommendations?: Array<{ name: string; platform: string; score: number; why: string }>;
  avoid?: string;
  // Nourish
  weeklyTotal?: string;
  topDinners?: Array<{ name: string; prepTime: string; cost: string }>;
  topSavingsTip?: string;
}

export async function sendWelcomeEmail(
  name: string,
  email: string,
  toolId: string,
  results?: EmailResultsData,
): Promise<boolean> {
  if (!BREVO_API_KEY) {
    console.warn('[Brevo] Missing API key — skipping email');
    return false;
  }

  const tool = TOOLS[toolId as ToolId];
  if (!tool) return false;

  const subject = tool.emailSubject;
  const htmlContent = buildEmailHtml(name, toolId as ToolId, results);

  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'api-key': BREVO_API_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: BREVO_FROM_NAME, email: BREVO_FROM_EMAIL },
        to: [{ email, name }],
        subject,
        htmlContent,
      }),
    });

    console.log('[Brevo] Send response status:', res.status);
    return res.ok;
  } catch (err) {
    console.error('[Brevo] Failed to send email:', err);
    return false;
  }
}

function fmt(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

const INCOME_LABELS: Record<string, string> = {
  under_35k: 'under $35,000',
  '35k_60k': '$35,000\u2013$60,000',
  '60k_90k': '$60,000\u2013$90,000',
  '90k_plus': 'over $90,000',
};

const AGE_LABELS: Record<string, string> = {
  under_12m: 'under 12 months',
  '12_24m': '12\u201324 months',
  '2_3y': '2\u20133 year old',
  '4_5y': '4\u20135 year old',
};

const CONTEXT_LABELS: Record<string, string> = {
  learning: 'learning time',
  wind_down: 'wind-down before bed',
  co_viewing: 'co-viewing with a parent',
  independent: 'independent play',
};

function buildSproutBody(name: string, r: EmailResultsData): string {
  const lines: string[] = [];
  lines.push(`Hi ${name},`);
  lines.push('');

  if (r.savingsTotal && r.savingsTotal > 0) {
    lines.push(`Great news: you may qualify for up to <strong>${fmt(r.savingsTotal)}/year</strong> in childcare savings. Here\u2019s the breakdown:`);
    lines.push('');
    if (r.ccdf && r.ccdf > 0) lines.push(`&bull; <strong>CCDF Subsidy:</strong> ${fmt(r.ccdf)}/year &mdash; federal childcare assistance`);
    if (r.fsa && r.fsa > 0) lines.push(`&bull; <strong>FSA Savings:</strong> ${fmt(r.fsa)}/year &mdash; pre-tax dependent care`);
    if (r.ctc && r.ctc > 0) lines.push(`&bull; <strong>Child Tax Credit:</strong> ${fmt(r.ctc)}/year &mdash; annual tax credit`);
    lines.push('');
  }

  if (r.isGapMode) {
    lines.push('Based on your needs, we recommend looking into <strong>backup care programs</strong> and <strong>flexible drop-in centers</strong> near you. Bright Horizons and Care.com are good starting points for gap coverage.');
  } else {
    const incomeLabel = INCOME_LABELS[r.income || ''] || 'your income level';
    lines.push(`For a household earning ${incomeLabel}, licensed childcare centers and preschool programs near your ZIP are your best bet. ${r.income === 'under_35k' || r.income === '35k_60k' ? 'Don\u2019t forget to check Head Start \u2014 it\u2019s free and federally funded.' : 'An FSA through your employer is one of the easiest wins.'}`);
  }

  lines.push('');
  lines.push(`<strong>Your next step:</strong> <a href="${SITE_URL}/sprout" style="color: #5C7A5A;">Revisit your full results</a> to see providers near you and start applying for savings programs.`);
  return lines.join('<br/>');
}

function buildHealthBody(name: string, r: EmailResultsData): string {
  const lines: string[] = [];
  lines.push(`Hi ${name},`);
  lines.push('');

  if (r.topPlanName) {
    lines.push(`Our top recommendation for you: <strong>${r.topPlanName}</strong>.`);
    if (r.topPlanWhy) lines.push(r.topPlanWhy);
    lines.push('');
  }

  if (r.topWatchOut) {
    lines.push(`<strong>One thing to watch:</strong> ${r.topWatchOut}`);
    lines.push('');
  }

  const isMarketplace = r.employerCoverage === 'none' || r.employerCoverage === 'poor';
  const isMedicaid = r.employerCoverage === 'medicaid';

  if (isMedicaid) {
    lines.push(`<strong>Your next step:</strong> <a href="https://www.medicaid.gov/about-us/beneficiary-resources/index.html" style="color: #2D6280;">Check your Medicaid eligibility</a> and make sure your enrollment is current.`);
  } else if (isMarketplace) {
    lines.push(`<strong>Your next step:</strong> <a href="https://www.healthcare.gov" style="color: #2D6280;">Browse plans on Healthcare.gov</a> to see your actual premiums and subsidy amount.`);
  } else {
    lines.push(`<strong>Your next step:</strong> Review your employer\u2019s open enrollment options and compare plan tiers. <a href="${SITE_URL}/health-guide" style="color: #2D6280;">Revisit your full breakdown</a> for details.`);
  }

  return lines.join('<br/>');
}

function buildBrightWatchBody(name: string, r: EmailResultsData): string {
  const lines: string[] = [];
  const ageLabel = AGE_LABELS[r.childAge || ''] || 'your child';
  const contextLabel = CONTEXT_LABELS[r.context || ''] || 'screen time';

  lines.push(`Hi ${name},`);
  lines.push('');
  lines.push(`For your ${ageLabel} during ${contextLabel}, here are our top picks:`);
  lines.push('');

  if (r.recommendations) {
    for (const rec of r.recommendations.slice(0, 3)) {
      lines.push(`&bull; <strong>${rec.name}</strong> (${rec.platform}, score: ${rec.score}/100) &mdash; ${rec.why}`);
    }
    lines.push('');
  }

  if (r.avoid) {
    lines.push(`<strong>What to avoid:</strong> ${r.avoid}`);
    lines.push('');
  }

  lines.push(`<a href="${SITE_URL}/bright-watch" style="color: #C9A84C;">See your full recommendations</a> anytime.`);
  return lines.join('<br/>');
}

function buildNourishBody(name: string, r: EmailResultsData): string {
  const lines: string[] = [];
  lines.push(`Hi ${name},`);
  lines.push('');

  if (r.weeklyTotal) {
    lines.push(`Your personalized meal plan comes in at <strong>${r.weeklyTotal}/week</strong>. Here are three dinners to look forward to:`);
    lines.push('');
  }

  if (r.topDinners) {
    for (const d of r.topDinners.slice(0, 3)) {
      lines.push(`&bull; <strong>${d.name}</strong> (${d.prepTime}, ${d.cost}/serving)`);
    }
    lines.push('');
  }

  if (r.topSavingsTip) {
    lines.push(`<strong>Biggest savings tip:</strong> ${r.topSavingsTip}`);
    lines.push('');
  }

  lines.push(`<a href="${SITE_URL}/nourish" style="color: #C4622D;">See your full meal plan and shopping list</a>.`);
  return lines.join('<br/>');
}

function buildGenericBody(name: string, tool: typeof TOOLS[ToolId]): string {
  return `Hi ${name},<br/><br/>Thanks for using <strong>${tool.name}</strong> on ${PLATFORM.name}. Your personalized results are ready &mdash; you can revisit them anytime at <a href="${SITE_URL}${tool.route}" style="color: #5C7A5A;">${PLATFORM.name}</a>.`;
}

function buildEmailHtml(name: string, toolId: ToolId, results?: EmailResultsData): string {
  const tool = TOOLS[toolId];
  let body: string;

  if (results) {
    switch (toolId) {
      case 'childcare': body = buildSproutBody(name, results); break;
      case 'health': body = buildHealthBody(name, results); break;
      case 'media': body = buildBrightWatchBody(name, results); break;
      case 'meal': body = buildNourishBody(name, results); break;
      default: body = buildGenericBody(name, tool);
    }
  } else {
    body = buildGenericBody(name, tool);
  }

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="font-family: 'DM Sans', Arial, sans-serif; color: #2C2C2C; max-width: 560px; margin: 0 auto; padding: 24px; background-color: #FAF6F0;">
  <div style="padding: 32px 24px; background: #FFFDF9; border-radius: 16px;">
    <p style="font-size: 16px; line-height: 1.7;">${body}</p>
    <p style="font-size: 16px; line-height: 1.6; margin-top: 24px;">
      We built ${PLATFORM.name} because navigating family systems shouldn&rsquo;t require a PhD. If this helped even a little, we&rsquo;re glad.
    </p>
    <p style="font-size: 14px; color: #6B6B6B; margin-top: 32px;">
      Warmly,<br />
      ${PLATFORM.email.fromName}
    </p>
  </div>
  <p style="font-size: 12px; color: #6B6B6B; text-align: center; margin-top: 24px;">
    ${PLATFORM.name} &middot; ${PLATFORM.domain}
  </p>
</body>
</html>`.trim();
}
