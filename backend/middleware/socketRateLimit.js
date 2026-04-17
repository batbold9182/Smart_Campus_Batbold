const ipConnections = new Map();

const MAX_CONN_PER_USER = parseInt(process.env.SOCKET_MAX_CONN_PER_USER || "5", 10);
const MAX_CONN_PER_IP = parseInt(process.env.SOCKET_MAX_CONN_PER_IP || "20", 10);

const trackIpConnect = (ip) =>
  ipConnections.set(ip, (ipConnections.get(ip) || 0) + 1);

const trackIpDisconnect = (ip) => {
  const n = (ipConnections.get(ip) || 1) - 1;
  if (n <= 0) ipConnections.delete(ip);
  else ipConnections.set(ip, n);
};

module.exports = { ipConnections, trackIpConnect, trackIpDisconnect, MAX_CONN_PER_USER, MAX_CONN_PER_IP };
