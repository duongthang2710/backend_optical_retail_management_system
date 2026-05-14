const chatbotConfig = require("../config/chatbotConfig");
const { postJson } = require("./chatbotHttpClient");

const toScore = (value) => {
    const score = Number(value);
    return Number.isFinite(score) ? score : null;
};

const readScore = (item) => {
    if (typeof item === "number") {
        return item;
    }

    if (!item || typeof item !== "object") {
        return null;
    }

    return toScore(
        item.score ??
        item.relevance_score ??
        item.relevanceScore ??
        item.rerank_score ??
        item.rerankScore,
    );
};

const parseScores = (response, totalDocuments) => {
    const directScoreList =
        response?.scores ||
        response?.rerank_scores ||
        response?.rerankScores;

    if (Array.isArray(directScoreList)) {
        const scores = directScoreList.map(toScore);
        return scores.every((score) => score !== null) ? scores : null;
    }

    const resultList = Array.isArray(response)
        ? response
        : response?.results || response?.data;

    if (!Array.isArray(resultList)) {
        return null;
    }

    const scores = new Array(totalDocuments).fill(null);
    resultList.forEach((item, fallbackIndex) => {
        const index = Number.isInteger(item?.index)
            ? item.index
            : Number.isInteger(item?.document_index)
                ? item.document_index
                : fallbackIndex;
        const score = readScore(item);

        if (index >= 0 && index < totalDocuments && score !== null) {
            scores[index] = score;
        }
    });

    return scores.some((score) => score !== null) ? scores : null;
};

class RerankService {
    async rerank(query, chunks, options = {}) {
        const topK = options.topK || chatbotConfig.rag.topK;

        if (
            !chatbotConfig.rerank.useRerank ||
            !chatbotConfig.rerank.apiUrl ||
            !Array.isArray(chunks) ||
            chunks.length === 0
        ) {
            return chunks.slice(0, topK);
        }

        try {
            const response = await postJson(
                chatbotConfig.rerank.apiUrl,
                {
                    query,
                    top_n: topK,
                    documents: chunks.map((chunk) => ({
                        id: chunk.id,
                        content: chunk.text,
                        metadata: chunk.metadata || {},
                    })),
                },
                { timeoutMs: chatbotConfig.rerank.timeoutMs },
            );
            const resultList = Array.isArray(response)
                ? response
                : response?.results || response?.data;

            if (
                Array.isArray(resultList) &&
                resultList.some((item) => item && item.id !== undefined)
            ) {
                const chunkById = new Map(
                    chunks.map((chunk) => [String(chunk.id), chunk]),
                );
                const rankedChunks = resultList
                    .map((item) => {
                        const chunk = chunkById.get(String(item.id));
                        const score = readScore(item);
                        if (!chunk || score === null) {
                            return null;
                        }

                        return {
                            ...chunk,
                            score,
                        };
                    })
                    .filter(Boolean);

                if (rankedChunks.length > 0) {
                    return rankedChunks.slice(0, topK);
                }
            }

            const scores = parseScores(response, chunks.length);

            if (!scores) {
                return chunks.slice(0, topK);
            }

            return chunks
                .map((chunk, index) => ({
                    ...chunk,
                    score: scores[index] !== null ? scores[index] : chunk.score,
                }))
                .sort((left, right) => right.score - left.score)
                .slice(0, topK);
        } catch (error) {
            console.error(`[chatbot] rerank failed: ${error.message}`);
            return chunks.slice(0, topK);
        }
    }
}

module.exports = new RerankService();
