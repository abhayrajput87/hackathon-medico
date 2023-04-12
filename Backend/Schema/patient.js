const mongoose=require("mongoose");

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
        email:{
            type: String,
            required: true
        },
        googleId:{
            type: String,
            required: true
        },
        
        gender:{
            type: String,
            default: ""
        },
        birthday:{
            type: Date
        },
    }
)

module.exports= new mongoose.model("Patient",patientSchema)
