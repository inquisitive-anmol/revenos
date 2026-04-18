export interface WorkflowNode {
    id: string;
    type: 'prospector' | 'qualifier' | 'booker' | 'human' | 'condition';
    position: { x: number; y: number };
    config: Record<string, any>;
}

export interface WorkflowEdge {
    id: string;
    source: string;
    target: string;
    condition?: 'true' | 'false';
}

export interface Workflow {
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
}

export interface LeadContext {
    leadId: string;
    score: number;
    status: string;
    humanControlled: boolean;
}

export interface NextJob {
    jobName: string;
    nodeId: string;
    delay?: number;
}

export class WorkflowExecutor {
    /**
     * Determines the next job to enqueue based on the current canvas state and lead context.
     * Pure logic, NO db calls!
     */
    static getNextJob(workflow: Workflow, currentNodeId: string | null, leadContext: LeadContext): NextJob | null {
        if (!workflow.nodes || workflow.nodes.length === 0) return null;

        let nodeToProcess: WorkflowNode | undefined;

        // If no currentNodeId, find entry node (node with NO incoming edges)
        if (!currentNodeId) {
            nodeToProcess = workflow.nodes.find(node => 
                !workflow.edges.some(edge => edge.target === node.id)
            );
            if (!nodeToProcess) return null; // malformed workflow
            return this.evaluateNode(workflow, nodeToProcess, leadContext);
        }

        // Processing from an existing node's output
        const outgoingEdges = workflow.edges.filter(e => e.source === currentNodeId);
        
        if (outgoingEdges.length === 0) return null; // Terminal node reached.

        // Is the current node a condition node?
        const currentNode = workflow.nodes.find(n => n.id === currentNodeId);
        if (currentNode?.type === 'condition') {
            const result = this.evaluateCondition(currentNode.config, leadContext);
            const edgeStr = result ? 'true' : 'false';
            
            const selectedEdge = outgoingEdges.find(e => e.condition === edgeStr) || outgoingEdges[0];
            if (!selectedEdge) return null;
            
            nodeToProcess = workflow.nodes.find(n => n.id === selectedEdge.target);
        } else {
            // Standard agent node (prospector, qualifier, booker, human)
            // They only have 1 outgoing edge.
            const selectedEdge = outgoingEdges[0];
            if (!selectedEdge) return null;
            
            nodeToProcess = workflow.nodes.find(n => n.id === selectedEdge.target);
        }

        if (!nodeToProcess) return null;

        // Recursive evaluation in case the next node is ALSO an instant evaluation node (e.g., Condition or Human)
        return this.evaluateNode(workflow, nodeToProcess, leadContext);
    }

    private static evaluateNode(workflow: Workflow, node: WorkflowNode, leadContext: LeadContext): NextJob | null {
        switch (node.type) {
            case 'prospector':
                return { jobName: 'prospector', nodeId: node.id };
            case 'qualifier':
                return { jobName: 'qualifier', nodeId: node.id };
            case 'booker':
                return { jobName: 'book', nodeId: node.id }; // Assuming booker job maps to 'book' queues
            case 'human':
                // Terminal / pause action. Caller must handle side-effects and save `humanControlled = true`.
                return null;
            case 'condition':
                // Evaluate instantly and traverse to the next step
                const result = this.evaluateCondition(node.config, leadContext);
                const edgeStr = result ? 'true' : 'false';
                const outgoingEdges = workflow.edges.filter(e => e.source === node.id);
                const flowEdge = outgoingEdges.find(e => e.condition === edgeStr);
                
                if (!flowEdge) return null;
                const nextNode = workflow.nodes.find(n => n.id === flowEdge.target);
                if (!nextNode) return null;

                return this.evaluateNode(workflow, nextNode, leadContext);
            default:
                return null;
        }
    }

    private static evaluateCondition(config: Record<string, any>, context: LeadContext): boolean {
        const { field, operator, value } = config;
        
        let contextValue: any;
        if (field === 'score') contextValue = context.score;
        else if (field === 'status') contextValue = context.status;
        else return false;

        switch (operator) {
            case 'gte': return Number(contextValue) >= Number(value);
            case 'lte': return Number(contextValue) <= Number(value);
            case 'eq': return contextValue == value;
            case 'neq': return contextValue != value;
            default: return false;
        }
    }
}
