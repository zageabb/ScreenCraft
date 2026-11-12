FROM node:22-alpine AS frontend
WORKDIR /build
COPY frontend/package*.json ./
RUN npm install --no-audit --no-fund
COPY frontend/ ./
RUN npm run build

FROM python:3.11-slim
WORKDIR /app
COPY backend/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt 'gunicorn>=22,<24'
COPY backend/ /app/backend/
COPY --from=frontend /build/dist/ /app/frontend/dist/
ENV PYTHONPATH=/app/backend PYTHONUNBUFFERED=1
EXPOSE 8085
CMD ["sh","-c","alembic -c backend/alembic.ini upgrade head && exec gunicorn --bind 0.0.0.0:8085 --workers 2 screencraft.api:create_app()"]
