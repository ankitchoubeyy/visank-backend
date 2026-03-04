const customerAuth = (req, res, next) => {

  if (!req.user) {
    return res.status(401).json({
      message: "Authentication required"
    });
  }

  if (req.user.role !== "customer") {
    return res.status(403).json({
      message: "Customer access only"
    });
  }

  next();

};

module.exports = customerAuth;