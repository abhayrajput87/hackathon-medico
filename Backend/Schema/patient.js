const mongoose=require("mongoose");
const passportLocalMongoose=require("passport-local-mongoose")

const patientSchema = new mongoose.Schema(
    {
        p_id:{
            type: String,
            required:true,
            unique: true
        },
        fname:{
            type: String,
            required: true
        },
        lname:{
            type: String,
            required: true
        },
        username:{
            type: String,
            required: true
        },
        googleId:{
            type: String

        },
        
        gender:{
            type: String
        },
        birthday:{
            type: Date
        }

    }
)

patientSchema.plugin(passportLocalMongoose);
module.exports= new mongoose.model("Patient",patientSchema)
