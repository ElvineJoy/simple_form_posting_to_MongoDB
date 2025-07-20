
const express = require('express');
const app = express();
app.use(express.static('public'));
const mongoose = require("mongoose");
const UserModel = require('./models/user');
var connectionUrl = process.env.MONGO_URI || "mongodb://localhost:27017/school";
const session = require('express-session');
const bcrypt = require('bcrypt')
const studentTrip = require('./models/studentTrip');

app.use(session({
    secret:'wamama23456##ukweliwananguvu',
    resave: false,
    saveUninitialized:false
}));

async function startServer() {
    try {
        await mongoose.connect(connectionUrl, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("Connected to MongoDb");

        // middleware
        app.use(express.urlencoded({extended: true}))
        app.use(express.json());
        app.set("view engine", "ejs")

        // routes
        app.get("/home", async(req, res) => {
            if (!req.session.teacherId) return res.redirect('/login');
            try{
                const students= await studentTrip.find({createdBy:req.session.teacherId }).sort({ tripDate: -1 });
                res.render("home",{
                    message:'Welcome to the student trips management system',
                    students: students
                });
             } catch(err) {
                    console.error("Render error:",err);
                    res.render("home", {
                        message: 'Student details added successfully.',
                        students: []
                    });
                 }
        });

        app.get("/register", (req, res) =>{
            res.render("register")
        })
        // Login route
        app.get('/login', (req, res) => {
            res.render('login');
        });

        // route/endpoint for collecting and sending the user registration to the Mongo DataBase
        app.post("/api/user", async (req, res) => {
            try {
                const {username, password} = req.body;
                const hashedPassword = await bcrypt.hash(password,10);

                const newUser = new UserModel({
                    username,
                    password: hashedPassword
                });

                const savedUser = await newUser.save();
                res.redirect('/login');
            } catch (error) {
                console.error("Error saving user:", error);
                res.status(500).send("Failed to register user.");
            }
        });

    

        app.post('/login', async (req, res) => {
            const { username, password } = req.body;

            const teacher = await UserModel.findOne({ username });
            
            if (!teacher) {
                return res.redirect('/register');
            }

            const isMatch = await bcrypt.compare(password, teacher.password);

            if (!isMatch) {
                return res.send("Login failed");
            }

            req.session.teacherId=teacher._id;
            res.redirect('/home')
        });
        
        app.post('/home', async(req, res) => {
            console.log("Session teacherId:", req.session.teacherId);

            if (!req.session.teacherId) return res.redirect('/login');
        
            const { studentName, grade, parentContact, tripDate, amountPaid, datePaid}= req.body;
            
            try {
                const newStudent = new studentTrip({
                    studentName,
                    grade,
                    parentContact,
                    tripDate,
                    amountPaid,
                    datePaid,
                    createdBy:req.session.teacherId
            });

            await newStudent.save();
            res.redirect('/home');

        } catch (err) {
            console.error('Error adding student details:', err);
            res.render('home', 
                {message: 'Failed to add details, Try again.',
            });
         }
        });

        app.get('/logout', (req, res) => {
            req.session.destroy(() => {
            res.redirect('/login');
    });
});


        const port = process.env.PORT || 4000
        app.listen(port, ()=>{
            console.log(`Listening to Port ${port}`);
        });

    } catch (error) {
        console.error("Failed to connect to MongoDB:", error);
    }
    
}

startServer()






