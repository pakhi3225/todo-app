const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Todos are stored in a simple JSON file (no database needed)
const DATA_FILE = path.join(__dirname, 'todos.json');

function load() {
  try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); }
  catch (e) { return []; }
}
function save(todos) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(todos, null, 2));
}

// READ all
app.get('/api/todos', (req, res) => {
  res.json(load());
});

// CREATE
app.post('/api/todos', (req, res) => {
  const text = (req.body.text || '').trim();
  if (!text) return res.status(400).json({ error: 'Text required' });
  const todos = load();
  const todo = {
    _id: crypto.randomUUID(),
    text,
    done: false,
    createdAt: new Date().toISOString()
  };
  todos.push(todo);
  save(todos);
  res.status(201).json(todo);
});

// UPDATE (mark done / undo)
app.put('/api/todos/:id', (req, res) => {
  const todos = load();
  const todo = todos.find(t => t._id === req.params.id);
  if (!todo) return res.status(404).json({ error: 'Not found' });
  todo.done = !!req.body.done;
  save(todos);
  res.json(todo);
});

// DELETE
app.delete('/api/todos/:id', (req, res) => {
  save(load().filter(t => t._id !== req.params.id));
  res.json({ ok: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Running on http://localhost:' + PORT));
