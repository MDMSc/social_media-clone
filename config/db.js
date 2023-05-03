import mongoose from "mongoose";

mongoose.set("strictQuery", "false");

export const dbConnect = () => {
  mongoose
    .connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then((data) => console.log(`MongoDB connected: ${data.connection.host}`))
    .catch((err) => console.log(`Error: ${err}`));
};
