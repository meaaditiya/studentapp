
// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const XLSX = require("xlsx");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 5001;


// Middleware
app.use(cors());
app.use(bodyParser.json()); // Parse JSON bodies

// MongoDB connection string
const mongoDBURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/daily_schedule';

// MongoDB connection
mongoose.connect(mongoDBURI)
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



// Define the Timetable schema and model
const timetableSchema = new mongoose.Schema({
  headers: [String],
  data: [[String]], // Array of arrays to store rows of timetable data
});

const Timetable = mongoose.model("Timetable", timetableSchema);

// GET endpoint to retrieve the timetable data
app.get("/api/timetable", async (req, res) => {
  try {
    const timetable = await Timetable.findOne();
    if (timetable) {
      res.json({ headers: timetable.headers, data: timetable.data });
    } else {
      res.json({ headers: [], data: [] }); // Send empty data if no timetable exists
    }
  } catch (error) {
    console.error("Error fetching timetable:", error);
    res.status(500).send("Error fetching timetable data.");
  }
});

// POST endpoint to save timetable data
app.post("/api/timetable", async (req, res) => {
  const { headers, data } = req.body;

  try {
    // Remove any existing timetable data before saving the new one
    await Timetable.deleteMany();
    const newTimetable = new Timetable({ headers, data });
    await newTimetable.save();
    res.send("Timetable uploaded successfully!");
  } catch (error) {
    console.error("Error saving timetable:", error);
    res.status(500).send("Could not upload timetable.");
  }
});
// Update single cell
app.patch('/api/timetable/cell', async (req, res) => {
  try {
    const { row, column, value } = req.body;
    const currentTable = await Timetable.findOne().sort({ lastUpdated: -1 });
    
    if (!currentTable) {
      return res.status(404).json({ error: 'No timetable found' });
    }

    // Update the specific cell
    currentTable.data[row][column] = value;
    currentTable.lastUpdated = new Date();
    await currentTable.save();

    res.json({ message: 'Cell updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update cell' });
  }
});

// Update header
app.patch('/api/timetable/header', async (req, res) => {
  try {
    const { headerIndex, value } = req.body;
    const currentTable = await Timetable.findOne().sort({ lastUpdated: -1 });
    
    if (!currentTable) {
      return res.status(404).json({ error: 'No timetable found' });
    }

    // Update the specific header
    currentTable.headers[headerIndex] = value;
    currentTable.lastUpdated = new Date();
    await currentTable.save();

    res.json({ message: 'Header updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update header' });
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

// Schema Definitions
const examTypeSchema = new mongoose.Schema({
  name: String,
  maxMarks: Number,
  internalMarks: Number
});

const subjectSchema = new mongoose.Schema({
  name: { 
    type: String, 
    unique: true 
  },
  marksBasedInternal: { 
    type: Number, 
    default: 0 
  },
  attendanceBasedInternal: { 
    type: Number, 
    default: 1 
  },
  taMarks: {
    type: Number,
    default: 0
  }
});

const examSchema = new mongoose.Schema({
  examType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ExamType'
  },
  examName: String,
  examDate: String,
  subjects: [String],
  marks: [Number],
  maxMarks: [Number],
  attendance: [Number]
});

// Models
const ExamType = mongoose.model('ExamType', examTypeSchema);
const Subject = mongoose.model('Subject', subjectSchema);
const Exam = mongoose.model('Exam', examSchema);

// API Routes

// Exam Types
app.get('/api/examTypes', async (req, res) => {
  try {
    const examTypes = await ExamType.find();
    res.json(examTypes);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching exam types' });
  }
});

app.post('/api/examTypes', async (req, res) => {
  try {
    const examType = new ExamType(req.body);
    await examType.save();
    res.status(201).json(examType);
  } catch (error) {
    res.status(500).json({ error: 'Error creating exam type' });
  }
});

// Subjects
app.get('/api/subjects', async (req, res) => {
  try {
    const subjects = await Subject.find();
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching subjects' });
  }
});

app.post('/api/subjects', async (req, res) => {
  try {
    const { name, marksBasedInternal,attendanceBasedInternal } = req.body;
    const subject = new Subject({
      name,
      marksBasedInternal: marksBasedInternal || 0,
      attendanceBasedInternal: attendanceBasedInternal || 1
    });
    await subject.save();
    res.status(201).json(subject);
  } catch (error) {
    if (error.code === 11000) {
      const existingSubject = await Subject.findOne({ name: req.body.name });
      res.json(existingSubject);
    } else {
      res.status(500).json({ error: 'Error creating subject' });
    }
  }
});

app.put('/api/subjects/:id', async (req, res) => {
  try {
    const { marksBasedInternal, attendanceBasedInternal } = req.body;
    const subject = await Subject.findByIdAndUpdate(
      req.params.id,
      { marksBasedInternal, attendanceBasedInternal },
      { new: true }
    );
    res.json(subject);
  } catch (error) {
    res.status(500).json({ error: 'Error updating subject' });
  }
});

// Exams
app.get('/api/exams', async (req, res) => {
  try {
    const exams = await Exam.find().populate('examType');
    res.json(exams);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching exams' });
  }
});

app.post('/api/exams', async (req, res) => {
  try {
    const exam = new Exam(req.body);
    await exam.save();
    const populatedExam = await Exam.findById(exam._id).populate('examType');
    res.status(201).json(populatedExam);
  } catch (error) {
    res.status(500).json({ error: 'Error creating exam' });
  }
});

// Update the delete exam endpoint to handle internal marks
app.delete('/api/exams/:id', async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ error: 'Exam not found' });

    const examType = await ExamType.findById(exam.examType);
    if (!examType) return res.status(404).json({ error: 'Exam type not found' });

    for (let i = 0; i < exam.subjects.length; i++) {
      const subjectName = exam.subjects[i];
      const mark = exam.marks[i];
      const maxMark = exam.maxMarks[i];
      
      const internalRatio = maxMark / examType.internalMarks; // internalRatio = 7
      let internalToSubtract = Math.ceil(mark / internalRatio); // Round up to the nearest integer

      await Subject.findOneAndUpdate(
        { name: subjectName },
        { $inc: { marksBasedInternal: -internalToSubtract } }
      );
    }

    await Exam.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Error in exam deletion:', error);
    res.status(500).json({ error: 'Error deleting exam' });
  }
});

// TA Marks Update Endpoint
app.put('/api/subjects/:id/ta-marks', async (req, res) => {
  try {
    const { taMarks } = req.body;
    const subject = await Subject.findByIdAndUpdate(
      req.params.id,
      { taMarks },
      { new: true }
    );
    res.json(subject);
  } catch (error) {
    res.status(500).json({ error: 'Error updating TA marks' });
  }
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
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



// Subject schema, which includes an array of attendance records


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
// Video schema and model
const videoSchema = new mongoose.Schema({
  videoId: { type: String, required: true },
  title: { type: String, required: true },
});

const Video = mongoose.model('Video', videoSchema);

// Routes

// Get all videos
app.get('/api/videos', async (req, res) => {
  try {
    const videos = await Video.find();
    res.json(videos);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Add a new video
app.post('/api/videos', async (req, res) => {
  const { videoId, title } = req.body;
  try {
    const newVideo = new Video({ videoId, title });
    await newVideo.save();
    res.status(201).json(newVideo);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a video by videoId
app.delete('/api/videos/:videoId', async (req, res) => {
  const { videoId } = req.params;
  try {
    const deletedVideo = await Video.findOneAndDelete({ videoId });
    if (!deletedVideo) {
      return res.status(404).json({ error: 'Video not found' });
    }
    res.json({ message: 'Video deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});



let excelTables = [];

const DATA_FILE_PATH = path.join(__dirname, "excelTablesData.json");

// Load data from file on server start
const loadData = () => {
  if (fs.existsSync(DATA_FILE_PATH)) {
    const rawData = fs.readFileSync(DATA_FILE_PATH);
    excelTables = JSON.parse(rawData);
  }
};

// Save data to file
const saveData = () => {
  fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(excelTables, null, 2));
};

// Call loadData on startup
loadData();

app.use(express.json());

// Get all tables
app.get("/tables", (req, res) => {
  res.json(excelTables);
});

// Add a new table
app.post("/tables", (req, res) => {
  const { headers, data, title } = req.body;
  if (!title || !headers || !data) {
    return res.status(400).json({ error: "Missing table data" });
  }

  const newTable = { headers, data, title };
  excelTables.push(newTable);
  saveData(); // Save to file after modification
  res.status(201).json({ message: "Table added successfully" });
});

// Delete a table by title
app.delete("/tables/:title", (req, res) => {
  const { title } = req.params;

  const initialLength = excelTables.length;
  excelTables = excelTables.filter((table) => table.title !== title);

  if (excelTables.length < initialLength) {
    saveData(); // Save to file after deletion
    res.status(200).json({ message: "Table deleted successfully" });
  } else {
    res.status(404).json({ error: "Table not found" });
  }
});


// Define a CalendarTask Schema
const calendarTaskSchema = new mongoose.Schema({
  date: String, // Storing date as a string (e.g., '2024-11-07')
  tasks: [String], // Array of tasks for each date
});

const CalendarTask = mongoose.model('CalendarTask', calendarTaskSchema);

// Routes
// Fetch tasks for a specific date
app.get('/api/calendar-tasks/:date', async (req, res) => {
  const { date } = req.params;
  try {
    const taskData = await CalendarTask.findOne({ date });
    res.json(taskData || { date, tasks: [] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Add a new task
app.post('/api/calendar-tasks', async (req, res) => {
  const { date, task } = req.body;
  try {
    const taskData = await CalendarTask.findOneAndUpdate(
      { date },
      { $push: { tasks: task } },
      { upsert: true, new: true }
    );
    res.json(taskData);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add task' });
  }
});

app.delete('/api/calendar-tasks', async (req, res) => {
  const { date, task } = req.query; // Extract from query instead of body
  try {
    const taskData = await CalendarTask.findOneAndUpdate(
      { date }, // Match the date
      { $pull: { tasks: task } }, // Remove the task from tasks array
      { new: true }
    );
    if (!taskData) {
      return res.status(404).json({ error: 'Task or date not found' });
    }
    res.json(taskData); // Send back the updated task list
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
});
// Question Schema
const questionSchema = new mongoose.Schema({
  number: String,
  name: String,
  link: String,
  description: String,
});

// List Schema
const listSchema = new mongoose.Schema({
  name: String,
  questions: [questionSchema],
});

const List = mongoose.model('List', listSchema);

// Middleware to ensure lists exist
const ensureListExists = async (req, res, next) => {
  const { listKey } = req.params;
  try {
    let list = await List.findOne({ name: listKey });
    if (!list) {
      // If list doesn't exist, create it
      list = new List({ name: listKey, questions: [] });
      await list.save();
    }
    next();
  } catch (err) {
    res.status(500).json({ error: 'Error ensuring list existence' });
  }
};

// API Endpoints

// Fetch all lists
app.get('/api/lists', async (req, res) => {
  try {
    const lists = await List.find({});
    res.json(lists);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch lists' });
  }
});

// Add a question to a list
app.post('/api/lists/:listKey/add', ensureListExists, async (req, res) => {
  const { listKey } = req.params;
  const { number, name, link, description } = req.body;

  try {
    const list = await List.findOne({ name: listKey });
    list.questions.push({ number, name, link, description });
    await list.save();
    res.status(201).json({ message: 'Question added successfully', list });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add question' });
  }
});

// Move a question from one list to another
app.put('/api/lists/:fromList/move/:questionId/:toList', async (req, res) => {
  const { fromList, questionId, toList } = req.params;

  try {
    const sourceList = await List.findOne({ name: fromList });
    const targetList = await List.findOne({ name: toList });

    if (!sourceList || !targetList) {
      return res.status(404).json({ error: 'Source or target list not found' });
    }

    const question = sourceList.questions.id(questionId);
    if (!question) {
      return res.status(404).json({ error: 'Question not found in source list' });
    }

    // Remove question from source list
    sourceList.questions.pull(questionId);
    await sourceList.save();

    // Add question to target list
    targetList.questions.push(question);
    await targetList.save();

    res.json({ message: 'Question moved successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to move question' });
  }
});

// Delete a question from a list
app.delete('/api/lists/:listKey/delete/:questionId', async (req, res) => {
  const { listKey, questionId } = req.params;

  try {
    const list = await List.findOne({ name: listKey });

    if (!list) {
      return res.status(404).json({ error: 'List not found' });
    }

    const question = list.questions.id(questionId);
    if (!question) {
      return res.status(404).json({ error: 'Question not found in list' });
    }

    // Remove the question from the list
    list.questions.pull(questionId);
    await list.save();

    res.json({ message: 'Question deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete question' });
  }
});
// Schema for subjects and topics
const newSubjectSchema = new mongoose.Schema({
  subjectName: { type: String, required: true },
  topics: [
    {
      date: { type: String, required: true },
      topicName: { type: String, required: true },
      unitName: { type: String, required: true },
      completed: { type: Boolean, default: false },  // Completion field
    },
  ],
});

const NewSubject = mongoose.model("NewSubject", newSubjectSchema);

// API Endpoints

// Retrieve all subjects
app.get("/newsubject", async (req, res) => {
  try {
    const subjects = await NewSubject.find();
    res.status(200).json(subjects);
  } catch (error) {
    console.error(error); // Log error details
    res.status(500).json({ message: "Error fetching subjects.", error });
  }
});

// Add a new subject
app.post("/newsubject", async (req, res) => {
  try {
    const { subjectName } = req.body;
    const newSubject = new NewSubject({ subjectName, topics: [] });
    await newSubject.save();
    res.status(201).json(newSubject);
  } catch (error) {
    console.error(error); // Log error details
    res.status(500).json({ message: "Error adding subject.", error });
  }
});

// Add a topic to a subject
app.post("/newsubject/:subjectId/topics", async (req, res) => {
  try {
    const { subjectId } = req.params;
    const { date, topicName, unitName } = req.body;

    if (!date || !topicName || !unitName) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const subject = await NewSubject.findById(subjectId);

    if (!subject) {
      return res.status(404).json({ message: "Subject not found." });
    }

    subject.topics.push({ date, topicName, unitName, completed: false });
    await subject.save();
    res.status(201).json(subject);
  } catch (error) {
    console.error(error); // Log error details
    res.status(500).json({ message: "Error adding topic.", error });
  }
});

// Toggle the completion status of a topic
app.patch("/newsubject/:subjectId/topics/:topicId", async (req, res) => {
  try {
    const { subjectId, topicId } = req.params;

    const subject = await NewSubject.findById(subjectId);

    if (!subject) {
      return res.status(404).json({ message: "Subject not found." });
    }

    const topic = subject.topics.id(topicId);

    if (!topic) {
      return res.status(404).json({ message: "Topic not found." });
    }

    topic.completed = !topic.completed; // Toggle completion status
    await subject.save();
    res.status(200).json(subject);
  } catch (error) {
    console.error(error); // Log error details
    res.status(500).json({ message: "Error toggling topic completion.", error });
  }
});

// Delete a topic

app.delete("/newsubject/:subjectId/topics/:topicId", async (req, res) => {
  try {
    const { subjectId, topicId } = req.params;
    const subject = await NewSubject.findById(subjectId);
    
    if (!subject) {
      return res.status(404).json({ message: "Subject not found." });
    }
    
    const topicIndex = subject.topics.findIndex(topic => topic._id.toString() === topicId);
    if (topicIndex === -1) {
      return res.status(404).json({ message: "Topic not found." });
    }
    
    subject.topics.splice(topicIndex, 1);
    await subject.save();
    res.status(200).json({ message: "Topic deleted successfully.", subject });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting topic.", error });
  }
});
// Delete a subject
app.delete("/newsubject/:subjectId", async (req, res) => {
  try {
    const { subjectId } = req.params;

    const subject = await NewSubject.findById(subjectId);

    if (!subject) {
      return res.status(404).json({ message: "Subject not found." });
    }

    await NewSubject.findByIdAndDelete(subjectId);// Remove the subject
    res.status(200).json({ message: "Subject deleted successfully." });
  } catch (error) {
    console.error(error); // Log error details
    res.status(500).json({ message: "Error deleting subject.", error });
  }
});
// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Serve static files from the uploads directory - UPDATED THIS LINE
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Resource Schema
const resourceSchema = new mongoose.Schema({
    subjectId: { 
        type: String, 
        required: true 
    },
    type: { 
        type: String, 
        enum: ["PDF", "YouTube"], 
        required: true 
    },
    name: { 
        type: String, 
        required: true 
    },
    url: { 
        type: String, 
        required: true 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

const Resource = mongoose.model("Resource", resourceSchema);

// Multer configuration for PDF uploads - UPDATED THIS PART
const pdfStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); // Use the absolute path
    },
    filename: (req, file, cb) => {
        // Create unique filename with original extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter for PDF uploads
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed!'), false);
    }
};

const pdfUpload = multer({ 
    storage: pdfStorage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});
// In your server.js, update these parts:


// 2. Update the resource POST route - modify the URL creation
app.post("/resources", pdfUpload.single("file"), async (req, res) => {
    try {
        const { subjectId, type, name } = req.body;

        if (!subjectId || !type || !name) {
            return res.status(400).json({ 
                error: "Subject ID, type, and name are required" 
            });
        }

        let url;
        if (type === "PDF") {
            if (!req.file) {
                return res.status(400).json({ error: "PDF file is required" });
            }
            // Store the complete URL
            url = `http://192.168.1.41:5000/uploads/${req.file.filename}`;
        } else if (type === "YouTube") {
            const { url: youtubeUrl } = req.body;
            if (!youtubeUrl || !youtubeUrl.trim()) {
                return res.status(400).json({ error: "YouTube URL is required" });
            }
            url = youtubeUrl;
        } else {
            return res.status(400).json({ error: "Invalid resource type" });
        }

        const resource = new Resource({
            subjectId,
            type,
            name,
            url
        });

        await resource.save();
        res.status(201).json(resource);
    } catch (error) {
        console.error("Error adding resource:", error);
        res.status(500).json({ error: "Error adding resource" });
    }
});

// 3. Update the delete route to handle the new URL format
app.delete("/resources/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const resource = await Resource.findById(id);

        if (!resource) {
            return res.status(404).json({ error: "Resource not found" });
        }

        if (resource.type === "PDF") {
            // Extract filename from the full URL
            const filename = resource.url.split('/').pop();
            const filePath = path.join(uploadDir, filename);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        await resource.deleteOne();
        res.json({ message: "Resource deleted successfully" });
    } catch (error) {
        console.error("Error deleting resource:", error);
        res.status(500).json({ error: "Error deleting resource" });
    }
});


// Keep existing routes
app.get("/resources", async (req, res) => {
    try {
        const resources = await Resource.find().sort({ createdAt: -1 });
        res.json(resources);
    } catch (error) {
        console.error("Error fetching resources:", error);
        res.status(500).json({ error: "Error fetching resources" });
    }
});

app.get("/resources/subject/:subjectId", async (req, res) => {
    try {
        const resources = await Resource.find({ 
            subjectId: req.params.subjectId 
        }).sort({ createdAt: -1 });
        res.json(resources);
    } catch (error) {
        console.error("Error fetching subject resources:", error);
        res.status(500).json({ error: "Error fetching subject resources" });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ 
                error: 'File size is too large. Maximum size is 10MB' 
            });
        }
        return res.status(400).json({ error: error.message });
    }
    next(error);
});

const weightEntrySchema = new mongoose.Schema({
  date: { type: String, required: true },
  time: { type: String, required: true },
  weight: { type: Number, required: true },
  height: {
    feet: { type: Number },
    inches: { type: Number },
    cm: { type: Number }
  },
  bmi: { type: Number },
  notes: { type: String }
}, { timestamps: true });
const targetWeightSchema = new mongoose.Schema({
  weight: Number,
  unit: {
    type: String,
    enum: ['kg', 'lbs'],
    default: 'kg'
  },
  userId: {
    type: String,
    default: 'default' // In a real app, this would be tied to user authentication
  }
}, { timestamps: true });
const TargetWeight = mongoose.model('TargetWeight', targetWeightSchema);
const WeightEntry = mongoose.model('WeightEntry', weightEntrySchema);

// Routes
app.get('/api/weight-entries', async (req, res) => {
  try {
    const entries = await WeightEntry.find()
      .sort({ date: -1, time: -1 });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching entries' });
  }
});

app.post('/api/weight-entries', async (req, res) => {
  try {
    const newEntry = new WeightEntry(req.body);
    await newEntry.save();
    res.json(newEntry);
  } catch (err) {
    res.status(500).json({ error: 'Error saving entry' });
  }
});

app.put('/api/weight-entries/:id', async (req, res) => {
  try {
    const updatedEntry = await WeightEntry.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedEntry);
  } catch (err) {
    res.status(500).json({ error: 'Error updating entry' });
  }
});

app.delete('/api/weight-entries/:id', async (req, res) => {
  try {
    await WeightEntry.findByIdAndDelete(req.params.id);
    res.json({ message: 'Entry deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting entry' });
  }
});
app.post('/api/target-weight', async (req, res) => {
  try {
    // First try to find existing target weight
    let targetWeight = await TargetWeight.findOne({ userId: 'default' });
    
    if (targetWeight) {
      // Update existing target weight
      targetWeight.weight = req.body.weight;
      targetWeight.unit = req.body.unit || 'kg';
      await targetWeight.save();
    } else {
      // Create new target weight
      targetWeight = new TargetWeight({
        weight: req.body.weight,
        unit: req.body.unit || 'kg',
        userId: 'default'
      });
      await targetWeight.save();
    }
    
    res.status(201).json(targetWeight);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/target-weight', async (req, res) => {
  try {
    const targetWeight = await TargetWeight.findOne({ userId: 'default' });
    res.json(targetWeight || { weight: null, unit: 'kg' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});
// Start the server
app.listen(5000, '0.0.0.0',() => {
  console.log(`Server is running on http://localhost:${PORT} and http://192.168.1.41:${PORT}`);
});  