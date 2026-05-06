import { Client } from '@elastic/elasticsearch';

const ELASTICSEARCH_URL = process.env.ELASTICSEARCH_URL || 'http://localhost:9200';

export const esClient = new Client({
  node: ELASTICSEARCH_URL,
});

export const initializeElasticsearch = async () => {
  try {
    const health = await esClient.cluster.health({});
    console.log(`Elasticsearch cluster is ${health.status}`);

    // Create products index if it doesn't exist
    const indexExists = await esClient.indices.exists({ index: 'products' });
    if (!indexExists) {
      await esClient.indices.create({
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
  } catch (error) {
    console.error('Error connecting to Elasticsearch:', error);
  }
};
