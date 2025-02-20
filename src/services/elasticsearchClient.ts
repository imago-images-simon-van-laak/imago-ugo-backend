import { Client } from '@elastic/elasticsearch';
import 'dotenv/config'

const client = new Client({
  node: process.env.ELASTIC_SEARCH_NODE_URL,
  auth: {
    username: `${process.env.ELASTIC_SEARCH_USERNAME}`,
    password: `${process.env.ELASTIC_SEARCH_PASSWORD}`,
  },
  tls: {
    rejectUnauthorized: false,
  },
  maxRetries: 3,
  requestTimeout: 30000,
  sniffOnStart: true
});

export default client;
