//connect the notes.html to the index.html
//requirer in all the appropriate files etc
// build back end
//deploy on heroku

const express = require("express");
const path = require("path");
const fs = require("fs");
const util = require("util");

const PORT = process.env.PORT || 3001;
const app = express();

//middleware used to parse JSON and urlencoded from data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));

//GET route for index.html
app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "/public/index.html"))
);

//get route for note.html
app.get("/notes", (req, res) =>
  res.sendFile(path.join(__dirname, "/public/notes.html"))
);

// Promise version of fs.readFile
const readFromFile = util.promisify(fs.readFile);

const writeToFile = (destination, content) =>
  fs.writeFile(destination, JSON.stringify(content, null, 4), (err) =>
    err ? console.error(err) : console.info(`\nData written to ${destination}`)
  );

const readAndAppend = (content, file) => {
  fs.readFile(file, "utf8", (err, data) => {
    if (err) {
      console.error(err);
    } else {
      const parsedData = JSON.parse(data);
      parsedData.push(content);
      writeToFile(file, parsedData);
    }
  });
};

// GET Route for retrieving all the notes
app.get("/api/db", (req, res) => {
  console.info(`${req.method} request received for tips`);
  readFromFile("./db/db.json").then((data) => res.json(JSON.parse(data)));
});

// POST Route for a note
app.post("/api/db", (req, res) => {
  console.info(`${req.method} request received to add a note`);

  const { title, text } = req.body;

  if (req.body) {
    const newNote = {
      title,
      text,
    };

    readAndAppend(newNote, "./db/db.json");
    res.json(`Note added successfully `);
  } else {
    res.error("Error in adding note");
  }
});

app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT}`)
);
