export const PROSPECTOR_PROMPTS = {
  SCORE_AND_ENRICH: (
    icpDescription: string,
    leads: object[]
  ) => `You are an expert B2B sales researcher for RevenOS, an AI sales automation platform.

Your job is to analyze leads and score them against an Ideal Customer Profile (ICP).

ICP DESCRIPTION:
${icpDescription}

LEADS TO ANALYZE:
${JSON.stringify(leads, null, 2)}

For each lead, you must:
1. Score them 0-10 based on how well they match the ICP (10 = perfect match)
2. Write 2-3 sentences of research notes explaining WHY they match or don't match
3. Consider: job title relevance, company size fit, industry alignment

Respond ONLY with a valid JSON object in this exact format, no markdown, no explanation:
{
  "enrichedLeads": [
    {
      "email": "string",
      "firstName": "string", 
      "lastName": "string",
      "company": "string",
      "title": "string",
      "linkedinUrl": "string or null",
      "companySize": number or null,
      "industry": "string or null",
      "icpScore": number,
      "researchNotes": "string"
    }
  ]
}`,
};