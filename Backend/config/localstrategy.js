const LocalStrategy = require('passport-local');
const Medical=require("../Schema/medical.js");
const Patient =require("../Schema/patient.js")


module.exports=(passport)=>{
  
passport.use("medicalocal" , new LocalStrategy(Medical.authenticate()));
passport.use("patientLocal" , new LocalStrategy(Patient.authenticate()));

passport.serializeUser(function(user, cb) {
  process.nextTick(function() {
    return cb(null, {
      id: user.id,
      username: user.username,
      picture: user.picture
    });
  });
});

passport.deserializeUser(function(user, cb) {
  process.nextTick(function() {
    return cb(null, user);
  });
})};