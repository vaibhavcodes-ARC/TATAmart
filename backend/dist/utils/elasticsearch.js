"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeElasticsearch = exports.esClient = void 0;
const elasticsearch_1 = require("@elastic/elasticsearch");
const ELASTICSEARCH_URL = process.env.ELASTICSEARCH_URL || 'http://localhost:9200';
exports.esClient = new elasticsearch_1.Client({
    node: ELASTICSEARCH_URL,
});
const initializeElasticsearch = async () => {
    try {
        const health = await exports.esClient.cluster.health({});
        console.log(`Elasticsearch cluster is ${health.status}`);
        // Create products index if it doesn't exist
        const indexExists = await exports.esClient.indices.exists({ index: 'products' });
        if (!indexExists) {
            await exports.esClient.indices.create({
                index: 'products',
                mappings: {
                    properties: {
                        id: { type: 'keyword' },
                        title: { type: 'text' },
                        description: { type: 'text' },
                        price: { type: 'double' },
                        categoryId: { type: 'keyword' },
                        sellerId: { type: 'keyword' },
                        createdAt: { type: 'date' }
                    }
                }
            });
            console.log('Products index created');
        }
    }
    catch (error) {
        console.error('Error connecting to Elasticsearch:', error);
    }
};
exports.initializeElasticsearch = initializeElasticsearch;
