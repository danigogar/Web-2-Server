// REVISAR

import { todos } from '../data/todos.js';
import { ApiError } from '../middleware/errorHandler.js';

// GET /api/todos
export const getAll = (req, res) => {
    let resultado = [...todos];
    const { completed, priority } = req.query;

    // REVISAR, NO VA BIEN
    // Filtrar por estado completado
    if (completed !== undefined) {
        const isCompleted = completed === 'true'; // Convertir string a boolean SOLUCIONADO
        resultado = resultado.filter(t => t.completed === isCompleted);
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

    // Calcular el siguiente ID basándose en el array
    const newId = todos.length > 0 ? Math.max(...todos.map(t => t.id)) + 1 : 1;

    const nuevoTodo = {
        id: newId,
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

    // OTRA OPCIÓN DE RESPUESTA, dejo la primera porque era la de la plantilla
    /* 
    res.json({
        success: true,
        message: 'Tarea eliminada exitosamente'
    });
    */
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