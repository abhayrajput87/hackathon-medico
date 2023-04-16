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
const generateUniqueId = require('generate-unique-id');
const multer  = require('multer');
const expressLayouts = require('express-ejs-layouts')

/* MODELS */
const Patient= require("./Schema/patient.js")
const Medical= require("./Schema/medical.js")
const Report=require("./Schema/reports.js")

/* config */
const app=express();
const connectDb=require("./config/db")
app.use(express.static(path.join(__dirname,'public')));
app.use(morgan('dev'));
app.use(expressLayouts)
app.set('layout', './layouts/main')
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}))


/* FILE STORAGE */

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    return cb(null, './public/uploadedfiles')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
     return cb(null, file.fieldname + '-' + uniqueSuffix)
  }
});

const upload = multer({ storage })



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


/* Connecting with the database */
connectDb();



require('./config/googlestrategy.js')(passport);
require('./config/localstrategy.js')(passport);



/* Upload Routes */
app.post("/submitReport/:userid",upload.single('report'), async(req,res)=>{
   const report =new Report({
    userId: req.params.userid,
    description: req.body.message,
    picturePath: req.file.path,
    pictureName: req.file.filename
   })
   
   const saved=await Report.create(report)
  console.log(saved)
  console.log(req.body.message)
  console.log(req.file);
  res.status(200).send('File uploaded successfully');

})





app.get("/medicalLogin",(req,res)=>
{
 
  res.render("./medical/medicalLogin" ,{
    layout:"./layouts/form"
  })
})


app.get("/medicalRegistration",(req,res)=>
{
  res.render("./medical/medicalRegistration",{
    layout:"./layouts/form"
  })
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


app.post('/medicalRegistration', (req, res) => {

  Medical.register(new Medical({ username:req.body.username, medicalName:req.body.medicalName, regDate:req.body.regDate}), req.body.password, (err, user) => {
    if (err) 
    {
      console.log(err);
      res.status(400).send(err);
    } 
    else 
    {
      console.log(user)
      passport.authenticate('medicalocal')(req, res, () => {
      console.log(req.isAuthenticated())
      console.log(req.user);
      req.session.save(() => {
      res.status(200).redirect("/secrets");
        })
      })
    }
  })
});

app.post('/medicalLogin',(req,res)=>{
 // req.session.user=req.user;
  res.redirect("/medicalDashboard")
});

app.get("/medicalDashboard",(req,res)=>{
  res.render("./medical/medicalDashboard",{
    layout:"./layouts/medical"
  })
})

app.post("/medicalDashboard",async (req,res)=>{
  const user_id= req.body.user_id;
  const foundPatient=await Patient.find({p_id:user_id })
  const patientName=foundPatient[0].fname + " " +foundPatient[0].lname;

  console.log(foundPatient)
  console.log(patientName)
  console.log("bye")
        res.render("./medical/patients",{
          patient:patientName,
          userid:user_id,
          layout: "./layouts/medical"
        })
})


/* Home Page  */
app.get('/',(req,res)=>{
    res.render("home")
})


/* Patient Login */
 app.get('/patientLogin',(req,res)=>{
     res.render("./patient/patientLogin")
})

app.post("/patientRegister", (req,res)=>{

  const id = generateUniqueId({length: 7}); //To generate a unique id      
   Patient.register(new Patient({ 
    p_id:id,
    fname: req.body.fname,
    lname:req.body.lname,
    username:req.body.email,
    gender:req.body.gender,
    googleId: "abc",
    birthday:req.body.birthday
  }),
    req.body.password, (err, user) => {
    if (err) 
    {
      console.log(err);
      res.status(400).send(err);
    } 
    else 
    {
      console.log(user)
      passport.authenticate('patientLocal')(req, res, () => {
      console.log(req.isAuthenticated())
      console.log(req.user);
      res.status(200).redirect("secrets");
        
      });
    }
  });
})

app.get("/patientRegister",(req,res)=>{res.render("./patient/patientRegister")
})

app.get('/auth/google',passport.authenticate('google', { scope: ['profile','email'] }));

app.get('/auth/google/dashboard',  passport.authenticate('google', { failureRedirect: '/' , successRedirect:"/patientDashboard"}));

app.get('/patientDashboard', (req, res) => {
   if (req.isAuthenticated()) {
     res.render('./patient/patientDashboard');
   } else {
     res.redirect('/patientLogin');
   }
 });

 /* Doctor Routes */

 app.get("/doctorDashboard",(req,res)=>{
  res.render("./doctor/doctorDashboard",{
    layout:"./layouts/medical"
  });

 })


 /*Logout*/

 app.get('/logout', function(req, res) {
   req.logout(function(err) {
     if (err) { return next(err); }
     res.redirect('/')
     }                // this method is provided by Passport to remove the user from the session
 )});

 app.post("/doctorPatient", async(req,res)=>{
  try {
    const id= req.body.user_id;
    const foundReport=  await Report.find({userId:id})
    const foundPatient= await Patient.find({p_id:id});
    const patientName=foundPatient[0].fname + " " +foundPatient[0].lname;
    const picturePath= "./uploadedfiles/"+ foundReport[0].pictureName;
    const description= foundReport[0].description;
    const email=foundPatient[0].username;

    console.log(picturePath);
    res.render("./doctor/reportsview",{
    picturepath:picturePath,
    patient:patientName,
    description:description,
    username:email,
    layout:"./layouts/medical" 
     })
  } catch (err) {
    res.json({error:err.message})
    
  }


 })











console.log(process.env.MESS)



app.listen(3000, ()=>{
    console.log("Listenning")
})
