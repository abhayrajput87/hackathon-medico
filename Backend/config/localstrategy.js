const LocalStrategy = require('passport-local');
const Medical=require("../Schema/medical.js");


module.exports=(passport)=>{
  
passport.use("medicalocal", new LocalStrategy(Medical.authenticate()));

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