const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const MongoClient = require("mongodb").MongoClient;
require("dotenv").config();

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(fileUpload());

const port = 5000;
const ObjectID = require("mongodb").ObjectID;

app.get("/", (req, res) => {
  res.send("Welcome! Private Tutor");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ensly.mongodb.net/creativeAgency?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  const serviceCollection = client.db("privateTutor").collection("services");
  const orderCollection = client.db("privateTutor").collection("orders");
  const adminCollection = client.db("privateTutor").collection("admins");
  const reviewCollection = client.db("privateTutor").collection("reviews");

  //API's For Services
  //Add new Service to database
  app.post("/addService", (req, res) => {
    const file = req.files.file;
    const title = req.body.title;
    const description = req.body.description;

    //encodeing Image
    const newImg = file.data;
    const encImg = newImg.toString("base64");
    var image = {
      contentType: req.files.file.mimetype,
      size: req.files.file.size,
      img: Buffer.from(encImg, "base64"),
    };

    serviceCollection
      .insertOne({ title, description, image })
      .then((result) => {
        res.send(result.insertedCount > 0);
      });
  });
  // Get Services from database
  app.get("/services", (req, res) => {
    serviceCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });
  // Get The Orderd Service's Name
  app.get("/serviceOrder/:id", (req, res) => {
    serviceCollection
      .find({ _id: ObjectID(req.params.id) })
      .toArray((err, documents) => {
        res.send(documents);
      });
  });

  //API's for Orders
  //Post Order to Database
  app.post("/postOrder", (req, res) => {
    const file = req.files.file;
    const name = req.body.name;
    const email = req.body.email;
    const project = req.body.project;
    const details = req.body.details;
    const price = req.body.price;
    const status = req.body.status;

    //encodeing Image
    const newImg = file.data;
    const encImg = newImg.toString("base64");
    var image = {
      contentType: req.files.file.mimetype,
      size: req.files.file.size,
      img: Buffer.from(encImg, "base64"),
    };
    orderCollection
      .insertOne({ name, email, project, details, price, status, image })
      .then((result) => {
        res.send(result.insertedCount > 0);
      });
  });
  //Get Order Data By Email
  app.get("/getServiceByEmail", (req, res) => {
    orderCollection
      .find({ email: req.query.email })
      .toArray((err, documents) => {
        res.send(documents);
      });
  });
  //Get All Order Data
  app.get("/getAllService", (req, res) => {
    orderCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });
  //Update Order Status
  app.patch("/updateStatus", (req, res) => {
    console.log(req.query.id);
    const newStatus = req.body.status;
    orderCollection
      .updateOne(
        { _id: ObjectID(req.query.id) },
        { $set: { status: newStatus } }
      )
      .then((result) => {
        console.log(result);
        res.send(result.modifiedCount > 0);
      });
  });

  //API's for Admins
  //Make new Admin
  app.post("/makeAdmin", (req, res) => {
    const newOrder = req.body;
    adminCollection.insertOne(newOrder).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });
  //Find Admin by Email
  app.get("/findAdminByEmail", (req, res) => {
    adminCollection
      .find({ email: req.query.email })
      .toArray((err, documents) => {
        res.send(documents);
      });
  });

  //API's for Review
  //Add new Review with Image to database
  app.post("/addReview", (req, res) => {
    const file = req.files.file;
    const name = req.body.name;
    const designation = req.body.designation;
    const comment = req.body.comment;

    //encodeing Image
    const newImg = file.data;
    const encImg = newImg.toString("base64");
    var image = {
      contentType: req.files.file.mimetype,
      size: req.files.file.size,
      img: Buffer.from(encImg, "base64"),
    };

    reviewCollection
      .insertOne({ name, designation, comment, image })
      .then((result) => {
        res.send(result.insertedCount > 0);
      });
  });

  //Get reviews to frontEnd
  app.get("/reviews", (req, res) => {
    reviewCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });
});

app.listen(process.env.PORT || port, () => {
  console.log("Server is Running Perfectly");
});
