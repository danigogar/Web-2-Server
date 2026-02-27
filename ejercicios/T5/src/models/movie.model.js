import mongoose from 'mongoose'

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'El título es obligatorio'],
      trim: true,
      minlength: [2, 'El título debe tener al menos 2 caracteres'],
    },
    director: {
      type: String,
      required: [true, 'El director es obligatorio'],
      trim: true,
    },
    year: {
      type: Number,
      required: [true, 'El año es obligatorio'],
      min: [1888, 'El año mínimo es 1888'],
      max: [new Date().getFullYear(), `El año no puede ser mayor que ${new Date().getFullYear()}`],
    },
    genre: {
      type: String,
      required: [true, 'El género es obligatorio'],
      enum: {
        values: ['action', 'comedy', 'drama', 'horror', 'scifi'],
        message: '{VALUE} no es un género válido',
      },
    },
    copies: {
      type: Number,
      default: 5,
      min: [0, 'Las copias no pueden ser negativas'],
    },
    availableCopies: {
      type: Number,
      min: [0, 'Las copias disponibles no pueden ser negativas'],
    },
    timesRented: {
      type: Number,
      default: 0,
      min: [0, 'El contador de alquileres no puede ser negativo'],
    },
    cover: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

// Antes de guardar, si no se especifica availableCopies, igualarla a copies
movieSchema.pre('save', function (next) {
  if (this.isNew && this.availableCopies === undefined) {
    this.availableCopies = this.copies
  }
  next()
})

const Movie = mongoose.model('Movie', movieSchema)

export default Movie
