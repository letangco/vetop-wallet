import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const SettingsGeneralSchema = new Schema({
    type: { type: Number, required: true, unique: true },
    value: { type: Number, required: true }
});

export default mongoose.model('SettingsGeneral', SettingsGeneralSchema);
