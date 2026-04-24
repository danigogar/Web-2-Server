# Deploy de Biblioteca API en Railway

## Instalacion de Railway CLI

npm install -g @railway/cli
railway login

## Desplegar

railway up
railway logs
railway open

## Variables de entorno necesarias en Railway

NODE_ENV = production
PORT = 3000
DATABASE_URL = postgresql://postgres.xxxx:password@xxxx.pooler.supabase.com:6543/postgres?pgbouncer=true
JWT_SECRET = tu-clave-secreta-de-32-caracteres

## Comandos utiles

railway variables          # Ver variables
railway variables set      # Añadir variable
railway logs --tail        # Ver logs en tiempo real
