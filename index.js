const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs')
const fileUpload = require('express-fileupload');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ensly.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express()

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('service'));
app.use(fileUpload());

const port = 5000;

app.get('/', (req, res) => {
    res.send("hello from db it's working working")
})

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {

    const adminCollection = client.db("privateTutor").collection("admin");
    const orderCollection = client.db("privateTutor").collection("order");
    const reviewCollection = client.db("privateTutor").collection("review");

    app.post('/addAService', (req, res) => {
        const file = req.files.file;
        const title = req.body.title;
        const description = req.body.description;
        const newImg = file.data;
        const encImg = newImg.toString('base64');

        var image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };

        adminCollection.insertOne({ title, description, image })
            .then(result => {
                res.send(result);

            })
    })
    app.get('/service', (req, res) => {
        adminCollection.find({}).limit(3)
            .toArray((err, documents) => {
                res.send(documents);

            })
    });

    app.post('/addAOrder', (req, res) => {
        const file = req.files.file;
        const title = req.body.title;
        const name = req.body.name;
        const email = req.body.email;
        const description = req.body.description;
        const newImg = file.data;
        const encImg = newImg.toString('base64');

        var image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };

        orderCollection.insertOne({ title, description, image, name, email })
            .then(result => {
                res.send(result);


            })
    })

    app.get('/order/:email', (req, res) => {
        const emails = req.params.email;
        orderCollection.find({ email: (req.params.email) })
            .toArray((err, documents) => {
                res.send(documents);

            })
    })

    app.post('/addReview', (req, res) => {
        const review = req.body;
        reviewCollection.insertOne(review)
            .then(result => {
                res.send(result)
            })
    });
    app.get('/review', (req, res) => {
        reviewCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);

            })
    });
    app.get('/servicelist', (req, res) => {
        orderCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);

            })
    })

    app.post('/isAdmin', (req, res) => {
        const email = req.body.email;
        adminCollection.find({ email: email })
            .toArray((err, admin) => {
                res.send(admin.length > 0)
            })
    });
    app.post('/addadmin', (req, res) => {
        const email = req.body.email;
        adminCollection.insertOne({ email })
            .then(result => {
                res.send(result)
            })
    });

});


app.listen(process.env.PORT || port)