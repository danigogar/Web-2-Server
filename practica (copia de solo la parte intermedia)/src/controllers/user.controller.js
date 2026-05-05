import User from '../models/User.js';
import Company from '../models/Company.js';
import { AppError } from '../utils/AppError.js';
import { hashPassword, verifyPassword, generateVerificationCode } from '../utils/password.js';
import { generateAccessToken, generateRefreshToken, storeRefreshToken, getRefreshToken, revokeRefreshToken, revokeAllUserTokens } from '../utils/jwt.js';
import { notificationService } from '../services/notification.service.js';
import { config } from '../config/index.js';

// 1. Registro de usuario
export const register = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw AppError.conflict('El email ya está registrado');
    }

    const hashedPassword = await hashPassword(password);
    const verificationCode = generateVerificationCode();

    const user = await User.create({
      email,
      password: hashedPassword,
      verificationCode,
      verificationAttempts: 3
    });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    storeRefreshToken(user._id.toString(), refreshToken, expiresAt);

    notificationService.emitUserRegistered(user);

    res.status(201).json({
      user: {
        id: user._id,
        email: user.email,
        status: user.status,
        role: user.role
      },
      accessToken,
      refreshToken
    });
  } catch (error) {
    next(error);
  }
};

// 2. Validación de email
export const validateEmail = async (req, res, next) => {
  try {
    const { code } = req.body;
    
    // Recargar el usuario incluyendo los campos ocultos
    const user = await User.findById(req.user._id).select('+verificationCode +verificationAttempts');
    
    if (!user) {
      throw AppError.notFound('Usuario no encontrado');
    }

    if (user.status === 'verified') {
      throw AppError.badRequest('El email ya está verificado');
    }

    if (user.verificationAttempts <= 0) {
      throw AppError.tooManyRequests('Has agotado los intentos. Solicita un nuevo código');
    }

    if (user.verificationCode !== code) {
      user.verificationAttempts -= 1;
      await user.save();
      throw AppError.badRequest(`Código incorrecto. Te quedan ${user.verificationAttempts} intentos`);
    }

    user.status = 'verified';
    user.verificationCode = null;
    await user.save();

    notificationService.emitUserVerified(user);

    res.json({ message: 'Email verificado correctamente' });
  } catch (error) {
    next(error);
  }
};

// 3. Login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email })
      .select('+password +verificationCode +verificationAttempts')
      .populate('company');

    if (!user || user.deleted) {
      throw AppError.unauthorized('Credenciales inválidas');
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      throw AppError.unauthorized('Credenciales inválidas');
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    storeRefreshToken(user._id.toString(), refreshToken, expiresAt);

    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
        company: user.company
      },
      accessToken,
      refreshToken
    });
  } catch (error) {
    next(error);
  }
};

// 4. Onboarding - Datos personales
export const updatePersonalData = async (req, res, next) => {
  try {
    const { name, lastName, nif } = req.body;
    const user = req.user;

    user.name = name;
    user.lastName = lastName;
    user.nif = nif;
    await user.save();

    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        lastName: user.lastName,
        nif: user.nif,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    next(error);
  }
};

// 5. Onboarding - Compañía
export const updateCompany = async (req, res, next) => {
  try {
    const { isFreelance, name, cif, address } = req.body;
    const user = req.user;

    let company;
    let userRole = 'admin';

    if (isFreelance) {
      // Autónomo: usar NIF del usuario como CIF
      const companyCif = user.nif;
      company = await Company.findOne({ cif: companyCif });

      if (!company) {
        company = await Company.create({
          owner: user._id,
          name: `${user.name} ${user.lastName}`,
          cif: companyCif,
          address: user.address || {},
          isFreelance: true
        });
      }
      userRole = 'admin';
    } else {
      // Empresa normal
      company = await Company.findOne({ cif });

      if (!company) {
        company = await Company.create({
          owner: user._id,
          name,
          cif,
          address: address || {},
          isFreelance: false
        });
        userRole = 'admin';
      } else {
        userRole = 'guest';
      }
    }

    user.company = company._id;
    user.role = userRole;
    await user.save();

    await user.populate('company');

    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        lastName: user.lastName,
        role: user.role,
        company: user.company
      }
    });
  } catch (error) {
    next(error);
  }
};

// 6. Logo de la compañía
export const uploadLogo = async (req, res, next) => {
  try {
    if (!req.file) {
      throw AppError.badRequest('No se proporcionó ninguna imagen');
    }

    const user = req.user;

    if (!user.company) {
      throw AppError.badRequest('Usuario sin compañía asociada');
    }

    const logoUrl = `${config.publicUrl}/uploads/${req.file.filename}`;

    const company = await Company.findByIdAndUpdate(
      user.company._id,
      { logo: logoUrl },
      { new: true }
    );

    res.json({
      message: 'Logo subido correctamente',
      logo: company.logo
    });
  } catch (error) {
    next(error);
  }
};

// 7. Obtener usuario autenticado
export const getMe = async (req, res, next) => {
  try {
    const user = req.user;
    await user.populate('company');

    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        lastName: user.lastName,
        fullName: user.fullName,
        nif: user.nif,
        role: user.role,
        status: user.status,
        address: user.address,
        company: user.company,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// 8a. Refresh token
export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const tokenData = getRefreshToken(refreshToken);

    if (!tokenData) {
      throw AppError.unauthorized('Refresh token inválido o expirado');
    }

    const user = await User.findById(tokenData.userId);
    if (!user || user.deleted) {
      throw AppError.unauthorized('Usuario no encontrado');
    }

    const newAccessToken = generateAccessToken(user);

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    next(error);
  }
};

// 8b. Logout
export const logout = async (req, res, next) => {
  try {
    const refreshToken = req.body.refreshToken;
    if (refreshToken) {
      revokeRefreshToken(refreshToken);
    }

    res.json({ message: 'Sesión cerrada correctamente' });
  } catch (error) {
    next(error);
  }
};

// 9. Eliminar usuario
export const deleteUser = async (req, res, next) => {
  try {
    const { soft } = req.query;
    const user = req.user;
    const isSoft = soft === 'true';

    if (isSoft) {
      user.deleted = true;
      await user.save();
      notificationService.emitUserDeleted(user, true);
      revokeAllUserTokens(user._id.toString());
      res.json({ message: 'Usuario eliminado (soft delete)' });
    } else {
      // Hard delete
      if (user.company) {
        const companyUsers = await User.countDocuments({ company: user.company._id, deleted: false });
        if (companyUsers === 1) {
          await Company.findByIdAndDelete(user.company._id);
        }
      }
      await User.findByIdAndDelete(user._id);
      notificationService.emitUserDeleted(user, false);
      revokeAllUserTokens(user._id.toString());
      res.json({ message: 'Usuario eliminado permanentemente' });
    }
  } catch (error) {
    next(error);
  }
};

// Bonus: Cambiar contraseña
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = req.user;

    const isValid = await verifyPassword(currentPassword, user.password);
    if (!isValid) {
      throw AppError.unauthorized('Contraseña actual incorrecta');
    }

    const hashedNewPassword = await hashPassword(newPassword);
    user.password = hashedNewPassword;
    await user.save();

    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    next(error);
  }
};

// 10. Invitar compañero
export const inviteUser = async (req, res, next) => {
  try {
    const { email, name, lastName } = req.body;
    const currentUser = req.user;

    if (currentUser.role !== 'admin') {
      throw AppError.forbidden('Solo los administradores pueden invitar usuarios');
    }

    if (!currentUser.company) {
      throw AppError.badRequest('Usuario sin compañía asociada');
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw AppError.conflict('El email ya está registrado');
    }

    const temporaryPassword = generateVerificationCode();
    const hashedPassword = await hashPassword(temporaryPassword);

    const invitedUser = await User.create({
      email,
      name,
      lastName,
      password: hashedPassword,
      role: 'guest',
      status: 'pending',
      verificationCode: generateVerificationCode(),
      verificationAttempts: 3,
      company: currentUser.company._id
    });

    notificationService.emitUserInvited(invitedUser, currentUser.email);

    res.status(201).json({
      message: 'Usuario invitado correctamente',
      user: {
        id: invitedUser._id,
        email: invitedUser.email,
        name: invitedUser.name,
        lastName: invitedUser.lastName,
        role: invitedUser.role,
        temporaryPassword
      }
    });
  } catch (error) {
    next(error);
  }
};
