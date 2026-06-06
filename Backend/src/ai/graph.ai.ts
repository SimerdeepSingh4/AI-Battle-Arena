import { StateGraph, StateSchema, type GraphNode, START, END } from "@langchain/langgraph"
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import z from "zod"
import { zodToJsonSchema } from "zod-to-json-schema";
import { mistralModel, cohereModel, geminiModel, cerebrasModel, groqModel } from "./models.ai.js"

const MODELS = {
    mistral: mistralModel,
    cohere: cohereModel,
    gemini: geminiModel,
    cerebras: cerebrasModel,
    groq: groqModel
};

const scoreDetailsSchema = z.object({
    correctness: z.number().default(0),
    relevance: z.number().default(0),
    completeness: z.number().default(0),
    clarity: z.number().default(0),
    helpfulness: z.number().default(0),
    final_score: z.number().default(0),
    strengths: z.array(z.string()).default([]),
    weaknesses: z.array(z.string()).default([]),
    justification: z.string().default("")
});

const judgeResultSchema = z.object({
    solution_1_score: scoreDetailsSchema,
    solution_2_score: scoreDetailsSchema,
    winner: z.enum(["A", "B", "Tie"]).default("Tie"),
    winner_reason: z.string().default("")
});

const state = new StateSchema({
    problem: z.string().default(""),
    modelA: z.string().default("mistral"),
    modelB: z.string().default("cohere"),
    judgeModel: z.string().default("gemini"),
    solution_1: z.string().default(""),
    solution_2: z.string().default(""),
    judge: judgeResultSchema
})

const solutionNode: GraphNode<typeof state> = async (state) => {
    const modelAKey = state.modelA || 'mistral';
    const modelBKey = state.modelB || 'cohere';

    const modelA = MODELS[modelAKey as keyof typeof MODELS] || mistralModel;
    const modelB = MODELS[modelBKey as keyof typeof MODELS] || cohereModel;

    const [responseA, responseB] = await Promise.all([
        modelA.invoke(state.problem),
        modelB.invoke(state.problem)
    ])

    return {
        solution_1: responseA.text,
        solution_2: responseB.text
    }
}

const judgeNode: GraphNode<typeof state> = async (state) => {
    const { problem, solution_1, solution_2, judgeModel: judgeModelKey } = state;
    
    const judgeInstance = MODELS[judgeModelKey as keyof typeof MODELS] || geminiModel;

    // ── Position Debiasing ────────────────────────────────────────────────────
    // Randomly swap which solution appears as "A" vs "B" in the prompt.
    // This eliminates systematic positional bias (Llama/Cerebras tend to favor
    // the last solution they read). After evaluation we remap scores back.
    const swapped = Math.random() < 0.5;
    const promptA = swapped ? solution_2 : solution_1;
    const promptB = swapped ? solution_1 : solution_2;
    console.log(`[${judgeModelKey}] Position debiasing: solutions presented as ${swapped ? 'SWAPPED (sol2=A, sol1=B)' : 'NORMAL (sol1=A, sol2=B)'}`);
    // ─────────────────────────────────────────────────────────────────────────

    const schema = z.object({
        solution_1_score: z.object({
            correctness: z.number().min(0).max(10),
            relevance: z.number().min(0).max(10),
            completeness: z.number().min(0).max(10),
            clarity: z.number().min(0).max(10),
            helpfulness: z.number().min(0).max(10),
            final_score: z.number().min(0).max(10),
            strengths: z.array(z.string()),
            weaknesses: z.array(z.string()),
            justification: z.string(),
        }),
        solution_2_score: z.object({
            correctness: z.number().min(0).max(10),
            relevance: z.number().min(0).max(10),
            completeness: z.number().min(0).max(10),
            clarity: z.number().min(0).max(10),
            helpfulness: z.number().min(0).max(10),
            final_score: z.number().min(0).max(10),
            strengths: z.array(z.string()),
            weaknesses: z.array(z.string()),
            justification: z.string(),
        }),
        winner: z.enum(["A", "B", "Tie"]),
        winner_reason: z.string(),
    });

    const systemPrompt = ` You are an impartial AI Judge responsible for evaluating two candidate solutions to the same problem. # Problem ${problem} # Solution A ${promptA} # Solution B ${promptB} # Evaluation Criteria Evaluate each solution independently using the following criteria. ## 1. Correctness (0-10) - Does the solution provide factually accurate information? - Does it avoid mistakes, hallucinations, or incorrect reasoning? ## 2. Relevance (0-10) - Does the solution directly answer the user's question? - Does it stay focused on the requested task? ## 3. Completeness (0-10) - Does it fully address all aspects of the problem? - Are important details missing? IMPORTANT: - Completeness should only measure whether the user's requested task was fully satisfied. - Do NOT increase completeness merely because a response includes extra explanations, notes, warnings, alternatives, or additional implementations that were not requested. - A concise answer that fully solves the task should receive the same completeness score as a longer answer. ## 4. Clarity & Structure (0-10) - Is the response easy to understand? - Is it logically organized? ## 5. Helpfulness (0-10) - Would this response genuinely help the user solve their problem? - Does it provide useful explanations, examples, or actionable guidance when appropriate? # Scoring Instructions - Evaluate both solutions independently. - Be objective and evidence-based. - Do not favor a solution simply because it is longer. - Do not penalize brevity if the answer is complete and correct. - Focus on quality, accuracy, and usefulness. - Identify both strengths and weaknesses. - If both solutions are poor, score both poorly. - If both solutions are excellent, score both highly. # CRITICAL — Anti-Position-Bias Rule You MUST NOT favor a solution simply because it appears first or second in the prompt. Evaluate purely on content quality. Studies show LLMs tend to favor the last solution they read. Actively counteract this tendency by reading both solutions with equal attention before scoring. # Anti-Verbosity Rule IMPORTANT: A response MUST NOT receive a higher score merely because it is longer. A concise response that fully and correctly solves the problem may score higher than a longer response. Additional examples, explanations, alternative implementations, or extra context should only improve the score if they provide meaningful value to the user. # Hallucination & Error Penalty IMPORTANT: If a response contains: - Factually incorrect statements - Incorrect code - Fabricated facts - Misleading claims - Unsupported assertions - Logical errors Deduct 2–5 points from the final score depending on severity. # Anti-Hallucination Rule for Weaknesses CRITICAL: When listing weaknesses, you MUST only cite flaws that you can directly and unambiguously verify by reading the exact text of the solution. - Do NOT invent code errors that are not present in the solution text. - Do NOT claim a typo exists unless you can quote the exact incorrect character sequence from the solution. - Do NOT claim missing syntax unless you can identify the specific location where it is absent. - If you are uncertain whether something is actually wrong, do NOT list it as a weakness. - It is better to list zero weaknesses than to fabricate a weakness that does not exist. - Hallucinating a weakness that does not exist is itself a critical evaluation error. # User Intent Rule IMPORTANT: Judge responses based on how well they satisfy the user's actual request. Do NOT assume the user wants production-grade, highly optimized, enterprise-level, or exhaustive solutions unless explicitly requested. A simple, correct solution should not receive a lower score merely because another response includes more advanced or unnecessary features. # Tie Rules If both solutions are similarly good and the quality difference is negligible, declare: "winner": "Tie" Do not force a winner when the difference is insignificant. # Scoring Formula Final Score = (Correctness × 0.35) + (Relevance × 0.20) + (Completeness × 0.20) + (Clarity × 0.10) + (Helpfulness × 0.15) Round final_score to one decimal place. # Output Requirements - Explain every deduction. - Justify all scores. - Compare solutions fairly. - Use only valid JSON. - Do not include markdown. - Do not include code fences. - Return JSON only. Expected schema: { "solution_1_score": { "correctness": 0, "relevance": 0, "completeness": 0, "clarity": 0, "helpfulness": 0, "final_score": 0, "strengths": [], "weaknesses": [], "justification": "" }, "solution_2_score": { "correctness": 0, "relevance": 0, "completeness": 0, "clarity": 0, "helpfulness": 0, "final_score": 0, "strengths": [], "weaknesses": [], "justification": "" }, "winner": "A", "winner_reason": "" } `;

    const messages = [
        new SystemMessage(systemPrompt),
        new HumanMessage(`
            Problem: ${problem}
            Solution A: ${promptA}
            Solution B: ${promptB}
            Please evaluate the solutions and provide scores and reasoning.
        `)
    ];

    let judgeResponse: any;
    try {
        // Try native structured output
        const structuredModel = (judgeInstance as any).withStructuredOutput(schema as any);
        judgeResponse = await structuredModel.invoke(messages);
    } catch (err: any) {
        console.log(`[${judgeModelKey}] Native structured output failed: ${err.message}. Using JSON fallback...`);
        
        // JSON fallback strategy
        const jsonSchema = zodToJsonSchema(schema as any);
        const messagesCopy = [...messages];
        const jsonInstruction = `\n\nIMPORTANT: You MUST return your response ONLY as a valid JSON object matching the schema below. Do NOT include any explanations, markdown code blocks, or additional text outside the JSON object.\nSchema:\n${JSON.stringify(jsonSchema, null, 2)}`;
        
        // Append jsonInstruction to system message
        messagesCopy[0] = new SystemMessage(systemPrompt + jsonInstruction);
 
        let responseModel = judgeInstance;
        try {
            responseModel = (judgeInstance as any).bind({ response_format: { type: "json_object" } });
        } catch {
            // ignore
        }
 
        const response = await responseModel.invoke(messagesCopy);
        const text = typeof response.content === "string" ? response.content : JSON.stringify(response.content);
        
        try {
            const cleaned = text.replace(/```json\s*|```\s*/g, "").trim();
            const parsed = JSON.parse(cleaned);
            judgeResponse = (schema as any).parse(parsed);
        } catch (parseErr: any) {
            throw new Error(`Failed to parse JSON response: ${text}. Error: ${parseErr.message}`);
        }
    }

    // ── Remap scores back to correct models after position debiasing ──────────
    // judgeResponse.solution_1_score corresponds to promptA (which may be swapped)
    // judgeResponse.solution_2_score corresponds to promptB
    // We need to map them back so solution_1_score always = original solution_1
    let solution_1_score, solution_2_score, winner, winner_reason;

    if (swapped) {
        // Judge saw: A=solution_2, B=solution_1
        // Judge's "solution_1_score" is actually solution_2's score
        // Judge's "solution_2_score" is actually solution_1's score
        solution_1_score = judgeResponse.solution_2_score; // judge's B = our solution_1
        solution_2_score = judgeResponse.solution_1_score; // judge's A = our solution_2
        winner_reason = judgeResponse.winner_reason;
        // Flip the winner label back
        if (judgeResponse.winner === "A") {
            winner = "B"; // Judge's A was our solution_2, so our solution_2 wins → "B"
        } else if (judgeResponse.winner === "B") {
            winner = "A"; // Judge's B was our solution_1, so our solution_1 wins → "A"
        } else {
            winner = "Tie";
        }
        console.log(`[${judgeModelKey}] Remapping swapped result: judge picked '${judgeResponse.winner}' → actual winner '${winner}'`);
    } else {
        // No swap — use directly
        solution_1_score = judgeResponse.solution_1_score;
        solution_2_score = judgeResponse.solution_2_score;
        winner = judgeResponse.winner;
        winner_reason = judgeResponse.winner_reason;
    }
    // ─────────────────────────────────────────────────────────────────────────

    return {
        judge: {
            solution_1_score,
            solution_2_score,
            winner,
            winner_reason
        }
    }
}

    const systemPrompt = ` You are an impartial AI Judge responsible for evaluating two candidate solutions to the same problem. # Problem ${problem} # Solution A ${solution_1} # Solution B ${solution_2} # Evaluation Criteria Evaluate each solution independently using the following criteria. ## 1. Correctness (0-10) - Does the solution provide factually accurate information? - Does it avoid mistakes, hallucinations, or incorrect reasoning? ## 2. Relevance (0-10) - Does the solution directly answer the user's question? - Does it stay focused on the requested task? ## 3. Completeness (0-10) - Does it fully address all aspects of the problem? - Are important details missing? IMPORTANT: - Completeness should only measure whether the user's requested task was fully satisfied. - Do NOT increase completeness merely because a response includes extra explanations, notes, warnings, alternatives, or additional implementations that were not requested. - A concise answer that fully solves the task should receive the same completeness score as a longer answer. ## 4. Clarity & Structure (0-10) - Is the response easy to understand? - Is it logically organized? ## 5. Helpfulness (0-10) - Would this response genuinely help the user solve their problem? - Does it provide useful explanations, examples, or actionable guidance when appropriate? # Scoring Instructions - Evaluate both solutions independently. - Be objective and evidence-based. - Do not favor a solution simply because it is longer. - Do not penalize brevity if the answer is complete and correct. - Focus on quality, accuracy, and usefulness. - Identify both strengths and weaknesses. - If both solutions are poor, score both poorly. - If both solutions are excellent, score both highly. # Anti-Verbosity Rule IMPORTANT: A response MUST NOT receive a higher score merely because it is longer. A concise response that fully and correctly solves the problem may score higher than a longer response. Additional examples, explanations, alternative implementations, or extra context should only improve the score if they provide meaningful value to the user. # Hallucination & Error Penalty IMPORTANT: If a response contains: - Factually incorrect statements - Incorrect code - Fabricated facts - Misleading claims - Unsupported assertions - Logical errors Deduct 2–5 points from the final score depending on severity. # Anti-Hallucination Rule for Weaknesses CRITICAL: When listing weaknesses, you MUST only cite flaws that you can directly and unambiguously verify by reading the exact text of the solution. - Do NOT invent code errors that are not present in the solution text. - Do NOT claim a typo exists unless you can quote the exact incorrect character sequence from the solution. - Do NOT claim missing syntax unless you can identify the specific location where it is absent. - If you are uncertain whether something is actually wrong, do NOT list it as a weakness. - It is better to list zero weaknesses than to fabricate a weakness that does not exist. - Hallucinating a weakness that does not exist is itself a critical evaluation error. # User Intent Rule IMPORTANT: Judge responses based on how well they satisfy the user's actual request. Do NOT assume the user wants production-grade, highly optimized, enterprise-level, or exhaustive solutions unless explicitly requested. Additional features, optimizations, alternative implementations, or advanced techniques should only increase the score if they are directly relevant to the user's stated needs. A simple, correct solution should not receive a lower score merely because another response includes more advanced or unnecessary features. # Tie Rules If both solutions are similarly good and the quality difference is negligible, declare: "winner": "Tie" Do not force a winner when the difference is insignificant. # Scoring Formula Final Score = (Correctness × 0.35) + (Relevance × 0.20) + (Completeness × 0.20) + (Clarity × 0.10) + (Helpfulness × 0.15) Round final_score to one decimal place. # Output Requirements - Explain every deduction. - Justify all scores. - Compare solutions fairly. - Use only valid JSON. - Do not include markdown. - Do not include code fences. - Return JSON only. Expected schema: { "solution_1_score": { "correctness": 0, "relevance": 0, "completeness": 0, "clarity": 0, "helpfulness": 0, "final_score": 0, "strengths": [], "weaknesses": [], "justification": "" }, "solution_2_score": { "correctness": 0, "relevance": 0, "completeness": 0, "clarity": 0, "helpfulness": 0, "final_score": 0, "strengths": [], "weaknesses": [], "justification": "" }, "winner": "A", "winner_reason": "" } `;

    const messages = [
        new SystemMessage(systemPrompt),
        new HumanMessage(`
            Problem: ${problem}
            Solution A: ${solution_1}
            Solution B: ${solution_2}
            Please evaluate the solutions and provide scores and reasoning.
        `)
    ];

    let judgeResponse: any;
    try {
        // Try native structured output
        const structuredModel = (judgeInstance as any).withStructuredOutput(schema as any);
        judgeResponse = await structuredModel.invoke(messages);
    } catch (err: any) {
        console.log(`[${judgeModelKey}] Native structured output failed: ${err.message}. Using JSON fallback...`);
        
        // JSON fallback strategy
        const jsonSchema = zodToJsonSchema(schema as any);
        const messagesCopy = [...messages];
        const jsonInstruction = `\n\nIMPORTANT: You MUST return your response ONLY as a valid JSON object matching the schema below. Do NOT include any explanations, markdown code blocks, or additional text outside the JSON object.\nSchema:\n${JSON.stringify(jsonSchema, null, 2)}`;
        
        // Append jsonInstruction to system message
        messagesCopy[0] = new SystemMessage(systemPrompt + jsonInstruction);
 
        let responseModel = judgeInstance;
        try {
            responseModel = (judgeInstance as any).bind({ response_format: { type: "json_object" } });
        } catch {
            // ignore
        }
 
        const response = await responseModel.invoke(messagesCopy);
        const text = typeof response.content === "string" ? response.content : JSON.stringify(response.content);
        
        try {
            const cleaned = text.replace(/```json\s*|```\s*/g, "").trim();
            const parsed = JSON.parse(cleaned);
            judgeResponse = (schema as any).parse(parsed);
        } catch (parseErr: any) {
            throw new Error(`Failed to parse JSON response: ${text}. Error: ${parseErr.message}`);
        }
    }

    const {
        solution_1_score,
        solution_2_score,
        winner,
        winner_reason
    } = judgeResponse;

    return {
        judge: {
            solution_1_score,
            solution_2_score,
            winner,
            winner_reason
        }
    }
}

const graph = new StateGraph(state)
    .addNode("solution", solutionNode)
    .addNode("judge_node", judgeNode)
    .addEdge(START, "solution")
    .addEdge("solution", "judge_node")
    .addEdge("judge_node", END)
    .compile();

export default async function runGraph(problem: string, modelA = 'mistral', modelB = 'cohere', judgeModel = 'gemini') {
    const result = await graph.invoke({
        problem: problem,
        modelA: modelA,
        modelB: modelB,
        judgeModel: judgeModel
    });
    return result;
}