const GoogleStrategy=require("passport-google-oauth20").Strategy 
const mongoose = require('mongoose');
const Patient = require("../Schema/patient.js");
const passport = require("passport");
const generateUniqueId = require('generate-unique-id');
 



module.exports= (passport)=>{passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/dashboard",
    scope:['profile','email']
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      let patient = await Patient.findOne({ googleId: profile.id });
      if (patient) {
        console.log(profile)
        return done(null, patient);
      } 
      else {
        console.log(profile)
        const id = generateUniqueId({length: 7}); //To generate a unique id          
        const newPatient = new Patient({
          p_id:id,  
          googleId: profile.id,
          fname: profile.name.givenName,
          lname: profile.name.familyName,
          username: profile.emails[0].value
        });
        patient = await newPatient.save();
        return done(null, patient);
      }
    } 
    catch (error) {
      console.error(error);
      return done(error, null);
    }
  }));
  
  
  passport.serializeUser((patient, done)=> {
    done(null, patient.id); 
  });
  
  passport.deserializeUser((id, done) => {
    Patient.findById(id)
      .then(patient => done(null, patient))
      .catch(err => done(err, null));
  });
}