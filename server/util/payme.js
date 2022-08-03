import * as _ from 'lodash';
import CryptoJS from 'crypto-js';
import Axios from 'axios';
import Request from 'request';
import ShortId from 'shortid';
import crypto from 'crypto';
import Md5 from 'md5';
import NodeRSA from 'node-rsa';
import {
 CONNECTION_ID_PAYME, CONNECTION_KEY_PAYME, PRIVATE_KEY_PAYME, PUBLIC_KEY_PAYME
} from '../../external/constants/constants';


export default class MeAPI {
    constructor(config = {
        url: '',
        publicKey: '',
        privateKey: '',
        isSecurity: false,
        'x-api-client': ''
    }) {
        this.config = config;
    }

    ResponseDecrypt(xAPIAction, method, xAPIClient, xAPIKey, xAPIMessage, xAPIValidate, accessToken) {
        let encryptKey;
        // console.log(`Loaded xAPIMessage : ${xAPIMessage}`);
        // console.log(`Loaded private Key : ${this.config.privateKey}`);
        try {
            const key = new NodeRSA(this.config.privateKey);
            encryptKey = key.decrypt(xAPIKey, 'utf8');
        } catch (error) {
            console.log(error);
            throw new Error('Invalid "x-api-key"');
        }
        const objValidate = {
            'x-api-action': xAPIAction,
            method,
            accessToken,
            'x-api-message': xAPIMessage
        };
        const validate = Md5(_.values(objValidate).join('') + encryptKey);
        let result = null;
        try {
            result = CryptoJS.AES.decrypt(xAPIMessage, encryptKey).toString(CryptoJS.enc.Utf8);
            // console.log(result);
        } catch (error) {
            console.log(`Error : ${error}`);
            throw new Error('Invalid "x-api-message"');
        }
        return result;
    }

    RequestEncrypt(url, method, payload, accessToken) {
        const encryptKey = ShortId.generate();
        // console.log('encrypt Key ========> ', encryptKey)
        const key = new NodeRSA(this.config.publicKey);
        // console.log(this.config.privateKey)
        const xAPIKey = key.encrypt(encryptKey, 'base64');
        let body = '';
        const xApiAction = CryptoJS.AES.encrypt(url, encryptKey).toString();
        let xApiMessage = '';
        if (payload) {
            xApiMessage = CryptoJS.AES.encrypt(JSON.stringify(payload), encryptKey).toString();
        }
        const objValidate = {
            xApiAction,
            method,
            accessToken,
            'x-api-message': xApiMessage
        };
        const xAPIValidate = Md5(_.values(objValidate).join('') + encryptKey);
        body = {
            'x-api-message': xApiMessage
        };
        const meAPIHeader = {
            'x-api-client': this.config['x-api-client'],
            'x-api-key': xAPIKey,
            'x-api-action': xApiAction,
            'x-api-validate': xAPIValidate
        };
        if (accessToken !== '') {
            meAPIHeader.Authorization = accessToken;
        }

        return {
            body,
            headers: meAPIHeader
        };
    }

    async Post(pathUrl, payload, accessToken = '', headers = {}) {
        const result = {
            code: -1,
            data: {},
            original: null
        };
        try {
        if (_.isNull(accessToken)) accessToken = '';
        let meAPIHeader = {};
        if (accessToken !== '') {
            meAPIHeader.Authorization = accessToken;
        }
        let body = payload;
        let url = this.config.url + pathUrl;
        if (this.config.isSecurity === true) {
            url = 'https://sbx-pg.payme.vn/v1/Payment/Generate';
            const encrypt = this.RequestEncrypt(
                pathUrl,
                'POST',
                payload,
                accessToken
            );
            meAPIHeader = encrypt.headers;
            body = encrypt.body;
        }
        const headers2 = _.merge(meAPIHeader, headers);
        const response = await Axios.post(url, body, {
            headers: _.merge(meAPIHeader, headers)
        });

        // console.log('response', response);
        if (response.code !== 200) {
            result.code = -response.code;
            result.data = {};
            result.original = response.data;
        }
        let data = response.data;
        if (this.config.isSecurity === true) {
            try {
            const responseHeaders = response.headers;
            data = this.ResponseDecrypt(
                responseHeaders['x-api-action'],
                'POST',
                responseHeaders['x-api-client'],
                responseHeaders['x-api-key'],
                response.data['x-api-message'],
                responseHeaders['x-api-validate'],
                accessToken
            );
            } catch (error) {
            return {
                code: -1,
                data: {
                message: error.message
                },
                original: response.data
            };
            }
        }
        return {
            code: 1,
            data,
            original: response.data
        };
        } catch (error) {
        return {
            code: -2,
            data: {
            message: error.message
            },
            original: error
        };
        }
    }

    async Delete(pathUrl, accessToken = '', headers = {}) {
        const result = {
            code: -1,
            data: {},
            original: null
        };
        try {
        if (_.isNull(accessToken)) accessToken = '';
        let meAPIHeader = {};
        if (accessToken !== '') {
            meAPIHeader.Authorization = accessToken;
        }
        let url = this.config.url + pathUrl;
        if (this.config.isSecurity === true) {
            url = this.config.url;
            const encrypt = this.RequestEncrypt(
            pathUrl,
            'DELETE',
            '',
            accessToken
            );
            meAPIHeader = encrypt.headers;
        }
        const response = await Axios.get(url, {
            headers: _.merge(meAPIHeader, headers)
        });
        if (response.code !== 200) {
            result.code = -response.code;
            result.data = {};
            result.original = response.data;
        }
        let data = response.data;
        if (this.config.isSecurity === true) {
            try {
                const responseHeaders = response.headers;
                data = this.ResponseDecrypt(
                    responseHeaders['x-api-action'],
                    'GET',
                    responseHeaders['x-api-client'],
                    responseHeaders['x-api-key'],
                    response.data['x-api-message'],
                    responseHeaders['x-api-validate'],
                    accessToken
                );
            } catch (error) {
                return {
                    code: -1,
                    data: {
                    message: error.message
                    },
                    original: response.data
                };
            }
        }
            return {
                code: 1,
                data,
                original: response.data
            };
        } catch (error) {
            return {
                code: -2,
                data: {
                message: error.message
                },
                original: error
            };
        }
    }
}

const app = {
    publicKey: PUBLIC_KEY_PAYME,
    privateKey: PRIVATE_KEY_PAYME
  };

export const meAPI = new MeAPI({
    url: 'https://sbx-pg.payme.vn',
    publicKey: app.publicKey,
    privateKey: app.privateKey,
    isSecurity: true,
    'x-api-client': CONNECTION_ID_PAYME
});
