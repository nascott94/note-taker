//dependencies
const express = require("express");
const path = require("path");
const fs = require("fs");
const util = require("util");
const PORT = process.env.PORT || 3001;
const app = express();
const database = require("./db/db");

//middleware used to parse JSON and urlencoded from data, need for api
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

// GET Route for retrieving all the notes
app.get("/api/notes", (req, res) => {
  console.info(`${req.method} request received for notes`);
  readFromFile(path.join(__dirname, "/db/db.json"), "utf8").then((data) =>
    res.json(JSON.parse(data))
  );
});

// Promise version of fs.readFile
const readFromFile = util.promisify(fs.readFile);

/**
 *  Function to write data to the JSON file given a destination and some content
 *  @param {string} destination The file you want to write to.
 *  @param {object} content The content you want to write to the file.
 *  @returns {void} Nothing
 */

const writeToFile = (destination, content) =>
  fs.writeFile(destination, JSON.stringify(content, null, 4), (err) =>
    err ? console.error(err) : console.info(`\nData written to ${destination}`)
  );

/**
 *  Function to read data from a given a file and append some content
 *  @param {object} content The content you want to append to the file.
 *  @param {string} file The path to the file you want to save to.
 *  @returns {void} Nothing
 */

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

// POST Route for a note
app.post("/api/notes", (req, res) => {
  console.info(`${req.method} request received to add a note`);

  const { title, text } = req.body;
  readFromFile(path.join(__dirname, "/db/db.json"), "utf8").then((data) => {
    if (title && text) {
      const newNote = {
        title,
        text,
        id: data.length + 1,
      };
      readAndAppend(newNote, "./db/db.json");

      const response = {
        status: "success",
        body: newNote,
      };

      res.json(response);
    } else {
      res.error("Error in adding note");
    }
  });
});

// app.delete("/api/notes/:id", (req, res) => {
//   console.log(req.params);
//   //req equal to the index
//   readFromFile(path.join(__dirname, "/db/db.json"), "utf8").then((data) => {
//     var notes = JSON.parse(data);
//     notes.splice(req.params.id, 1);
//     //rewrite file
//     res.JSON;
//   });
// });

//delete route...only working for recently added notes
// deleting note by id
app.delete("/api/notes/:id", (req, res) => {
  console.log(req.params);
  let jsonFilePath = path.join(__dirname, "/db/db.json");
  // finding the id using a for loop
  for (let i = 0; i < database.length; i++) {
    if (database[i].id == req.params.id) {
      // Splice takes i position, and then deletes the 1 note.
      database.splice(i, 1);
      break;
    }
  }
  // rewrite the db json file without the deleted note
  fs.writeFileSync(jsonFilePath, JSON.stringify(database), (err) => {
    if (err) {
      return console.log(err);
    } else {
      console.log("Your note was deleted!");
    }
  });
  res.json(database);
});

//listening and set up server
app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT}`)
);
