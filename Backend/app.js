const express=require("express");
const mongoose=require("mongoose")
const bodyParser= require("body-parser");
require("dotenv").config({path: './config/.env'});
const morgan=require("morgan")
const app=express();
const patientSchema=require("./Schema/patient")
const connectDb=require("./config/db")
app.use(morgan('dev'));
const session=require("express-session");
const passport=require("passport");
const patient = require("./Schema/patient");
const GoogleStrategy=require("passport-google-oauth20").Strategy
const path=require('path')

const Patient=new mongoose.model("Patient",patientSchema)
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended:true}))


connectDb();
app.use(express.static(path.join(__dirname,'public')));




app.use(session({
  secret: "Iamthesecret",
  resave: false,
  saveUninitialized: false,
  //cookie: { secure: false }
}))

app.use(passport.initialize());
app.use(passport.session());


passport.use(new GoogleStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: "http://localhost:3000/auth/google/dashboard",
  scope:['profile','email']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let patient = await Patient.findOne({ googleId: profile.id });
    if (patient) {
      return done(null, patient);
    } 
    else {
      console.log(profile)
      const newPatient = new Patient({
        googleId: profile.id,
        fname: profile.name.givenName,
        lname: profile.name.familyName,
        email: profile.emails.value
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

app.get('/',(req,res)=>{
    res.render("home")
})


  
 app.get('/patientlogin',(req,res)=>{
     res.render("patientlogin")
})

app.post("/loginpatient",async (req,res)=>{
  email:req.body.email
  try {
    
  } catch (err) {
    res.send("error 404")
    
  }

})

app.get("/patientRegister",(req,res)=>{
  res.render("patientregister")
})

 app.get('/auth/google',passport.authenticate('google', { scope: ['profile','email'] }));

 app.get('/auth/google/dashboard',  passport.authenticate('google', { failureRedirect: '/' , successRedirect:"/dashboard" }));

 app.get('/dashboard', (req, res) => {
   if (req.isAuthenticated()) {
     res.render('dashboard');
   } else {
     res.redirect('/login');
   }
 });


 app.get('/logout', function(req, res) {
   req.logout(function(err) {
     if (err) { return next(err); }
     res.redirect('/')
     }                // this method is provided by Passport to remove the user from the session
 )});





app.get("/patient",(req,res)=>(
    res.send("patient route")
))

app.post("/patient",(req,res)=>{

})







console.log(process.env.MESS)



app.listen(3000, ()=>{
    console.log("Listenning")
})
