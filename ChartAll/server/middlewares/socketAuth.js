const jwt = require("jsonwebtoken");

/**
 * socketAuth
 * ──────────────────────────────────────────────────────────────
 * Socket.IO middleware that verifies the JWT on every new connection.
 *
 * The frontend must pass the token in the socket handshake:
 *   io({ auth: { token: "Bearer <jwt>" } })
 *
 * On success, attaches decoded user to socket.data.user so all
 * event handlers can access { id, email, accountType } without
 * re-verifying the token.
 */
const socketAuth = (socket, next) => {
  try {
    // Token arrives in socket handshake auth object
    let token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("AUTH_MISSING: No token provided"));
    }

    // Strip "Bearer " prefix if present
    if (token.startsWith("Bearer ")) token = token.slice(7);

    const decoded = jwt.verify(token, process.env.JWT_KEY);

    // Normalise _id → id (PrepOdisha token uses _id)
    if (decoded._id && !decoded.id) decoded.id = decoded._id;

    // ── Block instructors from connecting to the chat socket ──
    if (decoded.accountType === "Instructor") {
      return next(new Error("FORBIDDEN: Instructors cannot access student chat"));
    }

    // Attach user info to socket for later use in event handlers
    socket.data.user = {
      id: decoded.id,
      email: decoded.email,
      accountType: decoded.accountType,
      // name and image will be fetched from DB in the handler
    };

    next(); // allow connection
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return next(new Error("AUTH_EXPIRED: Token has expired"));
    }
    return next(new Error("AUTH_INVALID: Invalid token"));
  }
};

module.exports = socketAuth;
