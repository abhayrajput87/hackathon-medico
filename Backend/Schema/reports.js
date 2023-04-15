
const mongoose = require('mongoose');
//Set up default mongoose connection

const reportSchema= new mongoose.Schema({
    userId:String,
    description: String,
    picturePath:String,
    pictureName: String


})

module.exports = new mongoose.model("Report", reportSchema);