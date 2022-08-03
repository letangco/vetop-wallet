import mongoose from 'mongoose';
import IDFan from './IDFan.model';
import { getUserInfo } from '../../../internal/grpc/user/request';
import { error500 } from '../../../external/util/error';

/**
 * getIDFanStatic
 * @param {object} options
 * */
export async function getIDFanStatic(user) {
  try {
    const data = await IDFan.aggregate([
      { $match: { refer: mongoose.Types.ObjectId(user) } },
      {
        $group: {
          _id: null,
          total: { $sum: '$total' },
          commission: { $sum: '$commission' }
        }
      }
    ]);
    return data?.length ? { total: data[0].total, commission: data[0]?.commission } : {};
  } catch (error) {
    return error500(error);
  }
}

/**
 * getIDFans
 * @param {object} options
 * */
export async function getIDFans(options, sort = { createdAt: -1 }) {
  try {
    const conditionsTotal = {};
    const conditions = {};
    if (options.user) {
      conditions.refer = options.user;
      conditionsTotal.refer = options.user;
    }
    if (options.fromDay && options.toDay) {
      conditions.createdAt = {
        $gte: new Date(options.fromDay),
        $lt: new Date(options.toDay)
      };
    } else if (options.toDay) {
      conditions.createdAt = { $lt: new Date(options.toDay) };
    } else if (options.fromDay) {
      conditions.createdAt = { $gte: new Date(options.fromDay) };
    }
    const results = await Promise.all([
      IDFan.countDocuments(conditionsTotal),
      IDFan.find(conditions).sort(sort).limit(options.limit).skip(options.skip)
    ]);
    const total = results[0];
    let data = results[1];
    let promies = data.map( async e => {
      e = e.toJSON();
      const user = await getUserInfo(e.user);
      return {
        _id: e._id,
        total: e.total,
        commission: e.commission,
        user: user.code,
        store: user.store,
      };
    });
    data = await Promise.all(promies);
    return [total, data];
  } catch (error) {
    return error500(error);
  }
}

export async function createIDFan(data) {
  try {
    await IDFan.create(data);
  } catch (error) {
    console.log('error createIDFan: ', error);
  }
}

export async function updateIDFan(data, veticUser, veticStore, veticBuy, veticSell) {
  try {
    const results = await Promise.all([
      getIDFan(data.userId),
      getIDFan(data.storeUser),
    ]);
    if (!results[0]) {
      await createIDFan({
        user: data.userId,
        refer: data.buyId
      });
    }
    if (!results[0]) {
      await createIDFan({
        user: data.storeUser,
        refer: data.sellId
      });
    }
    await Promise.all([
      IDFan.updateOne({ user: data.userId }, {
        $inc: {
          total: veticUser,
          commission: veticBuy,
        }
      }),
      IDFan.updateOne({ user: data.storeUser }, {
        $inc: {
          total: veticStore,
          commission: veticSell,
        }
      })
    ]);
  } catch (error) {
    console.log('error updateIDFan: ', error);
  }
}

export async function getIDFan(user) {
  try {
    return await IDFan.findOne({ user });
  } catch (error) {
    console.log('error createIDFan: ', error);
  }
}

