
/**
 * @swagger
 * /wallet/wallet-archive:
 *  get:
 *    summary: get wallet archive
 *    tags:
 *      - Wallet
 *    responses:
 *       200:
 *         description: Wallet Archive
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             payload:
 *               type: string
 *               description: Data result
 *           example: {
  "success": true,
  "payload": {}
}
 *       401:
 *         description: When your token is invalid. You'll get Unauthorized msg
 *         schema:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               $ref: '#/definitions/ValidatorErrorItem'
 *           example: "Unauthorized"
 *       500:
 *         description: When got server exception
 *       502:
 *         description: Bad Gateway
 * */

/**
 * @swagger
 * /wallet/wallet-archive-history:
 *  get:
 *    summary: get wallet archive history
 *    tags:
 *      - Wallet
 *    parameters:
 *       - name: page
 *         in: query
 *       - name: limit
 *         in: query
 *    responses:
 *       200:
 *         description: Wallet Archive history
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             payload:
 *               type: string
 *               description: Data result
 *           example: {
  "success": true,
  "payload": {}
}
 *       401:
 *         description: When your token is invalid. You'll get Unauthorized msg
 *         schema:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               $ref: '#/definitions/ValidatorErrorItem'
 *           example: "Unauthorized"
 *       500:
 *         description: When got server exception
 *       502:
 *         description: Bad Gateway
 * */

/**
 * @swagger
 * /wallet:
 *  get:
 *    summary: get wallet user
 *    tags:
 *      - Wallet
 *    responses:
 *       200:
 *         description: Wallet info
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             payload:
 *               type: string
 *               description: Data result
 *           example: {
 *           }
 *       401:
 *         description: When your token is invalid. You'll get Unauthorized msg
 *         schema:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               $ref: '#/definitions/ValidatorErrorItem'
 *           example: "Unauthorized"
 *       500:
 *         description: When got server exception
 *       502:
 *         description: Bad Gateway
 * */

/**
 * @swagger
 * /wallet/wallet-archive-change:
 *  get:
 *    summary: get wallet archive change by time
 *    tags:
 *      - Wallet
 *    parameters:
 *       - name: type
 *         in: query
 *    responses:
 *       200:
 *         description: Wallet Archive change
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             payload:
 *               type: string
 *               description: Data result
 *           example: {
  "success": true,
  "payload": {}
}
 *       500:
 *         description: When got server exception
 *       502:
 *         description: Bad Gateway
 * */


/**
 * @swagger
 * /wallet/wallet-archive-chart:
 *  get:
 *    summary: get wallet archive change by time
 *    tags:
 *      - Wallet
 *    parameters:
 *       - name: last_id
 *         in: query
 *       - name: limit
 *         in: query
 *    responses:
 *       200:
 *         description: Wallet Archive change
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             payload:
 *               type: string
 *               description: Data result
 *           example: {
  "success": true,
  "payload": {}
}
 *       500:
 *         description: When got server exception
 *       502:
 *         description: Bad Gateway
 * */

/**
 * @swagger
 * /wallet/withdrawal:
 *  post:
 *    summary: User withdrawal pin or VND
 *    tags:
 *      - Wallet
 *    parameters:
 *      - in: body
 *        name: body
 *        type: object
 *        properties:
 *          type:
 *            type: string
 *          value:
 *            type: number
 *    responses:
 *       200:
 *         description: Transaction detail
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             payload:
 *               type: string
 *               description: Data result
 *           example: {
  "success": true,
  "payload": {}
}
 *       401:
 *         description: When your token is invalid. You'll get Unauthorized msg
 *         schema:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               $ref: '#/definitions/ValidatorErrorItem'
 *           example: "Unauthorized"
 *       500:
 *         description: When got server exception
 *       502:
 *         description: Bad Gateway
 * */

/**
 * @swagger
 * /wallet/token/:
 *  get:
 *    summary: Calculator vetic
 *    tags:
 *      - Wallet
 *    parameters:
 *       - name: vetic
 *         in: query
 *    responses:
 *       200:
 *         description: Wallet Archive change
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             payload:
 *               type: string
 *               description: Data result
 *           example: {
  "success": true,
  "payload": {}
}
 *       500:
 *         description: When got server exception
 *       502:
 *         description: Bad Gateway
 * */

/**
 * @swagger
 * /wallet/refresh/:
 *  get:
 *    summary: Get Refresh
 *    tags:
 *      - Wallet
 *    responses:
 *       200:
 *         description: Wallet Archive change
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             payload:
 *               type: string
 *               description: Data result
 *           example: {
  "success": true,
  "payload": {}
}
 *       500:
 *         description: When got server exception
 *       502:
 *         description: Bad Gateway
 * */

/**
 * @swagger
 * /wallet/analytic-token/:
 *  get:
 *    summary: Analytics Token
 *    tags:
 *      - Wallet
 *    responses:
 *       200:
 *         description: Wallet Archive change
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             payload:
 *               type: string
 *               description: Data result
 *           example: {
  "success": true,
  "payload": {}
}
 *       500:
 *         description: When got server exception
 *       502:
 *         description: Bad Gateway
 * */

/**
 * @swagger
 * /wallet/rank:
 *  get:
 *    summary: Ranking Vetic
 *    tags:
 *      - Wallet
 *    responses:
 *       200:
 *         description: Wallet Archive change
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             payload:
 *               type: string
 *               description: Data result
 *           example: {
  "success": true,
  "payload": {}
}
 *       500:
 *         description: When got server exception
 *       502:
 *         description: Bad Gateway
 * */

