require("dotenv").config({path: './config/.env'});
const express=require("express");
const mongoose=require("mongoose")
const bodyParser= require("body-parser");
const morgan=require("morgan")
const session=require("express-session");
const passport=require("passport");
const GoogleStrategy=require("passport-google-oauth20").Strategy
const path=require('path')
const passportLocalMongoose=require("passport-local-mongoose")
const LocalStrategy = require('passport-local').Strategy;
const MongoStore=require('connect-mongo')

/* MODELS */
const Patient= require("./Schema/patient.js")
const Medical= require("./Schema/medical.js")

/* config*/
const app=express();
const connectDb=require("./config/db")
app.use(express.static(path.join(__dirname,'public')));
app.use(morgan('dev'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}))






/*  Storing the sessions */

app.use(session({
  secret: "Iamthesecret",
  resave: false,
  saveUninitialized: false,
  //cookie: { secure: false }
  store:MongoStore.create({mongoUrl:'mongodb://127.0.0.1/hackathonDb'})
}))

app.use(passport.initialize());
app.use(passport.session());
app.use(passport.authenticate('session'))

/* Connecting with the database */
connectDb();



require('./config/googlestrategy.js')(passport);

require('./config/localstrategy.js')(passport);

/* Medical Routes */

app.get("/medicalDashboard",(req,res)=>
{
  res.render("./medical/medicalDashboard")
})

app.get("/medicalLogin",(req,res)=>
{
  res.render("./medical/medicalLogin")
})


app.get("/medicalRegistration",(req,res)=>
{
  res.render("./medical/medicalRegistration")
})


app.get('/secrets', (req, res) => {
  console.log('User:', req.user);
  console.log(req.isAuthenticated())
  if (req.isAuthenticated()) {
    res.send('secrets');
  } else {
    res.send("not authenticated");
  }
});


app.post('/medical', (req, res) => {
  console.log("hii")
  console.log(req.body)
  Medical.register(new Medical({ username:req.body.username,medicalName:req.body.medicalName,regDate:req.body.regDate}), req.body.password, (err, user) => {
    if (err) {
      console.log(err);
      res.status(400).send(err);
    } else {
      console.log(user)
      passport.authenticate('medicalocal')(req, res, () => {
        console.log(req.isAuthenticated())
        console.log(req.user);
        req.session.save(() => {
        res.status(200).redirect("/secrets");
        })
      });
    }
  });
});

app.post('/login', passport.authenticate('medicalocal',{ failureRedirect:"/" ,successRedirect:"secrets" }));



/*Home Page  */
app.get('/',(req,res)=>{
    res.render("home")
})


/* Patient Login */
 app.get('/patientlogin',(req,res)=>{
     res.render("patientlogin")
})

app.post("/loginpatient",async (req,res)=>{
  email:req.body.email
  try {
    
  } catch (err) {
    res.send("error 404")}
})

app.get("/patientRegister",(req,res)=>{res.render("patientregister")
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


 /* Logout */

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
