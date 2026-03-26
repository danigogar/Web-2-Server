import mongoose from 'mongoose'

const podcastSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'El título es obligatorio'],
      trim: true,
      minlength: [3, 'El título debe tener al menos 3 caracteres'],
    },
    description: {
      type: String,
      required: [true, 'La descripción es obligatoria'],
      minlength: [10, 'La descripción debe tener al menos 10 caracteres'],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El autor es obligatorio'],
    },
    category: {
      type: String,
      enum: {
        values: ['tech', 'science', 'history', 'comedy', 'news'],
        message: '{VALUE} no es una categoría válida',
      },
      required: [true, 'La categoría es obligatoria'],
    },
    duration: {
      type: Number,
      required: [true, 'La duración es obligatoria'],
      min: [60, 'La duración mínima es 60 segundos'],
    },
    episodes: {
      type: Number,
      default: 1,
      min: [1, 'Debe tener al menos 1 episodio'],
    },
    published: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

const Podcast = mongoose.model('Podcast', podcastSchema)

export default Podcast
