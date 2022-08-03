import { Router } from 'express';
import * as SettingsGeneralController from './settings-general.controller';

const router = new Router();

router.route('/fee')
  .get(
    SettingsGeneralController.getFee
  )
  .put(
    SettingsGeneralController.changeFee
  )

router.route('/')
  .get(
    SettingsGeneralController.getSettings
  )
  .put(
    SettingsGeneralController.updateSetting
  )

export default router;
