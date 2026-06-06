import { ChatGoogle } from "@langchain/google"
import { ChatMistralAI } from "@langchain/mistralai"
import { ChatCohere } from "@langchain/cohere"
import { ChatCerebras } from "@langchain/cerebras"
import { ChatGroq } from "@langchain/groq"
import config from "../config/config.js"


export const geminiModel = new ChatGoogle({
    model: "gemini-flash-latest",
    apiKey: config.GEMINI_API_KEY,

})

export const mistralModel = new ChatMistralAI({
    model: "mistral-small-latest",
    apiKey: config.MISTRAL_API_KEY,
    maxTokens: 2000,
})

export const cohereModel = new ChatCohere({
    model: "command-a-03-2025",
    apiKey: config.COHERE_API_KEY,
})

export const cerebrasModel = new ChatCerebras({
    model: "gpt-oss-120b",
    apiKey: config.CEREBRAS_API_KEY,
})

export const groqModel = new ChatGroq({
    model: "meta-llama/llama-4-scout-17b-16e-instruct",
    apiKey: config.GROQ_API_KEY
})