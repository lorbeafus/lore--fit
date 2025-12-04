// ============================================
// Role-based Authorization Middleware
// ============================================

// Middleware to require admin or developer role
const requireAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'No autorizado. Por favor inicia sesión.'
        });
    }

    if (req.user.role !== 'admin' && req.user.role !== 'developer') {
        return res.status(403).json({
            success: false,
            message: 'Acceso denegado. Se requieren permisos de administrador.'
        });
    }

    next();
};

// Middleware to require developer role only
const requireDeveloper = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'No autorizado. Por favor inicia sesión.'
        });
    }

    if (req.user.role !== 'developer') {
        return res.status(403).json({
            success: false,
            message: 'Acceso denegado. Se requieren permisos de desarrollador.'
        });
    }

    next();
};

// Middleware to require specific roles
const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'No autorizado. Por favor inicia sesión.'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Acceso denegado. Se requiere uno de los siguientes roles: ${roles.join(', ')}`
            });
        }

        next();
    };
};

module.exports = {
    requireAdmin,
    requireDeveloper,
    requireRole
};
