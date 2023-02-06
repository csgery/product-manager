import mongoose from "mongoose";
const Schema = mongoose.Schema;

const dictSchema = new Schema(
  {
    hash: {
      type: Number,
      required: true,
      index: { unique: true },
    },
    dicts: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  { timestamps: false }
);

// trigger
// https://mongoosejs.com/docs/middleware.html
//roductSchema.pre()

export default mongoose.model("Dict", dictSchema);
