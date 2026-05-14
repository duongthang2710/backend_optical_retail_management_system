const fs = require("fs/promises");

const chatbotConfig = require("../config/chatbotConfig");
const embeddingService = require("./embeddingService");
const { isNumberArray } = require("./ragChunkUtils");

const cosineSimilarity = (leftVector, rightVector) => {
    if (
        !isNumberArray(leftVector) ||
        !isNumberArray(rightVector) ||
        leftVector.length !== rightVector.length
    ) {
        return null;
    }

    let dotProduct = 0;
    let leftNorm = 0;
    let rightNorm = 0;

    for (let index = 0; index < leftVector.length; index += 1) {
        const leftValue = Number(leftVector[index]);
        const rightValue = Number(rightVector[index]);
        dotProduct += leftValue * rightValue;
        leftNorm += leftValue * leftValue;
        rightNorm += rightValue * rightValue;
    }

    if (leftNorm === 0 || rightNorm === 0) {
        return null;
    }

    return dotProduct / (Math.sqrt(leftNorm) * Math.sqrt(rightNorm));
};

class RetrievalService {
    constructor() {
        this.index = null;
        this.loadingIndex = null;
    }

    async loadIndex() {
        if (this.index) {
            return this.index;
        }

        if (!this.loadingIndex) {
            this.loadingIndex = this.readIndex()
                .then((index) => {
                    this.index = index;
                    return index;
                })
                .finally(() => {
                    this.loadingIndex = null;
                });
        }

        return this.loadingIndex;
    }

    async readIndex() {
        let rawIndex;
        try {
            rawIndex = await fs.readFile(chatbotConfig.rag.indexPath, "utf8");
        } catch (error) {
            if (error.code === "ENOENT") {
                const missingIndexError = new Error(
                    "Vector index not found. Run: node scripts/buildVectorIndex.js",
                );
                missingIndexError.status = 500;
                throw missingIndexError;
            }

            throw error;
        }

        const parsedIndex = JSON.parse(rawIndex);
        if (!Array.isArray(parsedIndex.chunks)) {
            throw new Error("Vector index is invalid");
        }

        return parsedIndex;
    }

    async search(query, options = {}) {
        const topK = options.topK || chatbotConfig.rag.topK;
        const minScore =
            options.minScore !== undefined
                ? options.minScore
                : chatbotConfig.rag.minScore;
        const index = await this.loadIndex();
        const queryEmbedding = await embeddingService.createEmbedding(query);

        return index.chunks
            .map((chunk) => {
                const score = cosineSimilarity(queryEmbedding, chunk.embedding);
                if (score === null) {
                    return null;
                }

                return {
                    id: chunk.id,
                    text: chunk.text,
                    metadata: chunk.metadata || {},
                    score: Number(score.toFixed(6)),
                };
            })
            .filter((result) => result && result.score >= minScore)
            .sort((left, right) => right.score - left.score)
            .slice(0, topK);
    }

    clearCache() {
        this.index = null;
        this.loadingIndex = null;
    }
}

module.exports = new RetrievalService();
