import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const transSettingSchema = new Schema({
    type: { type: String, required: true },
    value: { type: Number, required: true }
});

export default mongoose.model('transactionSetting', transSettingSchema);
