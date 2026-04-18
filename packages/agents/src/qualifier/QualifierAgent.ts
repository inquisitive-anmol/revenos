// import { generateWithRetry } from "ai";
import { getModel, generateWithRetry } from "@revenos/ai-sdk";
import { Agent } from "../base/Agent";
import { AgentContext } from "../base/AgentContext";
import { QUALIFIER_STATES, QualifierState } from "../base/AgentState";
import { QUALIFIER_PROMPTS } from "./qualifier.prompts";
import {
  QualifierInput,
  EmailGenerationOutput,
  EmailGenerationOutputSchema,
  ReplyClassification,
  ReplyClassificationSchema,
} from "./qualifier.schema";
import { sendEmail } from "@revenos/email";

export interface QualifierResult {
  emailSent: boolean;
  messageId: string;
  subject: string;
  body: string;
}

export class QualifierAgent extends Agent {
  protected state: QualifierState;

  constructor(context: AgentContext) {
    super(context, QUALIFIER_STATES.PENDING);
    this.state = QUALIFIER_STATES.PENDING;
  }

  async run(input: QualifierInput): Promise<QualifierResult> {
    try {
      // 1. Compose email
      this.transition(QUALIFIER_STATES.COMPOSING);
      await this.log("qualifier.composing", {
        leadId: input.leadId,
        leadEmail: input.lead.email,
      });

      const emailPrompt = QUALIFIER_PROMPTS.GENERATE_EMAIL(
        input.lead,
        input.playbook
      );

      const { text } = await generateWithRetry({
        model: getModel(),
        prompt: emailPrompt,
      });

      // 2. Parse generated email
      let generatedEmail: EmailGenerationOutput;
      try {
        const clean = text.replace(/```json|```/g, "").trim();
        const raw = JSON.parse(clean);
        generatedEmail = EmailGenerationOutputSchema.parse(raw);
      } catch (parseError) {
        this.transition(QUALIFIER_STATES.PENDING);
        await this.log("qualifier.compose_error", {
          error: String(parseError),
          rawText: text,
        });
        throw new Error(`Failed to parse email generation: ${parseError}`);
      }

      await this.log("qualifier.email_composed", {
        subject: generatedEmail.subject,
        leadId: input.leadId,
      });

      // 3. Send email
      this.transition(QUALIFIER_STATES.EMAIL_SENT);

      const emailResult = await sendEmail({
        leadId: input.leadId,
        to: input.lead.email,
        from: input.emailConfig.fromEmail,
        subject: generatedEmail.subject,
        html: generatedEmail.body,
        replyTo: input.emailConfig.replyTo,
        tags: [
          { name: "leadId", value: input.leadId },
          { name: "campaignId", value: input.campaignId },
          { name: "workspaceId", value: input.workspaceId },
        ],
      });

      await this.log("qualifier.email_sent", {
        leadId: input.leadId,
        messageId: emailResult.messageId,
        subject: generatedEmail.subject,
      });

      // 4. Move to awaiting reply
      this.transition(QUALIFIER_STATES.AWAITING_REPLY);
      await this.log("qualifier.awaiting_reply", {
        leadId: input.leadId,
      });

      return {
        emailSent: true,
        messageId: emailResult.messageId,
        subject: generatedEmail.subject,
        body: generatedEmail.body,
      };
    } catch (error) {
      await this.log("qualifier.error", { error: String(error) });
      throw error;
    }
  }

  async runFollowUp(input: QualifierInput & { followUpNumber: number }): Promise<QualifierResult> {
    try {
      this.transition(QUALIFIER_STATES.COMPOSING);
      await this.log("qualifier.composing_followup", {
        leadId: input.leadId,
        followUpNumber: input.followUpNumber,
      });

      const emailPrompt = QUALIFIER_PROMPTS.GENERATE_FOLLOWUP(
        input.lead,
        input.playbook,
        input.followUpNumber
      );

      const { text } = await generateWithRetry({
        model: getModel(),
        prompt: emailPrompt,
      });

      let generatedEmail: EmailGenerationOutput;
      try {
        const clean = text.replace(/```json|```/g, "").trim();
        const raw = JSON.parse(clean);
        generatedEmail = EmailGenerationOutputSchema.parse(raw);
      } catch (parseError) {
        this.transition(QUALIFIER_STATES.PENDING);
        await this.log("qualifier.compose_followup_error", {
          error: String(parseError),
          rawText: text,
        });
        throw new Error(`Failed to parse follow-up integration: ${parseError}`);
      }

      this.transition(QUALIFIER_STATES.EMAIL_SENT);
      const emailResult = await sendEmail({
        leadId: input.leadId,
        to: input.lead.email,
        from: input.emailConfig.fromEmail,
        subject: generatedEmail.subject,
        html: generatedEmail.body,
        replyTo: input.emailConfig.replyTo,
        tags: [
          { name: "leadId", value: input.leadId },
          { name: "campaignId", value: input.campaignId },
          { name: "workspaceId", value: input.workspaceId },
          { name: "followUp", value: String(input.followUpNumber) },
        ],
      });

      await this.log("qualifier.followup_sent", {
        leadId: input.leadId,
        messageId: emailResult.messageId,
        subject: generatedEmail.subject,
        followUpNumber: input.followUpNumber,
      });

      this.transition(QUALIFIER_STATES.AWAITING_REPLY);

      return {
        emailSent: true,
        messageId: emailResult.messageId,
        subject: generatedEmail.subject,
        body: generatedEmail.body,
      };
    } catch (error) {
      await this.log("qualifier.followup_error", { error: String(error) });
      throw error;
    }
  }

  // Called when a reply webhook fires
  async classifyReply(
    originalEmail: string,
    replyContent: string
  ): Promise<ReplyClassification> {
    this.transition(QUALIFIER_STATES.REPLY_RECEIVED);
    await this.log("qualifier.reply_received", { replyContent });

    const prompt = QUALIFIER_PROMPTS.CLASSIFY_REPLY(
      originalEmail,
      replyContent
    );

    const { text } = await generateWithRetry({
      model: getModel(),
      prompt,
    });

    let classification: ReplyClassification;
    try {
      const clean = text.replace(/```json|```/g, "").trim();
      const raw = JSON.parse(clean);
      classification = ReplyClassificationSchema.parse(raw);
    } catch (parseError) {
      throw new Error(`Failed to parse reply classification: ${parseError}`);
    }

    // Transition based on classification
    if (
      classification.intent === "interested" ||
      classification.suggestedAction === "book_meeting"
    ) {
      this.transition(QUALIFIER_STATES.QUALIFIED);
    } else if (classification.intent === "not_interested") {
      this.transition(QUALIFIER_STATES.DISQUALIFIED);
    } else {
      this.transition(QUALIFIER_STATES.FOLLOW_UP);
    }

    await this.log("qualifier.classified", {
      intent: classification.intent,
      score: classification.score,
      suggestedAction: classification.suggestedAction,
    });

    return classification;
  }
}