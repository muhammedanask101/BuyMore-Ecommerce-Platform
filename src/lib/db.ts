import mongoose, { ConnectOptions } from 'mongoose';

interface connectedOptions extends ConnectOptions {
  useNewUrlParser: boolean;
  useUnifiedTopology: boolean;
}

const options: connectedOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

const connectDB = async () => {
  const connectionUrl: string = process.env.MONGO_URI as string;
  mongoose
    .connect(connectionUrl, options)
    .then(() => console.log(`Connected to database successfully`))
    .catch((err) => console.log('Error in connection' + err.message));
  mongoose.set('strictQuery', false);
};

export default connectDB;
