import { AgentContext } from "./AgentContext";

export abstract class Agent {
  protected context: AgentContext;
  protected state: string;

  constructor(context: AgentContext, initialState: string) {
    this.context = context;
    this.state = initialState;
  }

  // Every agent must implement this
  abstract run(input: unknown): Promise<unknown>;

  // State transition with logging
  protected transition(newState: string): void {
    console.log(
      `[${this.constructor.name}] ${this.state} → ${newState} | workspace: ${this.context.workspaceId}`
    );
    this.state = newState;
  }

  // Log agent decision to DB
  protected async log(
    event: string,
    data: Record<string, unknown>
  ): Promise<void> {
    console.log(`[${this.constructor.name}] EVENT: ${event}`, data);
    // AgentLog DB write will be wired here in Sub-phase 2.3
  }

  getState(): string {
    return this.state;
  }

  getContext(): AgentContext {
    return this.context;
  }
}