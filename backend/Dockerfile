FROM python:3.12-slim

WORKDIR /app

COPY . .

RUN mkdir -p data/raw data/processed

RUN pip install --no-cache-dir .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--reload", "--host", "0.0.0.0", "--port", "8000"]