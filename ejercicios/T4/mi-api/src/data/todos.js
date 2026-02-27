// Base de datos en memoria con tareas de ejemplo
export let todos = [
  {
    id: 1,
    title: 'Completar ejercicio de Express',
    description: 'Crear API de tareas con validación Zod',
    completed: false,
    priority: 'high',
    createdAt: new Date('2026-02-10T10:00:00Z').toISOString()
  },
  {
    id: 2,
    title: 'Estudiar para el examen',
    description: 'Repasar temas 1-4 de Node.js',
    completed: false,
    priority: 'high',
    createdAt: new Date('2026-02-11T09:30:00Z').toISOString()
  },
  {
    id: 3,
    title: 'Comprar ingredientes',
    description: 'Leche, pan, huevos, café',
    completed: true,
    priority: 'medium',
    createdAt: new Date('2026-02-12T08:00:00Z').toISOString()
  },
  {
    id: 4,
    title: 'Hacer ejercicio',
    description: '30 minutos de cardio',
    completed: false,
    priority: 'medium',
    createdAt: new Date('2026-02-12T18:00:00Z').toISOString()
  },
  {
    id: 5,
    title: 'Ver nueva serie',
    description: 'Empezar temporada 2 de la serie recomendada',
    completed: false,
    priority: 'low',
    createdAt: new Date('2026-02-13T20:00:00Z').toISOString()
  }
];