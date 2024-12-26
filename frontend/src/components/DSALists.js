import React, { useState, useEffect } from 'react';
import { FaBook } from 'react-icons/fa';
import './DSALists.css';

const DSALists = () => {
  const [lists, setLists] = useState({
    list1: [],
    list2: [],
    list3: [],
  });
  const [activeList, setActiveList] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    number: '',
    name: '',
    link: '',
    description: '',
  });
  const [descriptionPopup, setDescriptionPopup] = useState(null);
  const [movePopup, setMovePopup] = useState({ questionId: null, fromList: null });

  useEffect(() => {
    fetchLists();
  }, []);

  const fetchLists = async () => {
    try {
      const response = await fetch('http://192.168.1.41:5000/api/lists');
      const data = await response.json();
      setLists({
        list1: data.find((list) => list.name === 'list1')?.questions || [],
        list2: data.find((list) => list.name === 'list2')?.questions || [],
        list3: data.find((list) => list.name === 'list3')?.questions || [],
      });
    } catch (err) {
      console.error('Error fetching lists:', err);
    }
  };

  const handleAddQuestion = async (listKey) => {
    try {
      const response = await fetch(`http://192.168.1.41:5000/api/lists/${listKey}/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newQuestion),
      });

      if (response.ok) {
        fetchLists();
        setShowAddForm(false);
        setNewQuestion({
          number: '',
          name: '',
          link: '',
          description: '',
        });
      } else {
        console.error('Error adding question:', await response.text());
      }
    } catch (err) {
      console.error('Error adding question:', err);
    }
  };

  const handleMoveQuestion = async (fromList, questionId, toList) => {
    try {
      const response = await fetch(
        `http://192.168.1.41:5000/api/lists/${fromList}/move/${questionId}/${toList}`,
        { method: 'PUT' }
      );

      if (response.ok) {
        fetchLists();
        setMovePopup({ questionId: null, fromList: null });
        alert(`Question moved to ${toList} successfully.`);
      } else {
        console.error('Error moving question:', await response.text());
      }
    } catch (err) {
      console.error('Error moving question:', err);
    }
  };

  const handleDeleteQuestion = async (listKey, questionId) => {
    const userInput = prompt("Are you sure you want to delete this question? Type 'YES' to confirm.");
    if (userInput !== 'YES') {
      alert('Deletion canceled.');
      return;
    }

    try {
      const response = await fetch(`http://192.168.1.41:5000/api/lists/${listKey}/delete/${questionId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchLists();
        alert('Question deleted successfully.');
      } else {
        console.error('Error deleting question:', await response.text());
      }
    } catch (err) {
      console.error('Error deleting question:', err);
    }
  };

  const renderList = (listKey) => (
    <table className="list-table">
      <thead>
        <tr>
          <th>Number</th>
          <th>Name</th>
          <th>Link</th>
          <th>Description</th>
          <th>Actions</th>
          <th>Move To</th>
        </tr>
      </thead>
      <tbody>
        {lists[listKey].map((question) => (
          <tr key={question._id}>
            <td>{question.number}</td>
            <td>{question.name}</td>
            <td>
              <a href={question.link} target="_blank" rel="noreferrer">
                <FaBook size={20} color="#61DAFB" />
              </a>
            </td>
            <td>
              <button onClick={() => setDescriptionPopup(question)}>View Description</button>
            </td>
            <td>
              <button onClick={() => handleDeleteQuestion(listKey, question._id)}>Delete</button>
            </td>
            <td>
              <button
                onClick={() =>
                  setMovePopup({
                    questionId: question._id,
                    fromList: listKey,
                  })
                }
              >
                Move To
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="dsa-lists">
      <div className="list-boxes">
  {['list1', 'list2', 'list3'].map((listKey) => (
    <div className="list-box" key={listKey}>
      <h3>
        {listKey === 'list1' && 'Fully Prepared Questions'}
        {listKey === 'list2' && 'Need Practice Questions'}
        {listKey === 'list3' && 'Doubtful Questions'}
      </h3>
      <button onClick={() => setActiveList(listKey)}>View List</button>
    </div>
  ))}
</div>


      {activeList && (
        <div className="list-detail">
          <button onClick={() => setShowAddForm(true)}>Add Question</button>
          {renderList(activeList)}
          <button onClick={() => setActiveList(null)}>Back to Lists</button>
        </div>
      )}

      {showAddForm && (
        <div className="popup-form">
          <h2>Add New Question</h2>
          <input
            type="text"
            placeholder="Question Number"
            value={newQuestion.number}
            onChange={(e) => setNewQuestion({ ...newQuestion, number: e.target.value })}
          />
          <input
            type="text"
            placeholder="Question Name"
            value={newQuestion.name}
            onChange={(e) => setNewQuestion({ ...newQuestion, name: e.target.value })}
          />
          <input
            type="text"
            placeholder="Link"
            value={newQuestion.link}
            onChange={(e) => setNewQuestion({ ...newQuestion, link: e.target.value })}
          />
          <textarea
            placeholder="Description"
            value={newQuestion.description}
            onChange={(e) => setNewQuestion({ ...newQuestion, description: e.target.value })}
            style={{ whiteSpace: 'pre-wrap' }}
          />
          <button onClick={() => handleAddQuestion(activeList)}>Submit</button>
          <button onClick={() => setShowAddForm(false)}>Cancel</button>
        </div>
      )}

      {descriptionPopup && (
        <div className="popup">
          <div className="popup-content">
            <button className="close-btn" onClick={() => setDescriptionPopup(null)}>
              &times;
            </button>
            <h2>Description</h2>
            <pre className="popup-description">{descriptionPopup.description}</pre>
          </div>
        </div>
      )}

      {movePopup.questionId && (
        <div className="popup">
          <div className="popup-content">
            <button className="close-btn" onClick={() => setMovePopup({ questionId: null, fromList: null })}>
              &times;
            </button>
            <h2>Move Question</h2>
            {['list1', 'list2', 'list3']
              .filter((targetList) => targetList !== movePopup.fromList)
              .map((targetList) => (
                <button
                  key={targetList}
                  onClick={() => handleMoveQuestion(movePopup.fromList, movePopup.questionId, targetList)}
                >
                 Move to {`List ${targetList.slice(-1)}`}
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DSALists;
