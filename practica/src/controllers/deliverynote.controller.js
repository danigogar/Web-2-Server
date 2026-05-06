import DeliveryNote from '../models/DeliveryNote.js';
import Project from '../models/Project.js';
import Client from '../models/Client.js';
import Company from '../models/Company.js';
import { AppError } from '../utils/AppError.js';
import { generateDeliveryNotePDF } from '../services/pdf.service.js';
import { uploadSignature, uploadPDF } from '../services/storage.service.js';
import { notificationService } from '../services/notification.service.js';

export const createDeliveryNote = async (req, res, next) => {
  try {
    const { format, projectId, description, workDate, ...rest } = req.body;
    const user = req.user;
    const companyId = user.company._id;
    const project = await Project.findOne({ _id: projectId, company: companyId });
    if (!project) throw AppError.notFound('Proyecto no encontrado');
    const deliveryNoteData = { user: user.id, company: companyId, client: project.client, project: projectId, format, description, workDate };
    if (format === 'material') {
      deliveryNoteData.material = rest.material;
      deliveryNoteData.quantity = rest.quantity;
      deliveryNoteData.unit = rest.unit;
    } else {
      deliveryNoteData.hours = rest.hours;
      deliveryNoteData.workers = rest.workers;
    }
    const deliveryNote = await DeliveryNote.create(deliveryNoteData);
    notificationService.emitDeliveryNoteCreated(deliveryNote, companyId);
    res.status(201).json({ deliveryNote });
  } catch (error) { next(error); }
};

export const getDeliveryNotes = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, projectId, clientId, format, signed, from, to, sort = '-workDate' } = req.query;
    const companyId = req.user.company._id;
    const filter = { company: companyId, deleted: false };
    if (projectId) filter.project = projectId;
    if (clientId) filter.client = clientId;
    if (format) filter.format = format;
    if (signed) filter.signed = signed === 'true';
    if (from || to) {
      filter.workDate = {};
      if (from) filter.workDate.$gte = new Date(from);
      if (to) filter.workDate.$lte = new Date(to);
    }
    const skip = (page - 1) * limit;
    const [deliveryNotes, total] = await Promise.all([
      DeliveryNote.find(filter).populate('client', 'name cif').populate('project', 'name projectCode').sort(sort).skip(skip).limit(limit),
      DeliveryNote.countDocuments(filter)
    ]);
    res.json({ data: deliveryNotes, pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / limit) } });
  } catch (error) { next(error); }
};

export const getDeliveryNoteById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const companyId = req.user.company._id;
    const deliveryNote = await DeliveryNote.findOne({ _id: id, company: companyId }).populate('user', 'name email').populate('client', 'name cif email phone address').populate('project', 'name projectCode address email');
    if (!deliveryNote) throw AppError.notFound('Albarán no encontrado');
    res.json({ deliveryNote });
  } catch (error) { next(error); }
};

export const signDeliveryNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const companyId = req.user.company._id;
    if (!req.file) throw AppError.badRequest('No se proporcionó imagen de firma');
    const deliveryNote = await DeliveryNote.findOne({ _id: id, company: companyId });
    if (!deliveryNote) throw AppError.notFound('Albarán no encontrado');
    if (deliveryNote.signed) throw AppError.badRequest('El albarán ya está firmado');
    const signatureResult = await uploadSignature(req.file.buffer, companyId, id);
    const project = await Project.findById(deliveryNote.project);
    const client = await Client.findById(deliveryNote.client);
    const company = await Company.findById(companyId);
    const pdfBuffer = await generateDeliveryNotePDF(deliveryNote, client, project, company);
    const pdfResult = await uploadPDF(pdfBuffer, companyId, id);
    deliveryNote.signed = true;
    deliveryNote.signedAt = new Date();
    deliveryNote.signatureUrl = signatureResult.url;
    deliveryNote.pdfUrl = pdfResult.url;
    await deliveryNote.save();
    notificationService.emitDeliveryNoteSigned(deliveryNote, companyId);
    res.json({ message: 'Albarán firmado correctamente', signatureUrl: deliveryNote.signatureUrl, pdfUrl: deliveryNote.pdfUrl });
  } catch (error) { next(error); }
};

export const getDeliveryNotePDF = async (req, res, next) => {
  try {
    const { id } = req.params;
    const companyId = req.user.company._id;
    const deliveryNote = await DeliveryNote.findOne({ _id: id, company: companyId });
    if (!deliveryNote) throw AppError.notFound('Albarán no encontrado');
    if (!deliveryNote.signed) throw AppError.badRequest('El albarán no está firmado');
    if (deliveryNote.pdfUrl) return res.redirect(deliveryNote.pdfUrl);
    const project = await Project.findById(deliveryNote.project);
    const client = await Client.findById(deliveryNote.client);
    const company = await Company.findById(companyId);
    const pdfBuffer = await generateDeliveryNotePDF(deliveryNote, client, project, company);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=albaran_${id}.pdf`);
    res.send(pdfBuffer);
  } catch (error) { next(error); }
};

export const deleteDeliveryNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const companyId = req.user.company._id;
    const deliveryNote = await DeliveryNote.findOne({ _id: id, company: companyId });
    if (!deliveryNote) throw AppError.notFound('Albarán no encontrado');
    if (deliveryNote.signed) throw AppError.forbidden('No se puede eliminar un albarán firmado');
    await DeliveryNote.findByIdAndDelete(id);
    res.json({ message: 'Albarán eliminado correctamente' });
  } catch (error) { next(error); }
};
