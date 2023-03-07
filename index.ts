import express from "express";
import data from "./data.json";
import cors from "cors";
import bodyParser from "body-parser";
import Ajv from "ajv";
import * as fs from "fs";

//READING FILE
const readFile = () => {
  return JSON.parse(fs.readFileSync("./data.json", "utf-8"));
};

//WRITING FILE
const writeFile = (data: object) => {
  const stringifyData = JSON.stringify(data);
  fs.writeFileSync("./data.json", stringifyData);
};

const app = express();

const ajv = new Ajv();

const port = process.env.PORT || 8080;

const userSchema = {
  type: "object",
  properties: {
    title: { type: "string" },
    note: { type: "string" },
  },
  required: ["title", "note"],
  additionalProperties: false,
};

const validate = ajv.compile(userSchema);

const corsOptions = {
  origin: "*",
};

app.use(cors(corsOptions));

app.use(bodyParser.json());

app.get("/api/notes", (req, res) => {
  res.send(
    readFile().notes.map((note: typeof data.notes[number]) => {
      return {
        id: note.id,
        title: note.title,
        note: note.note,
      };
    })
  );
});

interface NewNote {
  id: number;
  title: string;
  note: string;
}

app.post("/api/notes", (req, res) => {
  const newPost: NewNote = req.body;
  const valid = validate(newPost);

  if (!valid) {
    res.status(400).json({ error: validate.errors });
  } else {
    const file = readFile();
    newPost.id = file.notes.length + 1;
    file.notes.push(newPost);
    writeFile(file);
    res.status(201).json(newPost);
  }
});

app.put("/api/notes/:id", (req, res) => {
  const noteId = Number(req.params.id);
  const file = readFile();
  const noteIndex = file.notes.findIndex((note) => note.id === noteId);
  if (noteIndex === -1) {
    res.status(404).json({ error: "Nota não encontrada" });
  } else {
    const newNote = req.body;
    newNote.id = noteId;
    file.notes[noteIndex] = newNote;
    writeFile(file);
    res.status(200).json(newNote);
  }
});

app.delete("/api/notes/:id", (req, res) => {
  const noteId = Number(req.params.id);
  const file = readFile();
  const noteIndex = file.notes.findIndex((note) => note.id === noteId);
  if (noteIndex === -1) {
    res.status(404).json("Nota não encontrada");
  } else {
    file.notes.splice(noteIndex, 1);
    writeFile(file);
    res.status(200).json("Nota deletada com sucesso!");
  }
});

app.listen(port, () => {
  console.log(`Servidor foi iniciado na porta ${port}`);
});
