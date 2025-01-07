const mongoose = require('mongoose');
const Student = require('./model/Student');
const express = require('express');
const bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');
const multer  = require('multer');
const path = require('path');


const atlasUrl = "mongodb+srv://classdemo:classdemo@cluster0.qcr6o.mongodb.net/classdemodb";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './uploads')
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + path.extname(file.originalname);
      cb(null, uniqueSuffix)
    }
  })
  
  const upload = multer({ storage: storage })

mongoose.connect(atlasUrl).then(()=>{
    console.log("Connected to DB Server");

    const app = express();

    app.use(bodyParser.json())

    app.use('/student',(req,res,next)=>{
        try {
            var decoded = jwt.verify(req.headers.authorization.split(" ")[1], 'myPassword');
            next();
          } catch(err) {
            // err
            res.status(401).send({err:"Unauthorized"});
          }   
    })

    //getAll
    app.get("/student",async (req,res)=>{
        const data = await Student.find();
        res.send(data);
    });

    //getByID
    app.get("/student/:id",async (req,res)=>{
        const data = await Student.findOne({_id:req.params.id});
        res.send(data);
    });

    app.get("/login",async (req,res)=>{
        const data = await Student.findOne({StudentEmail:req.body.StudentEmail, StudentPassword:req.body.StudentPassword});
        if(data){
            var token = jwt.sign({id:data._id, StudentEmail:data.StudentEmail}, 'myPassword');
            res.status(200).send({token:token});
        }
        else{
            res.status(401).send({err:"Username/password does not match"});
        }
    })

    //delete
    app.delete("/student/:id", async (req,res)=>{
        const data = await Student.deleteOne({_id:req.params.id});
        res.send(data)
    });

    //insert (Create)
    app.post("/student", async (req,res)=>{
        const obj = new Student({
            StudentName:req.body.StudentName,
            StudentMobile:req.body.StudentMobile,
            StudentEmail: req.body.StudentEmail,
            StudentPassword: req.body.StudentPassword,
        });
        const data = await obj.save();
        res.send(data);

    });

    //update
    app.patch("/student/:id", async (req,res)=>{
        let stu = await Student.findOne({_id:req.params.id});
        stu.StudentName = req.body.StudentName;
        stu.StudentEmail = req.body.StudentEmail;
        stu.StudentMobile = req.body.StudentMobile;
        stu.StudentPassword = req.body.StudentPassword;
        const data = await stu.save();
        res.send(data);
    });

    app.post("/upload",upload.single('studentImage'),(req,res)=>{
        res.send("Hello world");
    })

    app.listen(3000,()=>{
        console.log("Web server started @ 3000");
    });

});