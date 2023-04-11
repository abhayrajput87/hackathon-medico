const mongoose=require("mongoose");

module.exports = new mongoose.Schema(
    {
        fname:String,
        lname: String,
        email: String,
        googleId: String,
        gender:String,
        birthday:Date
    }
)