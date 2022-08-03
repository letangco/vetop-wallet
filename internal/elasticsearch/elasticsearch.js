import elasticSearch from 'elasticsearch';

export default class ElasticSearch {
  constructor(configs) {
    this.esClient = new elasticSearch.Client({
      /**
       * @param configs
       * @param configs.host
       * @param configs.port
       * */
      host: `${configs.host}:${configs.port}`
    });
  }

  DeployDocument(index, payload) {
    this.esClient.indices.exists({ index }, (err, res, status) => {
      if (res) {
        console.log(`create: Index ${index} đã tồn tại ... Continue.`);
      } else {
        this.esClient.indices.create({ index, body: payload }, (err, res, status) => {
          if (err) {
            console.log(err);
            console.log('create: Lỗi tạo index ... Stop');
            process.exit(1);
          } else {
            console.log(res);
          }
        });
      }
    });
  }

  DeployMultiDocument(documents) {
    if (!Array.isArray(documents)) {
      documents = [documents];
    }
    documents.map((e) => {
      this.DeployDocument(e.index, e.payload);
    });
  }

  DeleteDocument(index) {
    this.esClient.indices.exists({ index }, (err, res, status) => {
      if (!res) {
        console.log(`delete: Index ${index} không tồn tại ... Continue ...`);
      } else {
        this.esClient.indices.delete({
          index: index
        }, (err, res, status) => {
          console.log('delete: Thành công ', res);
        });
      }
    });
  }

  /**
   * Add element in document
   * @param indexName
   * @param data
   * @param typeName
   * */
  AddElement(indexName, data, typeName) {
    if (!data.id) {
      throw new Error('Please provide id to index to Elasticsearch');
    }
    return this.esClient.index({
      index: indexName,
      id: data.id,
      type: typeName || indexName,
      body: data
    });
  }

  /**
   * Add multi element in document
   * @param indexName
   * @param data
   * @param typeName
   * */
  MultiAddElement(indexName, data, typeName) {
    const bulk_body = [];
    data.forEach((item) => {
      bulk_body.push({ index: { _index: indexName, _type: typeName || indexName, _id: item.id } });
      bulk_body.push(item);
    });
    return this.esClient.bulk({
      index: indexName,
      type: typeName || indexName,
      body: bulk_body
    });
  }

  /**
   * update and insert
   * @param indexName
   * @param data
   * @param typeName
   * @param upsert
   * */
  UpdateAndInsert(indexName, data, typeName, upsert) {
    return this.esClient.update({
      index: indexName,
      type: typeName || indexName,
      id: data.id,
      body: {
        // put the partial document under the `doc` key
        doc: data,
        doc_as_upsert: upsert
      }
    });
  }

  /**
   * Delete element
   * @param indexName
   * @param id
   * @param typeName
   * */
  DeleteElement(indexName, id, typeName) {
    return this.esClient.delete({
      index: indexName,
      type: typeName || indexName,
      id: id
    });
  }

  /**
   * Search Element
   * @param indexName
   * @param body
   * @param typeName
   * */
  async SearchElement(indexName, body, typeName) {
    try {
      return await this.esClient.search({
        index: indexName,
        type: typeName || indexName,
        body: body
      });
    } catch (err) {
      return '';
    }
  }
}

