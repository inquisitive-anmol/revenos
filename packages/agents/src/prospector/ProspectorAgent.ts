import { generateText } from "ai";
import { getModel } from "@revenos/ai-sdk";
import { Agent } from "../base/Agent";
import { AgentContext } from "../base/AgentContext";
import { PROSPECTOR_STATES, ProspectorState } from "../base/AgentState";
import { PROSPECTOR_PROMPTS } from "./prospector.prompts";
import {
  ProspectorInput,
  ProspectorOutput,
  ProspectorOutputSchema,
} from "./prospector.schema";

export class ProspectorAgent extends Agent {
  protected state: ProspectorState;

  constructor(context: AgentContext) {
    super(context, PROSPECTOR_STATES.IDLE);
    this.state = PROSPECTOR_STATES.IDLE;
  }

  async run(input: ProspectorInput): Promise<ProspectorOutput> {
    try {
      // 1. Start searching
      this.transition(PROSPECTOR_STATES.SEARCHING);
      await this.log("prospector.started", {
        campaignId: this.context.campaignId,
        leadCount: input.leads.length,
      });

      // 2. Enrich with AI
      this.transition(PROSPECTOR_STATES.ENRICHING);
      await this.log("prospector.enriching", {
        leadCount: input.leads.length,
      });

      const prompt = PROSPECTOR_PROMPTS.SCORE_AND_ENRICH(
        input.icpDescription,
        input.leads
      );

      const { text } = await generateText({
        model: getModel(),
        prompt,
      });

      // 3. Parse AI response
      let parsed: ProspectorOutput;
      try {
        const clean = text.replace(/```json|```/g, "").trim();
        const raw = JSON.parse(clean);
        parsed = ProspectorOutputSchema.parse(raw);
      } catch (parseError) {
        this.transition(PROSPECTOR_STATES.ERROR);
        await this.log("prospector.parse_error", {
          error: String(parseError),
          rawText: text,
        });
        throw new Error(`Failed to parse AI response: ${parseError}`);
      }

      // 4. Handoff
      this.transition(PROSPECTOR_STATES.HANDOFF);
      await this.log("prospector.handoff", {
        enrichedCount: parsed.enrichedLeads.length,
        avgScore:
          parsed.enrichedLeads.reduce((a, b) => a + b.icpScore, 0) /
          parsed.enrichedLeads.length,
      });

      this.transition(PROSPECTOR_STATES.DONE);
      return parsed;
    } catch (error) {
      this.transition(PROSPECTOR_STATES.ERROR);
      await this.log("prospector.error", { error: String(error) });
      throw error;
    }
  }
}