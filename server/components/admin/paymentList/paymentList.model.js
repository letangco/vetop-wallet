import mongoose from 'mongoose';
import slug from 'slug';

const Schema = mongoose.Schema;

const paymentListSchema = new Schema({
    name: { type: String, required: true },
    image: {
        name: { type: String },
        small: { type: String },
        medium: { type: String },
        large: { type: String }
    },
    type: { type: String, required: true },
    data: { type: Array },
    searchString: { type: String }
}, {
    timestamps: true
});

paymentListSchema.pre('save', function (next) {
    this.searchString = slug(`${this.name}`, ' ');
    return next();
  });

export default mongoose.model('payment-list', paymentListSchema);
