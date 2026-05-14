const chatbotConfig = require("../config/chatbotConfig");
const { postJson } = require("./chatbotHttpClient");
const { formatChunkForContext } = require("./ragChunkUtils");
const rerankService = require("./rerankService");
const retrievalService = require("./retrievalService");

const NO_INFO_ANSWER = "Hiện tôi chưa có đủ thông tin trong hệ thống.";

const normalizeMessage = (message) => String(message || "").trim();

class ChatbotService {
    async chat(message) {
        const question = normalizeMessage(message);
        if (!question) {
            const error = new Error("message is required");
            error.status = 400;
            throw error;
        }

        const candidateLimit = chatbotConfig.rerank.useRerank
            ? Math.max(chatbotConfig.rag.topK * 3, chatbotConfig.rag.topK)
            : chatbotConfig.rag.topK;
        const candidates = await retrievalService.search(question, {
            topK: candidateLimit,
            minScore: chatbotConfig.rag.minScore,
        });

        if (candidates.length === 0) {
            return {
                answer: NO_INFO_ANSWER,
                sources: [],
            };
        }

        const topChunks = await rerankService.rerank(question, candidates, {
            topK: chatbotConfig.rag.topK,
        });

        if (topChunks.length === 0) {
            return {
                answer: NO_INFO_ANSWER,
                sources: [],
            };
        }

        const answer = await this.generateAnswer(question, topChunks);
        const normalizedAnswer = answer || NO_INFO_ANSWER;

        return {
            answer: normalizedAnswer,
            sources:
                normalizedAnswer === NO_INFO_ANSWER
                    ? []
                    : this.toSources(topChunks),
        };
    }

    async generateAnswer(question, chunks) {
        if (!chatbotConfig.deepseek.apiKey) {
            const error = new Error("Missing DEEPSEEK_API_KEY");
            error.status = 500;
            throw error;
        }

        const context = chunks
            .map((chunk, index) => formatChunkForContext(chunk, index))
            .join("\n\n---\n\n");
        const userPrompt = `CONTEXT:\n${context}\n\nCâu hỏi của khách hàng:\n${question}`;

        try {
            const response = await postJson(
                `${chatbotConfig.deepseek.baseUrl}/chat/completions`,
                {
                    model: chatbotConfig.deepseek.model,
                    messages: [
                        {
                            role: "system",
                            content: chatbotConfig.systemPrompt,
                        },
                        {
                            role: "user",
                            content: userPrompt,
                        },
                    ],
                    temperature: 0.2,
                    max_tokens: 700,
                },
                {
                    headers: {
                        Authorization: `Bearer ${chatbotConfig.deepseek.apiKey}`,
                    },
                    timeoutMs: chatbotConfig.deepseek.timeoutMs,
                },
            );

            return String(
                response?.choices?.[0]?.message?.content || "",
            ).trim();
        } catch (error) {
            console.error(`[chatbot] deepseek failed: ${error.message}`);
            const publicError = new Error("Cannot generate chatbot answer");
            publicError.status = 502;
            throw publicError;
        }
    }

    toSources(chunks) {
        return chunks.map((chunk) => ({
            id: chunk.id,
            text: chunk.text,
            score: chunk.score,
            metadata: chunk.metadata || {},
        }));
    }
}

module.exports = new ChatbotService();
module.exports.NO_INFO_ANSWER = NO_INFO_ANSWER;
