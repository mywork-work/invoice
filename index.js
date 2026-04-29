// index.js (ES Module)
import express from 'express';
import 'dotenv/config';
import sequelize from './database/db.js';
import userRoutes from './src/router/index.js';
import cors from "cors";
import morgan from 'morgan';
import client from 'prom-client';   // ✅ FIXED

const app = express();

app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// =====================
// PROMETHEUS METRICS
// =====================
client.collectDefaultMetrics();

app.get("/metrics", async (req, res) => {
  res.set("Content-Type", client.register.contentType);
  res.end(await client.register.metrics());
});

// =====================
// ROUTES
// =====================
app.use('/api/v1', userRoutes);

// =====================
// TEST ROUTE
// =====================
app.get('/', (req, res) => {
  res.send("🚀 API is running");
});

// =====================
// DB SYNC (optional)
// =====================
// async function syncDB() {
//   try {
//     await sequelize.sync({ alter: true });
//     console.log('✅ All models synced');
//   } catch (err) {
//     console.error('❌ Sync error:', err);
//   }
// }
// syncDB();

const PORT = process.env.PORT || 5010;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});