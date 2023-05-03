import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      min: 2,
      max: 50,
    },
    lastName: {
      type: String,
      required: true,
      min: 2,
      max: 50,
    },
    email: {
      type: String,
      required: true,
      max: 50,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      min: 8,
      max: 20,
    },
    picturePath: {
      type: String,
      default:
        "https://media.istockphoto.com/id/1393750072/vector/flat-white-icon-man-for-web-design-silhouette-flat-illustration-vector-illustration-stock.jpg?s=612x612&w=0&k=20&c=s9hO4SpyvrDIfELozPpiB_WtzQV9KhoMUP9R9gVohoU=",
    },
    friends: {
      type: Array,
      default: [],
    },
    location: {
      type: String,
      default: "Unknown",
    },
    occupation: {
      type: String,
      default: "Unknown",
    },
    tokens: [{
      type: Object,
    }]
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model("User", userSchema);
