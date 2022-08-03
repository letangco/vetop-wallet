// import S3 from 'aws-sdk/clients/s3';
// import {
//   AWS_ACCESS_KEY,
//   AWS_SECRET_ACCESS_KEY,
// } from '../config';
// import logger from '../api/logger';
//
// const s3 = new S3({
//   accessKeyId: AWS_ACCESS_KEY,
//   secretAccessKey: AWS_SECRET_ACCESS_KEY
// });
//
// /**
//  * Upload file
//  * @param {string} bucket pass your bucket name
//  * @param {string} key file will be saved as bucket/key
//  * @param {stream} body
//  * @returns {Promise<*>}
//  */
// export async function s3UploadFile(bucket, key, body) {
//   try {
//     const params = {
//       Bucket: bucket,
//       Key: key,
//       Body: body
//     };
//     let totalSize = 0;
//     const managedUpload = s3.upload(params);
//     managedUpload.on('httpUploadProgress', (data) => {
//       if (data.total) {
//         totalSize = data.total;
//       }
//     });
//     const uploadResult = await managedUpload.promise();
//     uploadResult.size = totalSize;
//     return uploadResult;
//   } catch (error) {
//     logger.error('AWSS3 s3Upload, error:');
//     logger.error(error);
//     throw error;
//   }
// }
//
// /**
//  * Delete file
//  * @param {string} bucket - pass your bucket name
//  * @param {string} key - file will be saved as bucket/key
//  * @returns {Promise<*>}
//  */
// export async function s3DeleteFile(bucket, key) {
//   try {
//     const params = {
//       Bucket: bucket,
//       Key: key,
//     };
//     const deleteResult = await s3.deleteObject(params).promise();
//     console.log('deleteResult');
//     console.log(deleteResult);
//     return true;
//   } catch (error) {
//     logger.error('AWSS3 s3DeleteFile, error:');
//     logger.error(error);
//     throw error;
//   }
// }
// /**
//  * Delete files
//  * @param {string} bucket - pass your bucket name
//  * @param {Array} keys - files will be saved as bucket/key
//  * @returns {Promise<*>}
//  */
// export async function s3DeleteFiles(bucket, keys) {
//   try {
//     const params = {
//       Bucket: bucket,
//       Delete: {
//         Objects: keys.map(key => ({ Key: key }))
//       },
//     };
//     const deleteResult = await s3.deleteObjects(params).promise();
//     console.log('deleteResult');
//     console.log(deleteResult);
//     return true;
//   } catch (error) {
//     logger.error('AWSS3 s3DeleteFiles, error:');
//     logger.error(error);
//     throw error;
//   }
// }
