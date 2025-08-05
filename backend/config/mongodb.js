import mongoose, { connect } from "mongoose";

const connectDb = async()=>{
    mongoose.connection.on("connected", ()=>{
        console.log("Mongodb is Connected")
    })
    await mongoose.connect(`${process.env.MONGODB_URL}/SkillSwap`)
}

export default connectDb