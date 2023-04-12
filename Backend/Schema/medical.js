const mongoose=require("mongoose");
const passportLocalMongoose=require("passport-local-mongoose")

const LocalStrategy = require('passport-local').Strategy;
const medicalSchema=new mongoose.Schema(
    {
    
        username:{
            type: String,
            required: true
        },
        medicalName:{
            type: String,
            required: true
        },
        regDate:{
            type: Date,
            required: true
        }


    }
);
medicalSchema.plugin(passportLocalMongoose);

module.exports =new mongoose.model("Medical",medicalSchema);