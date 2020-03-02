const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const fs = require("fs");
const util = require("util");
const path = require("path");
const uni = require("uniqid");

const asyncRead = util.promisify(fs.readFile);
const asyncWrite = util.promisify(fs.writeFile);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "/public")));

app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`)
});

app.get("/api/notes", (req, res) => {
    asyncRead(path.join(__dirname, "/db/db.json")).then(response => {
        res.json(JSON.parse(response));
    });
});

app.post("/api/notes", (req, res) => {
    asyncRead(path.join(__dirname, "/db/db.json")).then(response => {
        let notes = JSON.parse(response);
        let newID = uni();
        let newNote = {
            id: newID,
            title: req.body.title,
            text: req.body.text
        }
        notes.push(newNote);
        asyncWrite(path.join(__dirname, "/db/db.json"), JSON.stringify(notes));
        res.end(newID);
    });
});

app.delete("/api/notes/:id", (req, res) => {
    deleteNote(req.params.id, res);
});

app.get("/notes", (req, res) => {
    res.sendFile(path.join(__dirname, "/public/notes.html"));
});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "/public/index.html"));
});


function deleteNote(noteId, res) {
    asyncRead(path.join(__dirname, "/db/db.json")).then(response => {
        let notes = JSON.parse(response);
        notes.forEach((element, i) => {
            if (element.id === noteId) {
                notes.splice(i, 1);
            }
        });
        asyncWrite(path.join(__dirname, "/db/db.json"), JSON.stringify(notes)).then(r => {
            res.sendFile(path.join(__dirname, "/public/notes.html"));
        });
    });
}