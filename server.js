//import
import express, { json, response } from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

mongoose.connect("mongodb://localhost:27017/test");

const SECRET_KEY = "secret_key";

//database that stores the names and passwords that allow you to connect to the site
const users = [
  {
    id: 1,
    username: "elo",
    password: "coucou",
  },
  {
    id: 2,
    username: "prof",
    password: "salut",
  },
];

//database that stores users' email addresses
const clientSchema = new mongoose.Schema({
  mail: { type: String, required: true },
});

const Client = mongoose.model("Client", clientSchema);

//login interface
app.get("/", (request, response) => {
  response.send(`
    <form action="/signin" method="post">
    <div>
      <label for="username">Nom d'utilisateur:</label>
      <input type="text" id="username" name="username">
    </div>
    <div>
      <label for="password">Mot de passe:</label>
      <input type="password" id="password" name="password">
    </div>
    <button type="submit">Valider</button>
    </form>
  `);
});

//checks the login information
app.post("/signin", (req, res) => {
  const { username, password } = req.body;
  const user = users.find((u) => u.username === username);
  if (!user) {
    console.error(`User with username "${username}" not found`);
    return res.status(400).send(`User with username "${username}" not found`);
  }

  if (user.password !== password)
    return res.status(400).send(`Invalid password "${password}"`);

  const currentTime = Math.floor(Date.now() / 1000);
  const expiryTime = currentTime + 10 * 60; // token expires in 10 minutes
  const token = jwt.sign(
    {
      sub: user.id,
      iat: currentTime,
      exp: expiryTime,
    },
    SECRET_KEY
  );
  //if the information is correct then it redirects to the menu
  res.redirect("/menu");
});

//creation of LsCustoms / suburban / destination
const LsCustoms = mongoose.model("LsCustoms", {
  street: String,
  district: String,
  city: String,
});
const SubUrban = mongoose.model("SubUrban", {
  street: String,
  district: String,
  city: String,
});
const Destination = mongoose.model("Destination", {
  identifier: String,
  street: String,
  district: String,
  city: String,
});

//interface that presents the menu
app.get("/menu", (request, response) => {
  response.send(`
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
    </head>
    <style>
        body {
            color: #FFFFFF;
            font-family: "Copperplate", Fantasy;
            background-color: black;
            font-size: 35px;
        }
        a {
            color: #FFD700;
            font-size: 15px;
        }
        p {
            color: #2E8B57;
            font-size: 20px;
        }
        </style>
    <body>
        <h1>Bienvenue sur GrandTheftAuto V Planner ! </h1>
        <p>Vous pourrez ici planifier vos futurs voyages <br></p>
        <a href="/lscustoms">LS Customs</a>
        <p></p>
        <img src="https://img.gta5-mods.com/q85-w800/images/nerdcubed-los-santos-customs/8d402a-2015-10-15_00020.jpg" alt="LS Custom">
        <p><br></p>
        <a href="/suburban">SUB Urban</a>
        <p></p>
        <img src="https://vignette1.wikia.nocookie.net/gtawiki/images/1/18/Suburban_Hawick_Store.jpg/revision/latest?cb=20140807025119" alt="SubUrban">
        <p><br></p>
        <a href="/destinations">Destination</a>
        <p></p>
        <img src="https://i.ytimg.com/vi/yNxENNsKTjE/maxresdefault.jpg" alt="Map">
        <p><br></p>
        <a href="/finalchoice">Valider ma destination</a>
    </body>
    </html>
  `);
});

//create LsCustoms
app.post("/lscustoms", (req, res) => {
  const lsCustomsToSave = new LsCustoms(req.body);
  lsCustomsToSave.save().then((ls) => res.json(ls));
});

//create suburban
app.post("/suburban", (req, res) => {
  const subUrbanToSave = new SubUrban(req.body);
  subUrbanToSave.save().then((sub) => res.json(sub));
});

//read one LsCustoms by ID
app.get("/lscustoms/:id", async (req, res) => {
  LsCustoms.findById(req.params.id)
    .then((ls) => res.json(ls))
    .catch(() => res.status(404).end());
});

//read one suburban by id
app.get("/suburban/:id", (req, res) => {
  SubUrban.findById(req.params.id)
    .then((sub) => res.json(sub))
    .catch(() => res.status(404).end());
});

// Read All LsCustomss
app.get("/lscustoms", async (req, res) => {
  LsCustoms.find()
    .then((ls) => res.json(ls))
    .catch(() => res.status(404).end());
});

// Read All suburbans
app.get("/suburban", async (req, res) => {
  SubUrban.find()
    .then((sub) => res.json(sub))
    .catch(() => res.status(404).end());
});

// Update one LsCustoms by ID
app.put("/lscustoms/:id", async (req, res) => {
  LsCustoms.findByIdAndUpdate(req.params.id, req.body)
    .then((ls) => res.json(ls))
    .catch(() => res.status(404).end());
  response.send({
    message: `Le LsCustoms ${request.params.id} a été modifié`,
  });
});

// Update one suburban by ID
app.put("/suburban/:id", async (req, res) => {
  SubUrban.findByIdAndUpdate(req.params.id, req.body)
    .then((sub) => res.json(sub))
    .catch(() => res.status(404).end());
  response.send({
    message: `Le suburban ${request.params.id} a été modifié`,
  });
});

// Delete one LsCustoms by ID
app.delete("/lscustoms/:id", async (req, res) => {
  LsCustoms.findOneAndDelete(req.params.id)
    .then((ls) => res.json(ls))
    .catch(() => res.status(404).end());
});

// Delete one suburban by ID
app.delete("/suburban/:id", async (req, res) => {
  SubUrban.findOneAndDelete(req.params.id)
    .then((sub) => res.json(sub))
    .catch(() => res.status(404).end());
});

//research by street - ls customs
app.post("/searchlscustoms/:street", (req, res) => {
  console.log(req.params);
  LsCustoms.find({
    street: req.params.street,
  }).then((ls) => {
    res.send(ls);
  });
});

//research by street - suburban
app.post("/searchsuburban/:street", (req, res) => {
  console.log(req.params);
  SubUrban.find({
    street: req.params.street,
  }).then((sub) => {
    res.send(sub);
  });
});

//Add destination - los santos customs
app.post("/destinations-lscustoms/:id", async (req, res) => {
  const custom = await LsCustoms.findById(req.params.id);
  const v = await Destination.findOne({ identifier: custom.id });

  if (v) {
    return res.json({ message: "Already added" });
  }

  const destination = Destination.create({
    identifier: custom.id,
    street: custom.street,
    district: custom.district,
    city: custom.city,
  });

  res.json(destination);
});

//Add destination - sub urban
app.post("/destinations-suburban/:id", async (req, res) => {
  const urban = await SubUrban.findById(req.params.id);
  const v = await Destination.findOne({ identifier: urban.id });

  if (v) {
    return res.json({ message: "Already added" });
  }

  const destination = await Destination.create([
    {
      identifier: urban.id,
      street: urban.street,
      district: urban.district,
      city: urban.city,
    },
  ]);

  res.json(destination);
});

//Delete one destination by ID
app.delete("/destinations/:identifier", async (req, res) => {
  Destination.findOneAndDelete({ identifier: req.params.identifier })
    .then((sub) => res.json(sub))
    .catch(() => res.status(404).end());
});

// Read All destinations
app.get("/destinations", (req, res) => {
  Destination.find()
    .then((ls) => res.json(ls))
    .catch((c) => res.status(404).end(c));
});

//validation du choix avec une adresse mail
app.get("/finalchoice", (req, res) => {
  res.send(`
    <body>
    <p>Veuillez entrer votre adresse mail afin de valider votre voyage : </p>
    </body>
    <form action="/email" method="post">
      <input type="email" name="email">
      <button type="submit">Valider</button>
    </form>
  `);
});

//success screen to tell the user that everything went fine
app.post("/email", async (req, res) => {
  const email = req.body.email;

  const client = new Client({
    mail: email,
  });

  try {
    await client.save();
    res.send({ message: "Votre voyage a été enregistré avec succès" });
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get("*", (req, res) => {
  res.status(404).end();
});

// J'attache mon serveur à un port: le `2609`
app.listen(2609, () => {
  console.log(`Server Started at http://localhost:${2609}`);
});
