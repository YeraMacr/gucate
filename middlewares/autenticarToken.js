module.exports = function autenticarToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ success: false, message: "Token no proporcionado" });

  try {
    const token = authHeader.split(' ')[1];
    const decoded = Buffer.from(token, 'base64').toString('ascii');
    const [userId, timestamp] = decoded.split('-');
    const tokenAge = Date.now() - parseInt(timestamp);
    if (tokenAge > 24 * 60 * 60 * 1000) {
      return res.status(401).json({ success: false, message: 'Token expirado' });
    }
    req.userId = userId;
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Token inválido' });
  }
}
