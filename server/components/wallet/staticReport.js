import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const staticReportSchema = new Schema({
    type: { type: Number },
    data: { type: Number },
}, {
    timestamps: true
});

staticReportSchema.index({ type: 'text' });

export default mongoose.model('StaticReport', staticReportSchema);
