import React, { useEffect, useState } from "react";
import axios from "axios";

function Notes() {
  const [notes, setNotes] = useState([]);
  const [noteText, setNoteText] = useState("");

  // Helper function to get the current date, day, and time in a readable format
  const getCurrentDateTime = () => {
    const now = new Date();
    const date = now.toLocaleDateString(); // Get the current date
    const day = now.toLocaleString("en-US", { weekday: "long" }); // Get the current day of the week
    const time = now.toLocaleTimeString(); // Get the current time
    return { date, dayTime: `${day}, ${time}` };
  };

  // Fetch notes from the backend
  const fetchNotes = async () => {
    try {
      const response = await axios.get("http://192.168.1.42:5000/api/notes"); // Updated to your IP address
      setNotes(response.data);
    } catch (error) {
      console.error("Error fetching notes:", error);
    }
  };

  const addNote = async () => {
    if (noteText.trim()) {
      const { date, dayTime } = getCurrentDateTime(); // Get date and time when the note is added
      try {
        const response = await axios.post("http://192.168.1.42:5000/api/notes", {
          text: noteText,
          date,
          dayTime,
        });
        setNotes([...notes, response.data]); // Add the newly created note to the state
        setNoteText("");
      } catch (error) {
        console.error("Error adding note:", error);
      }
    }
  };

  const deleteNote = async (id) => {
    try {
      await axios.delete(`http://192.168.1.42:5000/api/notes/${id}`); // Updated to your IP address
      setNotes(notes.filter(note => note._id !== id)); // Update state to remove the deleted note
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  const editNote = async (index) => {
    const newNoteText = prompt("Edit your note:", notes[index].text);
    if (newNoteText !== null && newNoteText.trim()) {
      const { date, dayTime } = getCurrentDateTime(); // Update date and time on edit
      try {
        const response = await axios.put(`http://192.168.1.42:5000/api/notes/${notes[index]._id}`, {
          text: newNoteText,
          date,
          dayTime,
        });
        setNotes(notes.map((note, i) => (i === index ? response.data : note))); // Update the edited note in state
      } catch (error) {
        console.error("Error editing note:", error);
      }
    }
  };

  // Fetch notes on component mount
  useEffect(() => {
    fetchNotes();
  }, []);

  return (
    <div className="notes">
      <h2>Notes</h2>
      <textarea
        placeholder="Leave a note here....❤️"
        value={noteText}
        onChange={(e) => setNoteText(e.target.value)}
      />
      <button onClick={addNote}>Add Note</button>
      <ul>
        {notes.map((note) => (
          <li key={note._id}>
            <p>{note.text}</p>
            <p>
              <small>
                Updated on: {note.date} ({note.dayTime})
              </small>
            </p>
            <button onClick={() => editNote(notes.indexOf(note))}>Edit</button>
            <button onClick={() => deleteNote(note._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Notes;
