import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { exec } from 'child_process'
import fs from 'fs'
import path from 'path'

function apiMiddlewarePlugin() {
  return {
    name: 'api-middleware',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/api/refresh-model' && req.method === 'POST') {
          exec('python3 data_engine/generate_dataset.py', { cwd: path.resolve(import.meta.dirname, '..') }, (error, stdout, stderr) => {
            if (error) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: error.message, stderr }));
              return;
            }
            const jsonPath = path.resolve(import.meta.dirname, 'src/data/forecast_data.json');
            const data = fs.readFileSync(jsonPath, 'utf-8');
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(data);
          });
          return;
        }

        if (req.url === '/api/upload-csv' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const { material, csvContent } = JSON.parse(body);
              const targetPath = path.resolve(import.meta.dirname, `../data_engine/custom_${material}.csv`);
              fs.writeFileSync(targetPath, csvContent, 'utf-8');

              exec('python3 data_engine/generate_dataset.py', { cwd: path.resolve(import.meta.dirname, '..') }, (error, stdout, stderr) => {
                if (error) {
                  res.statusCode = 500;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: error.message, stderr }));
                  return;
                }
                const jsonPath = path.resolve(import.meta.dirname, 'src/data/forecast_data.json');
                const data = fs.readFileSync(jsonPath, 'utf-8');
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(data);
              });
            } catch (err) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        next();
      });
    }
  };
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    apiMiddlewarePlugin()
  ],
})

