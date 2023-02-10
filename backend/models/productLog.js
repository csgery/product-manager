import mongoose from "mongoose";
const Schema = mongoose.Schema;

const productLogSchema = new Schema(
  {
    productId: {
      type: String,
      required: true,
    },
    oldName: {
      type: String,
    },
    newName: {
      type: String,
    },
    oldShortId: {
      type: String,
    },
    newShortId: {
      type: String,
    },
    oldQuantity: {
      type: Number,
    },
    newQuantity: {
      type: Number,
    },
    oldValid: {
      type: Boolean,
    },
    newValid: {
      type: Boolean,
    },
    createdBy: {
      type: String,
    },
    actionType: {
      type: String,
    },
    message: {
      type: String,
    },
    securityLevel: {
      type: String,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// trigger
// https://mongoosejs.com/docs/middleware.html
//roductSchema.pre()

export default mongoose.model("ProductLog", productLogSchema, "LOG_products");
