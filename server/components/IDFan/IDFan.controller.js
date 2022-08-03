import * as IDFanServices from './IDFan.service';
import { commonGetQuery, getSort } from '../../../external/middleware/query';

export async function getIDFan(req, res) {
  try {
    const query = commonGetQuery(req);
    const payload = await IDFanServices.getIDFans(query, getSort(query));
    return res.RH.paging(payload, query.page, query.limit);
  } catch (error) {
    return res.RH.error(error);
  }
}

export async function getIDFanStatic(req, res) {
  try {
    const payload = await IDFanServices.getIDFanStatic(req?.user?._id);
    return res.RH.success(payload);
  } catch (error) {
    return res.RH.error(error);
  }
}
