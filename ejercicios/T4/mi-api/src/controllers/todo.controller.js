// REVISAR

import { todos, nextId } from '../data/todos.js';
import { ApiError } from '../middleware/errorHandler.js';

// GET /api/todos
export const getAll = (req, res) => {
    let resultado = [...todos];
    const { completed, priority } = req.query;

    // Filtrar por estado completado
    if (completed !== undefined) {
        resultado = resultado.filter(t => t.completed === completed);
    }

    // Filtrar por prioridad
    if (priority) {
        resultado = resultado.filter(t => t.priority === priority);
    }

    res.json(resultado);
};

// GET /api/todos/:id
export const getById = (req, res) => {
    const id = parseInt(req.params.id);
    const todo = todos.find(t => t.id === id);

    if (!todo) {
        throw ApiError.notFound(`Tarea con ID ${id} no encontrada`);
    }

    res.json(todo);
};

// POST /api/todos
export const create = (req, res) => {
    const { title, description, priority } = req.body;

    const nuevoTodo = {
        id: nextId++,
        title,
        description: description || '',
        completed: false,
        priority: priority || 'medium',
        createdAt: new Date().toISOString()
    };

    todos.push(nuevoTodo);

    res.status(201).json(nuevoTodo);
};

// PUT /api/todos/:id
export const update = (req, res) => {
    const id = parseInt(req.params.id);
    const index = todos.findIndex(t => t.id === id);

    if (index === -1) {
        throw ApiError.notFound(`Tarea con ID ${id} no encontrada`);
    }

    const { title, description, completed, priority } = req.body;

    todos[index] = {
        id,
        title,
        description: description || '',
        completed: completed !== undefined ? completed : todos[index].completed,
        priority: priority || todos[index].priority,
        createdAt: todos[index].createdAt
    };

    res.json(todos[index]);
};

// DELETE /api/todos/:id
export const remove = (req, res) => {
    const id = parseInt(req.params.id);
    const index = todos.findIndex(t => t.id === id);

    if (index === -1) {
        throw ApiError.notFound(`Tarea con ID ${id} no encontrada`);
    }

    todos.splice(index, 1);

    res.status(204).end();
};

// PATCH /api/todos/:id/toggle
export const toggle = (req, res) => {
    const id = parseInt(req.params.id);
    const index = todos.findIndex(t => t.id === id);

    if (index === -1) {
        throw ApiError.notFound(`Tarea con ID ${id} no encontrada`);
    }

    todos[index].completed = !todos[index].completed;

    res.json(todos[index]);
};