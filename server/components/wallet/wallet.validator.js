import { body } from 'express-validator';
import validatorErrorHandler from '../../api/validatorErrorHandler';
import { ERROR_CODE } from '../../../external/constants/constants';

export const withdrawalValidator = [
    body('value').notEmpty().withMessage(ERROR_CODE.VALUE_IS_REQUIRED),
    body('type').notEmpty().withMessage(ERROR_CODE.TYPE_IS_REQUIRED),
    validatorErrorHandler
];
