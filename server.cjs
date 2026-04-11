const fs = require('fs');
const path = require('path'); 

const express = require('express');
const cors = require('cors'); 
const app = express();


const DB_PATH = path.join(__dirname, 'db.json');

app.use(cors()); 
app.use(express.json());

app.get('/todos', (req, res)  => {
  const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8')); 
  res.json(data.todos);
})

app.post("/todos/add", (req, res) => {
    const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
    
    const newTodo = {
        id: Date.now(),
        text: req.body.text,
        completed: false
    };
    
    data.todos.push(newTodo);
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
    
    res.json(newTodo);
});


app.delete("/todos/delete", (req, res) => {
    const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
    
    data.todos = data.todos.filter(todo => todo.text !== req.body.text);
    
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
    res.json({ message: "Задача удалена из базы данных" });
});

app.patch("/todos/update", (req, res) => {
    const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
    const { text, completed } = req.body;

  
    const todo = data.todos.find(t => t.text === text);
    
    if (todo) {
        todo.completed = completed; 
        fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
        res.json({ message: "Статус обновлен в базе" });
    } else {
        res.status(404).json({ error: "Задача не найдена" });
    }
});

app.delete("/todos/clear", (req, res) => {
    const emptyData = { todos: [] };
    fs.writeFileSync(DB_PATH, JSON.stringify(emptyData, null, 2));
    res.json({ message: "База данных полностью очищена" });
});

app.listen(3000, () => console.log('Server runs on http://localhost:3000'));