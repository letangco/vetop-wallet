import ElasticSearch from '../elasticsearch/elasticsearch';
import { ELASTICSEARCH_HOST, ELASTICSEARCH_PORT } from '../config';

export const ClassElasticsearch = new ElasticSearch({
  host: ELASTICSEARCH_HOST,
  port: ELASTICSEARCH_PORT,
})
