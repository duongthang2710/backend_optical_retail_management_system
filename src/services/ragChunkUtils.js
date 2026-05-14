const fs = require("fs/promises");

const TEXT_KEYS = [
    "text",
    "content",
    "chunk",
    "page_content",
    "pageContent",
    "body",
    "description",
];

const RESERVED_KEYS = new Set([
    "id",
    "chunk_id",
    "chunkId",
    "text",
    "content",
    "chunk",
    "page_content",
    "pageContent",
    "body",
    "description",
    "metadata",
    "embedding",
    "vector",
]);

const COMMON_METADATA_KEYS = [
    "type",
    "category",
    "source",
    "product_id",
    "product_name",
    "variant_id",
    "brand",
    "brand_name",
    "material",
    "shape",
    "color",
    "price",
    "stock_quantity",
];

const isPlainObject = (value) => (
    Boolean(value) &&
    typeof value === "object" &&
    !Array.isArray(value)
);

const isNumberArray = (value) => (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every((item) => Number.isFinite(Number(item)))
);

const formatValue = (value) => {
    if (value === undefined || value === null || value === "") {
        return "";
    }

    if (Array.isArray(value)) {
        return value
            .map(formatValue)
            .filter(Boolean)
            .join(", ");
    }

    if (isPlainObject(value)) {
        return Object.entries(value)
            .map(([key, nestedValue]) => {
                const formattedValue = formatValue(nestedValue);
                return formattedValue ? `${key}: ${formattedValue}` : "";
            })
            .filter(Boolean)
            .join("; ");
    }

    return String(value).trim();
};

const extractText = (record) => {
    for (const key of TEXT_KEYS) {
        const value = record[key];
        if (typeof value === "string" && value.trim()) {
            return value.trim();
        }
    }

    if (isPlainObject(record.document)) {
        const documentText = extractText(record.document);
        if (documentText) {
            return documentText;
        }
    }

    return Object.entries(record)
        .filter(([key]) => !RESERVED_KEYS.has(key))
        .map(([key, value]) => {
            const formattedValue = formatValue(value);
            return formattedValue ? `${key}: ${formattedValue}` : "";
        })
        .filter(Boolean)
        .join("\n")
        .trim();
};

const extractMetadata = (record) => {
    const metadata = isPlainObject(record.metadata) ? { ...record.metadata } : {};

    for (const key of COMMON_METADATA_KEYS) {
        if (
            metadata[key] === undefined &&
            record[key] !== undefined &&
            record[key] !== null
        ) {
            metadata[key] = record[key];
        }
    }

    return metadata;
};

const normalizeChunk = (record, lineNumber) => {
    const text = extractText(record);
    if (!text) {
        throw new Error(`Missing chunk text at line ${lineNumber}`);
    }

    const id =
        record.id ||
        record.chunk_id ||
        record.chunkId ||
        `chunk_${String(lineNumber).padStart(6, "0")}`;

    return {
        id: String(id),
        text,
        metadata: extractMetadata(record),
        embedding: isNumberArray(record.embedding)
            ? record.embedding.map(Number)
            : undefined,
    };
};

const readJsonlChunks = async (filePath) => {
    const rawContent = await fs.readFile(filePath, "utf8");
    const chunks = [];

    rawContent.split(/\r?\n/).forEach((line, index) => {
        const trimmedLine = line.trim();
        if (!trimmedLine) {
            return;
        }

        let record;
        try {
            record = JSON.parse(trimmedLine);
        } catch (error) {
            throw new Error(`Invalid JSONL at line ${index + 1}`);
        }

        chunks.push(normalizeChunk(record, index + 1));
    });

    return chunks;
};

const formatChunkForContext = (chunk, index) => {
    const metadataText = Object.entries(chunk.metadata || {})
        .map(([key, value]) => {
            const formattedValue = formatValue(value);
            return formattedValue ? `${key}: ${formattedValue}` : "";
        })
        .filter(Boolean)
        .join("; ");

    return [
        `Nguồn ${index + 1}`,
        metadataText ? `Thông tin: ${metadataText}` : "",
        chunk.text,
    ]
        .filter(Boolean)
        .join("\n");
};

module.exports = {
    formatChunkForContext,
    isNumberArray,
    normalizeChunk,
    readJsonlChunks,
};
