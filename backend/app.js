// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json()); // Parse JSON bodies

// MongoDB connection string
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
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tasks', error });
  }
});

app.post('/tasks', async (req, res) => {
  try {
    const newTask = new Task(req.body);
    await newTask.save();
    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ message: 'Error adding task', error });
  }
});

app.put('/tasks/:id', async (req, res) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Error updating task', error });
  }
});

app.delete('/tasks/:id', async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ message: 'Error deleting task', error });
  }
});

// API Routes for Notes
app.get('/api/notes', async (req, res) => {
  try {
    const notes = await Note.find();
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notes', error });
  }
});

app.post('/api/notes', async (req, res) => {
  try {
    const newNote = new Note(req.body);
    await newNote.save();
    res.status(201).json(newNote);
  } catch (error) {
    res.status(500).json({ message: 'Error adding note', error });
  }
});

app.put('/api/notes/:id', async (req, res) => {
  try {
    const updatedNote = await Note.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedNote);
  } catch (error) {
    res.status(500).json({ message: 'Error updating note', error });
  }
});

app.delete('/api/notes/:id', async (req, res) => {
  try {
    await Note.findByIdAndDelete(req.params.id);
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ message: 'Error deleting note', error });
  }
});

// Weekly Timetable Schema
const timetableSchema = new mongoose.Schema({
  day: { type: String, required: true },
  hourIndex: { type: Number, required: true },
  task: { type: String, required: true },
});

// Create Timetable model
const Timetable = mongoose.model("Timetable", timetableSchema);

// API Routes for Weekly Timetable

// Get all timetable entries
app.get('/api/timetable', async (req, res) => {
  try {
    const timetable = await Timetable.find();
    res.json(timetable);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching timetable', error });
  }
});

// Add a new timetable entry
app.post('/api/timetable', async (req, res) => {
  try {
    const newEntry = new Timetable(req.body);
    await newEntry.save();
    res.status(201).json(newEntry);
  } catch (error) {
    res.status(500).json({ message: 'Error adding timetable entry', error });
  }
});

// Update an existing timetable entry
app.put('/api/timetable/:id', async (req, res) => {
  try {
    const updatedEntry = await Timetable.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedEntry);
  } catch (error) {
    res.status(500).json({ message: 'Error updating timetable entry', error });
  }
});

// Delete a timetable entry
app.delete('/api/timetable/:id', async (req, res) => {
  try {
    await Timetable.findByIdAndDelete(req.params.id);
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ message: 'Error deleting timetable entry', error });
  }
});

// API Routes for Progress Tracker
app.get('/api/progress', async (req, res) => {
  try {
    const progress = await Progress.find();
    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching progress', error });
  }
});

app.post('/api/progress', async (req, res) => {
  try {
    const newProgress = new Progress(req.body);
    await newProgress.save();
    res.status(201).json(newProgress);
  } catch (error) {
    res.status(500).json({ message: 'Error adding progress', error });
  }
});

app.put('/api/progress/:id', async (req, res) => {
  try {
    const updatedProgress = await Progress.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedProgress);
  } catch (error) {
    res.status(500).json({ message: 'Error updating progress', error });
  }
});

app.delete('/api/progress/:id', async (req, res) => {
  try {
    await Progress.findByIdAndDelete(req.params.id);
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ message: 'Error deleting progress', error });
  }
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
    res.status(201).json(savedExam);
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
const quickLinkSchema = new mongoose.Schema({
  name: String,
  url: String,
});

const QuickLink = mongoose.model('QuickLink', quickLinkSchema);

// Routes
// Get all quick links
app.get('/api/quick-links', async (req, res) => {
  try {
    const links = await QuickLink.find();
    res.json(links);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching quick links' });
  }
});

// Add a new quick link
app.post('/api/quick-links', async (req, res) => {
  const newLink = new QuickLink(req.body);
  try {
    const savedLink = await newLink.save();
    res.status(201).json(savedLink);
  } catch (error) {
    res.status(400).json({ message: 'Error adding quick link' });
  }
});

// Delete a quick link
app.delete('/api/quick-links/:id', async (req, res) => {
  try {
    await QuickLink.findByIdAndDelete(req.params.id);
    res.status(204).send(); // No content
  } catch (error) {
    res.status(400).json({ message: 'Error deleting quick link' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});