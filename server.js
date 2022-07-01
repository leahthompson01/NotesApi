const express = require('express')
const app =  express()
const PORT = 8080;
const dotenv = require('dotenv')
dotenv.config()
const cors = require('cors')
const mongoClient = require('mongodb').MongoClient
const db_connectionString = process.env.connection_string
//connecting to the database, using the useunifiedTopology returns a promise
app.use(cors())
//so we can use .then and .catch

mongoClient.connect(db_connectionString, {useUnifiedTopology: true  })
    .then(client =>{
        console.log('You have connected to the Database')
        db = client.db('Notes-API')
        const notesCollection = db.collection('notes-info')
        app.use(express.static('public'))
        app.use(express.urlencoded({ extended: true }))
        app.use(express.json())
        app.get('/', cors(corsOptions),(req,res)=>{
            res.send('Hello')
        })
        app.get('/notes', (req,res)=>{
           notesCollection.find().toArray()
           .then(data =>{
               console.log(data)
               res.json(data)
           })
           .catch(err => console.error(err))
        })
        //add check to make sure task does not already exist in toDoList
        app.post('/notes',(req,res)=>{
            notesCollection.insertOne({task:req.body.task,description:req.body.description})
            .then(result=> {
                console.log('Succesfully added new item to database')
                res.json('Added new task to database')
        })
            .catch(err => console.error(err))
        })
        //put request is going to update our db
        //put request is currently not updating db, need to search for item in db that matches,
        // either the task or description and update the field that changed
        let filteredArr
        app.put('/notes',(req,res)=>{
            notesCollection.find().toArray()
            .then(data =>{
               filteredArr = data.filter(obj => obj._id === req.body._id)
                console.log(filteredArr)
                //rethink how to update entries to check for uniqueness
                notesCollection.updateOne({task:filteredArr[0].task,description:filteredArr[0].description},{
                    $set:{
                        task: req.body.task,
                        description: req.body.description
                    }
                })
            //task: eat more
            //description:chicken
            //task: eat less
            //dewscription: chicken
                .then(result =>{
                   console.log('updated task entry')
                   res.json('Updated task in db')
                })
                .catch(err => console.error(err))
            })
           
            .catch(err => console.error(err))
        })
        app.delete('/notes',(req,res)=>{
            notesCollection.deleteOne({task: req.body.task})
            .then(result =>{
                console.log('deleted one from database')
                res.json('ToDo deleted')
        })
        .catch(err => console.error(err))
        })
        app.listen(process.env.PORT || PORT, ()=>{
            console.log(`The server is running on Port ${PORT}`)
        })
    })
    .catch(err => console.error(err))
    // (err,client)=>{
    // if(err){
    //     console.error(err)
    // }
    // console.log('You have connected to the Database')
    // const db = client.db('Notes-API')


