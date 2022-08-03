
/**
 * @swagger
 * /transaction/{id}:
 *  get:
 *    summary: get transaction user history
 *    tags:
 *      - Transaction
 *    parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: "ID of the transaction"
 *    responses:
 *       200:
 *         description: User transaction history
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
 * /transaction:
 *  get:
 *    summary: get transaction user history
 *    tags:
 *      - Transaction
 *    parameters:
 *       - name: page
 *         in: query
 *       - name: limit
 *         in: query
 *       - name: type
 *         in: query
 *         required: true
 *         description: 'VND, PIN, VETIC, STOCK'
 *       - name: fromDay
 *         in: query
 *       - name: toDay
 *         in: query
 *    responses:
 *       200:
 *         description: User transaction history
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
 * /transaction/income-tax:
 *  get:
 *    summary: get income tax user history
 *    tags:
 *      - Income Tax
 *    parameters:
 *       - name: page
 *         in: query
 *       - name: limit
 *         in: query
 *       - name: fromDay
 *         in: query
 *       - name: toDay
 *         in: query
 *    responses:
 *       200:
 *         description: User income tax history
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
 * /IDFan:
 *  get:
 *    summary: get IDFan List
 *    tags:
 *      - IDFan
 *    parameters:
 *       - name: page
 *         in: query
 *       - name: limit
 *         in: query
 *       - name: fromDay
 *         in: query
 *       - name: toDay
 *         in: query
 *    responses:
 *       200:
 *         description: IDFan List
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
 * /IDFan/static:
 *  get:
 *    summary: get IDFan Static
 *    tags:
 *      - IDFan
 *    responses:
 *       200:
 *         description: IDFan Static
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
 * /transaction/stock/transaction:
 *  get:
 *    summary: get stock transaction
 *    tags:
 *      - Transaction
 *    parameters:
 *       - name: page
 *         in: query
 *       - name: limit
 *         in: query
 *       - name: type
 *         in: query
 *         required: true
 *         description: 'VND, PIN, VETIC, STOCK'
 *       - name: fromDay
 *         in: query
 *       - name: toDay
 *         in: query
 *    responses:
 *       200:
 *         description: User transaction history
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
 * /transaction/income-tax:
 *  get:
 *    summary: get income tax user history
 *    tags:
 *      - Income Tax
 *    parameters:
 *       - name: page
 *         in: query
 *       - name: limit
 *         in: query
 *       - name: fromDay
 *         in: query
 *       - name: toDay
 *         in: query
 *    responses:
 *       200:
 *         description: User income tax history
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
