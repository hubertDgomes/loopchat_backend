import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  room: { type: String, required: true }, // e.g. "user1_user2"
  sender: { type: String, required: true }, // sender's name or id
  text: { type: String },
  imageUrl : {type :String},
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Message", messageSchema);
