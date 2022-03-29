import * as AWS from 'aws-sdk'
const BUCKET_NAME = 'files-mercado-pago'

export default {
  install: (Vue, options) => {
    AWS.config.update({
      region: process.env.VUE_APP_S3_REGION,
      accessKeyId: process.env.VUE_APP_S3_ACCESS_KEY,
      secretAccessKey: process.env.VUE_APP_S3_SECRET_KEY
    });
    const s3 = new AWS.S3({ apiVersion: "2006-03-01" })
    const s3Plugin = {
      upload: async (file) => {
        const params = {
          Bucket: BUCKET_NAME,
          Key: `${Date.now()}-${file.name}`,
          Body: file,
          ACL: 'public-read'
        }
        return new Promise((resolve, reject) => {
          s3.upload(params, function (err, data) {
            if (err) {
              reject(err)
            }
            resolve(data)
          })
        })
      },
      delete: async (fileName) => {
        const params = {
          Bucket: BUCKET_NAME,
          Key: fileName,
        }
        return new Promise((resolve, reject) => {
          s3.deleteObject(params, function (err, data) {
            if (err) {
              reject(err)
            }
            resolve(data)
          })
        })
      }
    }
    Vue.prototype.$s3 = s3Plugin
    Vue.$s3 = s3Plugin
  }
}