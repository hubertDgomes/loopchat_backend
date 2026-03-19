import mongoose from "mongoose";
import { Schema } from "mongoose";

const userSchema = new Schema ({
    fullName : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true
    },
    password : {
        type : String,
        required : true
    },
    profilePhoto : {
        type : String
    },
    isProfileCreated : {
        type : Boolean,
        default : false
    }
})

export default mongoose.model("userProfileData" , userSchema)