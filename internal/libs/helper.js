import ArrayHelper from '../../external/util/array';
import mongoose from 'mongoose'

export const ArrayHelpers = new ArrayHelper();

export const newObjectID = () => mongoose.Types.ObjectId()
