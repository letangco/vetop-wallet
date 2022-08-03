/**
 * @swagger
 * /admin/management-transaction/:
 *   get:
 *     summary: Admin Get Transaction
 *     tags:
 *       - Admin Transaction
 *     parameters:
 *       - name: status
 *         in: number
 *       - name: user
 *         in: query
 *       - name: userType
 *         in: query
 *       - name: page
 *         in: query
 *       - name: limit
 *         in: query
 *       - name: paymentType
 *         description: 1-12
 *         in: query
 *       - name: type
 *         in: query
 *         description: 'VND, PIN, VETIC, STOCK'
 *       - name: fromDay
 *         in: query
 *       - name: toDay
 *         in: query
 *     responses:
 *       200:
 *         name: body
 *         in: body
 *         required: true
 *         description: staff list
 *         schema:
 *           type: object
 *           properties:
 *             $ref: '#/definitions/User'
 *           example: {
 *              success: true,
 *              payload: []
 *           }
 *       500:
 *         description: When got server exception
 *         schema:
 *           type: string
 *           example: "Internal server error"
 */

/**
 * @swagger
 * /admin/management-transaction/{id}:
 *   get:
 *     summary: Get Transaction By Id
 *     tags:
 *       - Admin Transaction
 *     parameters:
 *       - name: id
 *         in: path
 *     responses:
 *       200:
 *         name: body
 *         in: body
 *         required: true
 *         description: staff list
 *         schema:
 *           type: object
 *           properties:
 *             $ref: '#/definitions/User'
 *           example: {
 *              success: true,
 *              payload: []
 *           }
 *       500:
 *         description: When got server exception
 *         schema:
 *           type: string
 *           example: "Internal server error"
 */

/**
 * @swagger
 * /admin/management-transaction/withdrawal/list:
 *   get:
 *     summary: Get List Withdrawl
 *     tags:
 *       - Admin Transaction
 *     parameters:
 *       - name: limit
 *         in: query
 *       - name: page
 *         in: query
 *     responses:
 *       200:
 *         name: body
 *         in: body
 *         required: true
 *         description: staff list
 *         schema:
 *           type: object
 *           properties:
 *             $ref: '#/definitions/User'
 *           example: {
 *              success: true,
 *              payload: []
 *           }
 *       500:
 *         description: When got server exception
 *         schema:
 *           type: string
 *           example: "Internal server error"
 */

/**
 * @swagger
 * /admin/management-transaction/withdrawal/detail/{id}:
 *   get:
 *     summary: Get Withdrawl By Id
 *     tags:
 *       - Admin Transaction
 *     parameters:
 *       - name: id
 *         in: path
 *     responses:
 *       200:
 *         name: body
 *         in: body
 *         required: true
 *         description: staff list
 *         schema:
 *           type: object
 *           properties:
 *             $ref: '#/definitions/User'
 *           example: {
 *              success: true,
 *              payload: []
 *           }
 *       500:
 *         description: When got server exception
 *         schema:
 *           type: string
 *           example: "Internal server error"
 */

/**
 * @swagger
 * /admin/management-transaction/withdrawl/{id}:
 *   get:
 *     summary: Get Withdrawal By Id
 *     tags:
 *       - Admin Transaction
 *     parameters:
 *       - name: id
 *         in: path
 *     responses:
 *       200:
 *         name: body
 *         in: body
 *         required: true
 *         description: staff list
 *         schema:
 *           type: object
 *           properties:
 *             $ref: '#/definitions/User'
 *           example: {
 *              success: true,
 *              payload: []
 *           }
 *       500:
 *         description: When got server exception
 *         schema:
 *           type: string
 *           example: "Internal server error"
 */

/**
 * @swagger
 * /admin/management-transaction/top-up/:
 *  post:
 *    summary: Top Up VND To User
 *    tags:
 *      - Top Up
 *    parameters:
 *      - in: body
 *        name: body
 *        type: object
 *        properties:
 *          targetId:
 *            type: string
 *          type:
 *            type: number
 *          amount:
 *            type: string
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
 * /admin/management-transaction/withdrawal/handle:
 *  put:
 *    summary: Handle Transaction
 *    tags:
 *      - Admin Transaction
 *    parameters:
 *      - in: body
 *        name: body
 *        type: object
 *        properties:
 *          transactionId:
 *            type: string
 *          status:
 *            type: 2
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


