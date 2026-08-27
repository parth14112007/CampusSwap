import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import electronicsAssistantHandler from './api/electronics-assistant.js'

function electronicsApiDevPlugin() {
  return {
    name: 'electronics-api-dev-server',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url ? req.url.split('?')[0] : '';
        if (url === '/api/electronics-assistant') {
          if (req.method === 'POST') {
            let rawBody = '';
            req.on('data', (chunk) => {
              rawBody += chunk;
            });
            req.on('end', async () => {
              try {
                req.body = rawBody ? JSON.parse(rawBody) : {};
              } catch {
                req.body = {};
              }
              await electronicsAssistantHandler(req, res);
            });
            return;
          } else {
            await electronicsAssistantHandler(req, res);
            return;
          }
        }
        next();
      });
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  if (env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY) {
    process.env.GEMINI_API_KEY = env.GEMINI_API_KEY;
  }
  if (env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY) {
    process.env.OPENAI_API_KEY = env.OPENAI_API_KEY;
  }

  return {
    plugins: [react(), electronicsApiDevPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 3000,
      open: false,
      watch: {
        ignored: ['**/Git/**', '**/stitch_extracted/**', '**/dist/**', '**/*.tmp'],
      },
    },
  };
});
