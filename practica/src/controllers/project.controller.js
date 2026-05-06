import Project from '../models/Project.js';
import Client from '../models/Client.js';
import { AppError } from '../utils/AppError.js';
import { notificationService } from '../services/notification.service.js';

export const createProject = async (req, res, next) => {
  try {
    const { clientId, name, projectCode, address, email, notes, active } = req.body;
    const user = req.user;
    const companyId = user.company._id;
    const client = await Client.findOne({ _id: clientId, company: companyId });
    if (!client) throw AppError.notFound('Cliente no encontrado');
    const existingProject = await Project.findOne({ company: companyId, projectCode });
    if (existingProject) throw AppError.conflict('Ya existe un proyecto con ese código');
    const project = await Project.create({
      user: user.id, company: companyId, client: clientId, name, projectCode, address, email, notes, active
    });
    notificationService.emitProjectCreated(project, companyId);
    res.status(201).json({ project });
  } catch (error) { next(error); }
};

export const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const companyId = req.user.company._id;
    const project = await Project.findOne({ _id: id, company: companyId, deleted: false });
    if (!project) throw AppError.notFound('Proyecto no encontrado');
    Object.assign(project, req.body);
    await project.save();
    res.json({ project });
  } catch (error) { next(error); }
};

export const getProjects = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, clientId, name, active, sort = '-createdAt', archived = 'false' } = req.query;
    const companyId = req.user.company._id;
    const filter = { company: companyId };
    if (archived === 'true') filter.deleted = true;
    else filter.deleted = false;
    if (clientId) filter.client = clientId;
    if (active) filter.active = active === 'true';
    if (name) filter.name = { $regex: name, $options: 'i' };
    const skip = (page - 1) * limit;
    const [projects, total] = await Promise.all([
      Project.find(filter).populate('client', 'name cif').sort(sort).skip(skip).limit(limit),
      Project.countDocuments(filter)
    ]);
    res.json({ data: projects, pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / limit) } });
  } catch (error) { next(error); }
};

export const getProjectById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const companyId = req.user.company._id;
    const project = await Project.findOne({ _id: id, company: companyId }).populate('client', 'name cif email phone');
    if (!project) throw AppError.notFound('Proyecto no encontrado');
    res.json({ project });
  } catch (error) { next(error); }
};

export const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { soft = 'true' } = req.query;
    const companyId = req.user.company._id;
    const project = await Project.findOne({ _id: id, company: companyId });
    if (!project) throw AppError.notFound('Proyecto no encontrado');
    if (soft === 'true') {
      project.deleted = true;
      await project.save();
      res.json({ message: 'Proyecto archivado' });
    } else {
      await Project.findByIdAndDelete(id);
      res.json({ message: 'Proyecto eliminado permanentemente' });
    }
  } catch (error) { next(error); }
};

export const restoreProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const companyId = req.user.company._id;
    const project = await Project.findOne({ _id: id, company: companyId, deleted: true });
    if (!project) throw AppError.notFound('Proyecto archivado no encontrado');
    project.deleted = false;
    await project.save();
    res.json({ message: 'Proyecto restaurado', project });
  } catch (error) { next(error); }
};

export const getArchivedProjects = async (req, res, next) => {
  try {
    const companyId = req.user.company._id;
    const projects = await Project.find({ company: companyId, deleted: true }).populate('client', 'name').sort({ updatedAt: -1 });
    res.json({ projects });
  } catch (error) { next(error); }
};
