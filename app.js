require('dotenv').config();
// DEPENDENCIES
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const port = process.env.PORT || 4500;

// Static File Service
app.use(express.static('public'));
// Body-parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.set('view engine', 'ejs');
app.set('views', path.resolve() + '/views');

// Node의 native Promise 사용
mongoose.Promise = global.Promise;

// Connect to MongoDB
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log('Successfully connected to mongodb'))
    .catch((e) => console.error(e));

// ROUTERS
app.use('/todos', require('./routes/todos'));

const Todo = require('./models/todo');

var todo_length;

app.get('/page/:page', function (req, res, next) {
    var page = req.params.page;

    Todo.findAll().then((todos) => {
        if (!todos.length) return res.status(404).send({ err: 'Todo not found' });
        todo_length = todos.length;
    });
    Todo.find({}, { title: 1, content: 1, createdAt: 1 })
        .skip((page - 1) * 10)
        .limit(10)
        .then((todos) => {
            if (!todos.length) return res.status(404).send({ err: 'Todo not found' });
            res.render('todo', { data: todos, page: page, length: todo_length });
        });
});

app.listen(port, () => console.log(`Server listening on port ${port}`));
