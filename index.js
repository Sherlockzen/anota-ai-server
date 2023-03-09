"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const ajv_1 = __importDefault(require("ajv"));
const fs = __importStar(require("fs"));
//READING FILE
const readFile = () => {
    return JSON.parse(fs.readFileSync("./data.json", "utf-8"));
};
//WRITING FILE
const writeFile = (data) => {
    const stringifyData = JSON.stringify(data);
    fs.writeFileSync("./data.json", stringifyData);
};
const app = (0, express_1.default)();
const ajv = new ajv_1.default();
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
app.use((0, cors_1.default)(corsOptions));
app.use(body_parser_1.default.json());
app.get("/api/notes", (req, res) => {
    const limit = parseInt(req.query.limit, 10) || 1;
    const pagination = (limit, arr) => {
        return arr.slice(0, limit);
    };
    const result = pagination(limit, readFile().notes);
    res.send(result.map((note) => {
        return {
            id: note.id,
            title: note.title,
            note: note.note,
        };
    }));
});
app.post("/api/notes", (req, res) => {
    const newPost = req.body;
    const valid = validate(newPost);
    if (!valid) {
        res.status(400).json({ error: validate.errors });
    }
    else {
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
    }
    else {
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
    }
    else {
        file.notes.splice(noteIndex, 1);
        writeFile(file);
        res.status(200).json("Nota deletada com sucesso!");
    }
});
app.listen(port, () => {
    console.log(`Servidor foi iniciado na porta ${port}`);
});
