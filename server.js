// Various imports needed to run/use express, paths, and fs.
const express = require('express');
const path = require('path');
const fs = require('fs');

//functions imported from helper file
const { readAndAppend, writeToFile, readFromFile, randId } = require('./helpers/fsUtils');

// Setting port
const PORT = process.env.PORT || 3001;

// Setting our express app
const app = express();

// Allowing user to send and recieve json 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sets public folder to public to be seen by user
app.use(express.static('public'));

// Sets our main path 
app.get('/', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/index.html'))
);

// Sets our notes path that will be accessable to user by selecting button on main page
app.get('/notes', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/notes.html'))
);

// Route set for getting data from json. Allows users to see notes in UI. Developers can go to this route to visualize json data.
app.get('/api/notes', (req, res) =>
  readFromFile('./db/db.json').then((data) => res.json(JSON.parse(data)))
);

// Route set for posting data from json. Allows users to set notes in UI. 
app.post('/api/notes', (req, res) => {
  // Destructuring assignment for the items in req.body
  const { title, text } = req.body;

  // If all the required properties are present
  if (title && text ) {
    // Variable for the object we will save
    const newNote = {
      title,
      text,
      id: randId(),
    };

    // Using read and append funciton that will read json file and parse it into json for adding new note into json array
    readAndAppend(newNote, './db/db.json');
    
    // Returns responde if success
    const response = {
      status: 'success',
      body: newNote,
    };

    res.json(response);
  } else {
    res.json('Error in posting feedback');
  }
});

// Route that allows deletion by id.
app.delete('/api/notes/:id', (req, res) => {
  const noteID = req.params.id;
  readFromFile('./db/db.json')
    .then((data) => JSON.parse(data))
    .then((json) => {
      // Make a new array of all tips except the one with the ID provided in the URL
      const result = json.filter((note) => note.id !== noteID);

      // Save that array to the filesystem
      writeToFile('./db/db.json', result);

      // Respond to the DELETE request
      res.json(`Item ${noteID} has been deleted 🗑️`);
    });
});

// Wildcard route will send you to index page
app.get('*', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/index.html'))
);

// Allows app to listen to assigned port
app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT} 🚀`)
);
