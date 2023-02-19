import mongoose from "mongoose";
const Schema = mongoose.Schema;

const userLogSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    oldUsername: {
      type: String,
    },
    newUsername: {
      type: String,
    },
    oldEmail: {
      type: String,
    },
    newEmail: {
      type: String,
    },

    // we wouldn't log the password hashes

    oldValid: {
      type: Boolean,
    },
    newValid: {
      type: Boolean,
    },
    oldShouldUserReLogin: {
      type: Boolean,
    },
    newShouldUserReLogin: {
      type: Boolean,
    },
    oldCFT: {
      type: Number,
    },
    newCFT: {
      type: Number,
    },
    oldCanLogin: {
      type: Boolean,
    },
    newCanLogin: {
      type: Boolean,
    },
    oldPermissions: {
      type: Array,
      default: undefined,
    },
    newPermissions: {
      type: Array,
      default: undefined,
    },
    oldImage: {
      type: String,
    },
    newImage: {
      type: String,
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

export default mongoose.model("UserLog", userLogSchema, "LOG_users");
