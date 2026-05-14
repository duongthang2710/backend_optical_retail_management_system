require("dotenv").config({ quiet: true });

const fs = require("fs/promises");
const path = require("path");

const chatbotConfig = require("../src/config/chatbotConfig");
const embeddingService = require("../src/services/embeddingService");
const { readJsonlChunks } = require("../src/services/ragChunkUtils");

const buildVectorIndex = async () => {
    let chunks;
    try {
        chunks = await readJsonlChunks(chatbotConfig.rag.chunksPath);
    } catch (error) {
        if (error.code === "ENOENT") {
            throw new Error(
                `RAG chunks file not found: ${chatbotConfig.rag.chunksPath}`,
            );
        }

        throw error;
    }

    if (chunks.length === 0) {
        throw new Error("RAG chunks file is empty");
    }

    const indexedChunks = [];
    let embeddingDimension = null;

    for (let index = 0; index < chunks.length; index += 1) {
        const chunk = chunks[index];
        const embedding =
            chunk.embedding || (await embeddingService.createEmbedding(chunk.text));

        if (!Array.isArray(embedding) || embedding.length === 0) {
            throw new Error(`Missing embedding for chunk ${chunk.id}`);
        }

        if (embeddingDimension === null) {
            embeddingDimension = embedding.length;
        }

        if (embedding.length !== embeddingDimension) {
            throw new Error(
                `Embedding dimension mismatch at chunk ${chunk.id}`,
            );
        }

        indexedChunks.push({
            id: chunk.id,
            text: chunk.text,
            metadata: chunk.metadata || {},
            embedding,
        });

        if ((index + 1) % 10 === 0 || index + 1 === chunks.length) {
            console.log(`Indexed ${index + 1}/${chunks.length} chunks`);
        }
    }

    const vectorIndex = {
        version: 1,
        generatedAt: new Date().toISOString(),
        chunksPath: path.relative(
            chatbotConfig.projectRoot,
            chatbotConfig.rag.chunksPath,
        ),
        embeddingDimension,
        chunks: indexedChunks,
    };

    await fs.mkdir(path.dirname(chatbotConfig.rag.indexPath), {
        recursive: true,
    });
    await fs.writeFile(
        chatbotConfig.rag.indexPath,
        JSON.stringify(vectorIndex, null, 2),
        "utf8",
    );

    console.log(`Vector index written to ${chatbotConfig.rag.indexPath}`);
};

buildVectorIndex().catch((error) => {
    console.error(`[buildVectorIndex] ${error.message}`);
    process.exit(1);
});
