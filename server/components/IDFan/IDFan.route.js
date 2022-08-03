import { Router } from 'express';
import { isUser } from '../../../internal/auth/jwt';
import * as IDFanController from './IDFan.controller';

const router = new Router();

router.route('')
  .get(
    isUser.auth(),
    IDFanController.getIDFan
  );
router.route('/static')
  .get(
    isUser.auth(),
    IDFanController.getIDFanStatic
  );
export default router;
