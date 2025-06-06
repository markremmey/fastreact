# backend/Dockerfile
FROM python:3.11-slim

# Set working directory and copy requirements
WORKDIR /app
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy the FastAPI app code
COPY app/ app/

# Expose port 8000 and define the startup command
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
