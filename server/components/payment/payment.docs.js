/**
 * @swagger
 * /payment/create:
 *  post:
 *    summary: User Create Payment
 *    tags:
 *      - Payment
 *    parameters:
 *      - in: body
 *        name: body
 *        type: object
 *        properties:
 *          ipAddress:
 *            type: string
 *          order:
 *            type: string
 *          bankCode:
 *            type: string
 *          amount:
 *            type: string
 *        example: {
 *          "order": "609ce0be220c940f779f6853",
 *          "bankCode": "NCB",
 *          "amount": "1500000"
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
 * /payment/create-payment/payme:
 *  post:
 *    summary: User Create Payment Payme
 *    tags:
 *      - Payment
 *    parameters:
 *      - in: body
 *        name: body
 *        type: object
 *        properties:
 *          transId:
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


