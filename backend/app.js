// server.js

// Load Environment Variables
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve Static Files with Correct MIME Type for CSS
app.use('/static', express.static('static', {
  setHeaders: (res, path) => {
    if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
  }
}));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/daily_schedule', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected!'))
  .catch(err => console.error('MongoDB connection error:', err));

// Task Schema and Model
const taskSchema = new mongoose.Schema({
  text: String,
  completed: { type: Boolean, default: false },
  lastUpdated: { type: String, default: new Date().toISOString() },
});
const Task = mongoose.model('Task', taskSchema);

// Note Schema and Model
const noteSchema = new mongoose.Schema({
  text: { type: String, required: true },
  date: { type: String, required: true },
  dayTime: { type: String, required: true },
});
// Routes for Task Management
app.route('/tasks')
  .get(async (req, res) => {
    try {
      const tasks = await Task.find();
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching tasks', error });
    }
  })
  .post(async (req, res) => {
    try {
      const newTask = new Task(req.body);
      await newTask.save();
      res.status(201).json(newTask);
    } catch (error) {
      res.status(500).json({ message: 'Error adding task', error });
    }
  });

app.route('/tasks/:id')
  .put(async (req, res) => {
    try {
      const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
      res.json(updatedTask);
    } catch (error) {
      res.status(500).json({ message: 'Error updating task', error });
    }
  })
  .delete(async (req, res) => {
    try {
      await Task.findByIdAndDelete(req.params.id);
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ message: 'Error deleting task', error });
    }
  });

// Routes for Notes Management
app.route('/api/notes')
  .get(async (req, res) => {
    try {
      const notes = await Note.find();
      res.json(notes);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching notes', error });
    }
  })
  .post(async (req, res) => {
    try {
      const newNote = new Note(req.body);
      await newNote.save();
      res.status(201).json(newNote);
    } catch (error) {
      res.status(500).json({ message: 'Error adding note', error });
    }
  });

app.route('/api/notes/:id')
  .put(async (req, res) => {
    try {
      const updatedNote = await Note.findByIdAndUpdate(req.params.id, req.body, { new: true });
      res.json(updatedNote);
    } catch (error) {
      res.status(500).json({ message: 'Error updating note', error });
    }
  })
  .delete(async (req, res) => {
    try {
      await Note.findByIdAndDelete(req.params.id);
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ message: 'Error deleting note', error });
    }
  });

// Other routes (Timetable, Exams, Quick Links, Subjects, PDFs, Progress Tracker) follow the same structure...
// Refer to the original code for route setup or add as needed.

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
// Subject schema with a unique attendance entry per subject
const attendanceSchema = new mongoose.Schema({
  date: String,
  status: String, // "present" or "absent"
});

const subjectSchema = new mongoose.Schema({
  name: String,
  attendance: [attendanceSchema],
});

const Subject = mongoose.model("Subject", subjectSchema);

// Get all subjects
app.get("/api/subjects", async (req, res) => {
  const subjects = await Subject.find();
  res.json(subjects);
});

// Add a new subject
app.post("/api/subjects", async (req, res) => {
  const subject = new Subject({ name: req.body.name, attendance: [] });
  await subject.save();
  res.json(subject);
});

// Delete a subject
app.delete("/api/subjects/:id", async (req, res) => {
  await Subject.findByIdAndDelete(req.params.id);
  res.json({ message: "Subject deleted" });
});

// Mark attendance (multiple records allowed per day)
app.post("/api/subjects/:id/attendance", async (req, res) => {
  const { date, status } = req.body;
  const subject = await Subject.findById(req.params.id);

  if (!subject) return res.status(404).json({ message: "Subject not found" });

  subject.attendance.push({ date, status });
  await subject.save();
  res.json(subject);
});

// Define the PDF schema
const pdfSchema = new mongoose.Schema({
  name: String,
  data: Buffer,
  createdAt: { type: Date, default: Date.now }
});

const PDF = mongoose.model('PDF', pdfSchema);

// Configure Multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Upload PDF
app.post('/api/upload', upload.single('pdf'), async (req, res) => {
  try {
    const newPDF = new PDF({
      name: req.file.originalname,
      data: req.file.buffer
    });
    await newPDF.save();
    res.status(200).json({ message: 'PDF uploaded successfully!' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload PDF' });
  }
});

// Fetch all PDFs
app.get('/api/pdfs', async (req, res) => {
  try {
    const pdfs = await PDF.find({}, 'name _id');
    res.status(200).json(pdfs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch PDFs' });
  }
});

// Fetch single PDF by ID and render as file download
app.get('/api/pdfs/:id', async (req, res) => {
  try {
    const pdf = await PDF.findById(req.params.id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${pdf.name}"`
    });
    res.send(pdf.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch PDF' });
  }
});

// Delete PDF by ID
app.delete('/api/pdfs/:id', async (req, res) => {
  try {
    await PDF.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'PDF deleted successfully!' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete PDF' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});