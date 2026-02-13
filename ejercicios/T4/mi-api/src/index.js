import app from './app.js';

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Server running on localhost port: ${PORT}`);
    console.log(`Entorno: ${process.env.NODE_ENV || 'development'}`);
});