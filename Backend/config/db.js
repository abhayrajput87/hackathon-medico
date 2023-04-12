const mongoose= require("mongoose")
const mongoDB = 'mongodb://127.0.0.1/hackathonDb';
mongoose.set('strictQuery', false);
module.exports = async ()=>{
    try{
    const connect=await mongoose.connect(mongoDB) // We replace special character using percent encoding if it is present in username or password
    console.log('MongoDb is conected')
}catch(e)
{
    console.log(e)
    process.exit(1)
}
}
