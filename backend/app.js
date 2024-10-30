// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// Update this with your MongoDB connection string for production
const mongoDBURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/daily_schedule';

// MongoDB connection
mongoose.connect(mongoDBURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected!'))
.catch(err => console.error('MongoDB connection error:', err));

// Task Schema
const taskSchema = new mongoose.Schema({
  text: String,
  completed: { type: Boolean, default: false },
  lastUpdated: { type: String, default: new Date().toLocaleString() },
});

const Task = mongoose.model('Task', taskSchema);

// Notes Schema
const noteSchema = new mongoose.Schema({
  text: { type: String, required: true },
  date: { type: String, required: true },
  dayTime: { type: String, required: true },
});

const Note = mongoose.model('Note', noteSchema);

// Weekly Timetable Schema
const timetableSchema = new mongoose.Schema({
  day: { type: String, required: true },
  hourIndex: { type: Number, required: true },
  task: { type: String, required: true },
});

const Timetable = mongoose.model('Timetable', timetableSchema);

// Progress Tracker Schema
const progressSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  percentage: { type: Number, required: true },
  note: { type: String },
  lastUpdated: { type: String, default: new Date().toLocaleString() },
});

const Progress = mongoose.model('Progress', progressSchema);

// API Routes for Tasks
app.get('/tasks', async (req, res) => {
  const tasks = await Task.find();
  res.json(tasks);
});

app.post('/tasks', async (req, res) => {
  const newTask = new Task(req.body);
  await newTask.save();
  res.json(newTask);
});

app.put('/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const updatedTask = await Task.findByIdAndUpdate(id, req.body, { new: true });
  res.json(updatedTask);
});

app.delete('/tasks/:id', async (req, res) => {
  const { id } = req.params;
  await Task.findByIdAndDelete(id);
  res.sendStatus(204);
});

// API Routes for Notes
app.get('/api/notes', async (req, res) => {
  const notes = await Note.find();
  res.json(notes);
});

app.post('/api/notes', async (req, res) => {
  const newNote = new Note(req.body);
  await newNote.save();
  res.json(newNote);
});

app.put('/api/notes/:id', async (req, res) => {
  const { id } = req.params;
  const updatedNote = await Note.findByIdAndUpdate(id, req.body, { new: true });
  res.json(updatedNote);
});

app.delete('/api/notes/:id', async (req, res) => {
  const { id } = req.params;
  await Note.findByIdAndDelete(id);
  res.sendStatus(204);
});

// API Routes for Weekly Timetable
app.get('/api/timetable', async (req, res) => {
  const timetable = await Timetable.find();
  res.json(timetable);
});

app.post('/api/timetable', async (req, res) => {
  const newEntry = new Timetable(req.body);
  await newEntry.save();
  res.json(newEntry);
});

app.put('/api/timetable/:id', async (req, res) => {
  const { id } = req.params;
  const updatedEntry = await Timetable.findByIdAndUpdate(id, req.body, { new: true });
  res.json(updatedEntry);
});

app.delete('/api/timetable/:id', async (req, res) => {
  const { id } = req.params;
  await Timetable.findByIdAndDelete(id);
  res.sendStatus(204);
});

// API Routes for Progress Tracker
app.get('/api/progress', async (req, res) => {
  const progress = await Progress.find();
  res.json(progress);
});

app.post('/api/progress', async (req, res) => {
  const newProgress = new Progress(req.body);
  await newProgress.save();
  res.json(newProgress);
});

app.put('/api/progress/:id', async (req, res) => {
  const { id } = req.params;
  const updatedProgress = await Progress.findByIdAndUpdate(id, req.body, { new: true });
  res.json(updatedProgress);
});

app.delete('/api/progress/:id', async (req, res) => {
  const { id } = req.params;
  await Progress.findByIdAndDelete(id);
  res.sendStatus(204);
});

// Define the schema and model for exam records
const examSchema = new mongoose.Schema({
  examName: String,
  examDate: String,
  subjects: [String],
  marks: [Number],
  maxMarks: [Number],
});

const Exam = mongoose.model("Exam", examSchema);

// API routes for Exam records
app.get("/api/exams", async (req, res) => {
  try {
    const exams = await Exam.find();
    res.json(exams);
  } catch (err) {
    res.status(500).json({ message: "Error fetching exams", error: err });
  }
});

// Add a new exam record
app.post("/api/exams", async (req, res) => {
  const { examName, examDate, subjects, marks, maxMarks } = req.body;
  try {
    const newExam = new Exam({ examName, examDate, subjects, marks, maxMarks });
    const savedExam = await newExam.save();
    res.json(savedExam);
  } catch (err) {
    res.status(500).json({ message: "Error adding exam", error: err });
  }
});

// Delete an exam record by ID
app.delete("/api/exams/:id", async (req, res) => {
  try {
    await Exam.findByIdAndDelete(req.params.id);
    res.json({ message: "Exam deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting exam", error: err });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

