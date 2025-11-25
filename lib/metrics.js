// lib/metrics.js
import client from 'prom-client';

const register = new client.Registry();

// colecciona métricas estándar de Node.js (CPU, memoria, event loop, etc)
client.collectDefaultMetrics({ register });

// Métrica custom: contador de requests (la podés incrementar desde tus API routes)
export const httpRequestCounter = new client.Counter({
  name: 'app_http_requests_total',
  help: 'Total de solicitudes HTTP recibidas',
  labelNames: ['method', 'route', 'status'],
  registers: [register],
});

// Export del register para el endpoint /metrics
export default register;
