import mongoose from 'mongoose';

const trackSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'El título es requerido'],
      trim: true,
      minlength: [1, 'Mínimo 1 carácter'],
      maxlength: [200, 'Máximo 200 caracteres']
    },
    artist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El artista es requerido']
    },
    album: {
      type: String,
      trim: true
    },
    duration: {
      type: Number,
      required: [true, 'La duración es requerida'],
      min: [1, 'Mínimo 1 segundo'],
      max: [36000, 'Máximo 10 horas']
    },
    genres: {
      type: [String],
      validate: {
        validator: (v) => v.length > 0,
        message: 'Debe tener al menos un género'
      }
    },
    file: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Storage',
      default: null
    },
    plays: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

const Track = mongoose.model('Track', trackSchema);

export default Track;
