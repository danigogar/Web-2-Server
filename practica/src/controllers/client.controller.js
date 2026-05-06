import Client from '../models/Client.js';
import { AppError } from '../utils/AppError.js';
import { notificationService } from '../services/notification.service.js';

export const createClient = async (req, res, next) => {
  try {
    const { name, cif, email, phone, address } = req.body;
    const user = req.user;
    const companyId = user.company._id;

    const existingClient = await Client.findOne({ company: companyId, cif });
    if (existingClient) throw AppError.conflict('Ya existe un cliente con ese CIF');

    const client = await Client.create({
      user: user.id, company: companyId, name, cif, email, phone, address
    });

    notificationService.emitClientCreated(client, companyId);
    res.status(201).json({ client });
  } catch (error) { next(error); }
};

export const updateClient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const companyId = req.user.company._id;
    const client = await Client.findOne({ _id: id, company: companyId, deleted: false });
    if (!client) throw AppError.notFound('Cliente no encontrado');
    Object.assign(client, req.body);
    await client.save();
    res.json({ client });
  } catch (error) { next(error); }
};

export const getClients = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, name, sort = '-createdAt', archived = 'false' } = req.query;
    const companyId = req.user.company._id;
    const filter = { company: companyId };
    if (archived === 'true') filter.deleted = true;
    else filter.deleted = false;
    if (name) filter.name = { $regex: name, $options: 'i' };
    const skip = (page - 1) * limit;
    const [clients, total] = await Promise.all([
      Client.find(filter).sort(sort).skip(skip).limit(limit),
      Client.countDocuments(filter)
    ]);
    res.json({ data: clients, pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / limit) } });
  } catch (error) { next(error); }
};

export const getClientById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const companyId = req.user.company._id;
    const client = await Client.findOne({ _id: id, company: companyId });
    if (!client) throw AppError.notFound('Cliente no encontrado');
    res.json({ client });
  } catch (error) { next(error); }
};

export const deleteClient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { soft = 'true' } = req.query;
    const companyId = req.user.company._id;
    const client = await Client.findOne({ _id: id, company: companyId });
    if (!client) throw AppError.notFound('Cliente no encontrado');
    if (soft === 'true') {
      client.deleted = true;
      await client.save();
      res.json({ message: 'Cliente archivado' });
    } else {
      await Client.findByIdAndDelete(id);
      res.json({ message: 'Cliente eliminado permanentemente' });
    }
  } catch (error) { next(error); }
};

export const restoreClient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const companyId = req.user.company._id;
    const client = await Client.findOne({ _id: id, company: companyId, deleted: true });
    if (!client) throw AppError.notFound('Cliente archivado no encontrado');
    client.deleted = false;
    await client.save();
    res.json({ message: 'Cliente restaurado', client });
  } catch (error) { next(error); }
};

export const getArchivedClients = async (req, res, next) => {
  try {
    const companyId = req.user.company._id;
    const clients = await Client.find({ company: companyId, deleted: true }).sort({ updatedAt: -1 });
    res.json({ clients });
  } catch (error) { next(error); }
};
