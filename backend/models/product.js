import mongoose from "mongoose";
const Schema = mongoose.Schema;

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    shortId: {
      type: String,
      required: true,
      //unique: true,
      index: { unique: true },
    },
    quantity: {
      type: Number,
      required: true,
      min: [0, "It should be at least 0"],
      max: [999999, "It should be lower than 1.000.000"],
    },
    description: {
      type: String,
    },
    image: {
      type: String,
    },
    valid: {
      type: Boolean,
      required: true,
      index: true,
    },
    createdBy: {
      type: String,
      required: true,
    },
    updatedBy: { type: String, required: true },
  },
  { timestamps: true }
);

// trigger
// https://mongoosejs.com/docs/middleware.html
//roductSchema.pre()

export default mongoose.model("Product", productSchema);
