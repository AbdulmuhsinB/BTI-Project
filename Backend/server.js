const express = require("express")
const mongoose = require("mongoose")
const bodyParser = require("body-parser")   
const cors = require("cors")                //minimize errors from datbase and api when connecting
const bcrypt = require("bcrypt")  
const jwt = require("jsonwebtoken")

const User = require("./models/usersSchema")
const SECRET_KEY = "secretkey";

/* 
Connecting mongodb
*/

const app = express()
const dbURL = "mongodb+srv://muhsinbaksh04:tAuUd2ynQIY9DU1M@cluster0.9hpriwo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

mongoose.connect(dbURL).then(() => {
    app.listen(8080, () => {
        console.log("CONNECTED!!!!!!!!!!!")
    });    
})
.catch((error) => {
    console.log("Error connecting to MongoDB:", error);
});


app.use(bodyParser.json())
app.use(cors())


app.post('/register', async (req, res) =>{
    try{
        const {email, username, password} = (req.body)
        const hashPassword = await bcrypt.hash(password, 10)
        const newUser = new User({email, username, password:hashPassword})
        await newUser.save()
        res.status(201).json({message : "user created successfully"})

    }catch(error){
        res.status(500).json({error : "Unable to Sign up"})
    }
    
})

app.get('/register', async (req, res) =>{
    try{
        const users = await User.find()
        res.status(201).json({message : users})

    }catch(error){
        res.status(500).json({error : "Unable to get User"})
    }
})

app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body
        const user = await User.findOne({ username })
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials'})
        }
        const isPasswordValid = await bcrypt.compare(password, user.password)
        if(!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' })
        }
        const token = jwt.sign({ userId: user._id }, SECRET_KEY, { expiresIn: '1hr' })
        res.json({ message: 'Login successful' })
    } catch (error) {
        res.status(500).json({ error: 'Error logging in' })
    }
})