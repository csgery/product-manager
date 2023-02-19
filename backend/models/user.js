import mongoose from "mongoose";
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      index: { unique: true },
      minLength: [5, "It should be at least 5 character"],
      maxLength: [32, "It should be less than 32 or equal"],
    },
    email: {
      type: String,
      required: true,
      index: { unique: true },
      validate: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
    },
    password: {
      type: String,
      required: true,
      // It'll be true everytime, because we check the generated HASH

      //validate: /^(?=.*?[\u0000-\u007F])(?=.*?[0-9])(?=.*?[#?!@$%^&*-+]).{8,}$/,
    },
    permissions: {
      type: Array,
      required: true,
    },
    image: {
      type: String,
    },
    shouldUserReLogin: {
      type: Boolean,
      required: true,
      default: false,
    },
    // CFT = Counter For Token
    CFT: {
      type: Number,
      required: true,
      default: 0,
    },
    canLogin: {
      type: Boolean,
      required: true,
      default: true,
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

export default mongoose.model("User", userSchema);
