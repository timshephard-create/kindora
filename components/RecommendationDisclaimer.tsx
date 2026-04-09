const DISCLAIMERS: Record<string, string> = {
  health:
    'This analysis is for educational purposes only and is based on your estimates. Verify all plan details with your insurer or at Healthcare.gov. This is not medical or financial advice.',
  sprout:
    'Provider information sourced from Google Places. Subsidy estimates are based on federal CCDF guidelines and may vary by state. Verify eligibility with your local childcare agency.',
  brightwatch:
    'Content scores are AI-generated and supplementary. Always verify ratings at commonsensemedia.org. Individual children may respond differently to media content.',
  nourish:
    'Meal suggestions are for general guidance only. Consult a registered dietitian for medical nutrition needs. Always verify ingredients against your family\'s specific allergies.',
};

export default function RecommendationDisclaimer({ tool }: { tool: string }) {
  const text = DISCLAIMERS[tool] || DISCLAIMERS.health;

  return (
    <div className="mt-10 border-t border-border pt-6">
      <p className="text-xs leading-relaxed text-mid">
        {text} &copy; 2025 Creative Mind Ventures LLC
      </p>
    </div>
  );
}
