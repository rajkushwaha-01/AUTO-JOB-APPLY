const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true // store the bcrypt hash here, never plain text
    },
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
      default: null
    },
    preferences: {
      roles: {
        type: [String],
        default: []
      },
      locations: {
        type: [String],
        default: []
      },
      remoteOnly: {
        type: Boolean,
        default: false
      },
      minSalary: {
        type: Number,
        default: 0
      }
    }
  },
  { timestamps: true } // adds createdAt / updatedAt automatically
);

// never return the password hash when the doc is serialized to JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model("User", userSchema);