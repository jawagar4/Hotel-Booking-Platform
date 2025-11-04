import mongoose from "mongoose"

const connectDB = async () => {
    try {
        mongoose.connection.once('connected', () => console.log("Database connected successfully"));
        await mongoose.connect(`${process.env.MONGODB_URI}/hotel-website`)
    } catch (error) {
        console.log(error.message);
    }
}


export default connectDB;