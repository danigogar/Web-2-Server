export const handleHttpError = (res, message = "Error") => {
  res.status(500).json({ error: message });
};
