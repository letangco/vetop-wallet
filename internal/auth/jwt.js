import { JWT, CreateAuth } from '@tggs/core-authencation';
import { JWT_SECRET_KEY } from '../config';
import { getUserInfo, getStoreInfo, getAdminInfo, getStaffInfo } from '../grpc/user/request';
import jwt from 'jsonwebtoken';
import APIError from '../../external/util/APIError';

export const jwt_user = new JWT({
  jwtKey: JWT_SECRET_KEY,
  expiredTime: 2592000000
});

/**
 * JWT User
 * */
export const isUser = new CreateAuth('user', jwt_user.getJWTKey(), 'bearer', async (token, done) => {
  try {
    // eslint-disable-next-line new-cap
    if (token.access === 'store') {
      const user = await getStoreInfo(token?._id.toString() || '');
      if (!user?._id) {
        return done(null, false);
      }
      return done(null, {
        _id: user.userId.toString(),
        storeId: user._id.toString()
      });
    }
        // eslint-disable-next-line new-cap
        if (token.access === 'staff') {
          const staff = await getStaffInfo(token?.staffId.toString() || '');
          if (!staff?._id) {
            return done(null, false);
          }
          return done(null, {
            _id: staff.userId.toString(),
            storeId: staff.storeId.toString(),
            staffId: staff._id.toString()
          });
        }
    const user = await getUserInfo(token._id.toString());
    if (!user?._id) {
      return done(null, false);
    }
    return done(null, {
      _id: user._id
    });
  } catch (e) {
    return done(e);
  }
});

/**
 * JWT Store
 * */
export const isStore = new CreateAuth('store', jwt_user.getJWTKey(), 'bearer', async (token, done) => {
  try {
    // eslint-disable-next-line new-cap
    if (token.access !== 'store') {
      return done(null, false);
    }
    const user = await getStoreInfo(token._id.toString());
    if (!user?._id) {
      return done(null, false);
    }
    return done(null, {
      _id: user.userId,
      storeId: token._id.toString()
    });
  } catch (e) {
    return done(e);
  }
});

export const isAdmin = new CreateAuth('admin', jwt_user.getJWTKey(), 'bearer', async (token, done) => {
  try {
    const user = await getAdminInfo(token._id.toString());
    if (!user?._id) {
      return done(null, false);
    }
    return done(null, user);
  } catch (e) {
    return done(e);
  }
});

export const isAuthorized = () => async (req, res, next) => {
  const authorization = req.header('Authorization');
  if (typeof authorization !== 'string') {
    return next();
  }
  const authorizationArray = authorization.split(' ');
  if (authorizationArray[0] === 'bearer') {
    const token = authorizationArray[1];
    let userData;
    try {
      userData = jwt.verify(token, JWT_SECRET_KEY);
    } catch (error) {
      return next(new APIError(401, 'Unauthorized'));
    }
    if (userData.access === 'store') {
      const user = await getStoreInfo(userData._id.toString());
      if (!user?._id) {
        return next(new APIError(401, 'Unauthorized'));
      }
      req.user = {
        _id: user.userId,
        storeId: userData._id.toString()

      };
      return next();
    }
    const user = await getUserInfo(userData._id.toString());
    if (!user?._id) {
    return next(new APIError(401, 'Unauthorized'));
    }
    req.user = {
      _id: user._id
    };
    return next();
  }
  return next();
};