import jwt from 'jsonwebtoken';
import APIError from '../util/APIError';
import { JWT_SECRET_KEY } from '../config';
/**
 * Check user permission by role, status and permission
 * @returns {function(*, *, *)}
 */
export function isAuthorizedAdmin() {
  return async (req, res, next) => {
    const authorization = req.header('Authorization');
    if (typeof authorization !== 'string') {
      return next(new APIError(401, 'Unauthorized'));
    }
    const authorizationArray = authorization.split(' ');
    if (authorizationArray[0] === 'Bearer') {
      const token = authorizationArray[1];
      let userData;
      try {
        userData = jwt.verify(token, JWT_SECRET_KEY);
      } catch (error) {
        return next(new APIError(401, 'Unauthorized'));
      }
      req.auth = userData;
      return next();
    }
    return next(new APIError(401, 'Unauthorized'));
  };
}
