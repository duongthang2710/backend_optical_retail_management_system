const chatbotConfig = require("../config/chatbotConfig");
const { postJson } = require("./chatbotHttpClient");
const { isNumberArray } = require("./ragChunkUtils");

const findEmbedding = (response) => {
    if (isNumberArray(response)) {
        return response.map(Number);
    }

    if (!response || typeof response !== "object") {
        return null;
    }

    if (isNumberArray(response.embedding)) {
        return response.embedding.map(Number);
    }

    if (isNumberArray(response.vector)) {
        return response.vector.map(Number);
    }

    if (Array.isArray(response.vectors) && isNumberArray(response.vectors[0])) {
        return response.vectors[0].map(Number);
    }

    if (isNumberArray(response.embeddings)) {
        return response.embeddings.map(Number);
    }

    if (Array.isArray(response.embeddings) && isNumberArray(response.embeddings[0])) {
        return response.embeddings[0].map(Number);
    }

    if (isNumberArray(response.data?.embedding)) {
        return response.data.embedding.map(Number);
    }

    if (
        Array.isArray(response.data) &&
        response.data[0] &&
        isNumberArray(response.data[0].embedding)
    ) {
        return response.data[0].embedding.map(Number);
    }

    return null;
};

class EmbeddingService {
    async createEmbedding(text) {
        const normalizedText = String(text || "").trim();
        if (!normalizedText) {
            throw new Error("Embedding text is required");
        }

        if (!chatbotConfig.embedding.apiUrl) {
            throw new Error("EMBEDDING_API_URL is required");
        }

        const response = await postJson(
            chatbotConfig.embedding.apiUrl,
            {
                text: normalizedText,
                texts: [normalizedText],
                max_length: 1024,
            },
            { timeoutMs: chatbotConfig.embedding.timeoutMs },
        );
        const embedding = findEmbedding(response);

        if (!embedding) {
            throw new Error("Embedding API response does not contain a vector");
        }

        return embedding;
    }
}

module.exports = new EmbeddingService();
