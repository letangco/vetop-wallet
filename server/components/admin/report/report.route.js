import { Router } from 'express';
import { isAdmin } from '../../../../internal/auth/jwt';
import * as ReportController from './report.controller';

const router = new Router();

router.route('/')
  .get(
      isAdmin.auth(),
    ReportController.getReport
  );

export default router;
