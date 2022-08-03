/**
 * @swagger
 * /admin/payment-list:
 *  post:
 *    summary: Payment-List
 *    tags:
 *      - Payment-List
 *    parameters:
 *      - in: body
 *        name: body
 *        type: object
 *        properties:
 *          name:
 *            type: string
 *          type:
 *            type: string
 *          image:
 *            type: object
 *        example: {
 *          "name": "Table",
 *          "image": {"name": "image.jpg","medium": "image.jpg","large": "image.jpg","small": "image.jpg"},
 *          "type": "e_wallet"
 *        }
 *    responses:
 *       200:
 *         description: The clients details
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
 * /admin/payment-list:
 *  get:
 *    summary: Get PaymentList
 *    tags:
 *      - Payment-List
 *    parameters:
 *      - in: query
 *        name: keyword
 *        type: string
 *        description: text search
 *      - in: query
 *        name: limit
 *        type: number
 *        description: Specifies the maximum number of country the query will return. Limit default is 10
 *      - in: query
 *        name: page
 *        type: number
 *        description: Specifies the number of country page. Page default is 1
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
 * /admin/payment-list/detail/{id}:
 *  get:
 *    summary: Get PaymentList
 *    tags:
 *      - Payment-List
 *    parameters:
 *      - in: path
 *        name: id
 *        type: string
 *        description: text search
 *      - in: query
 *        name: limit
 *        type: number
 *        description: Specifies the maximum number of country the query will return. Limit default is 10
 *      - in: query
 *        name: page
 *        type: number
 *        description: Specifies the number of country page. Page default is 1
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
