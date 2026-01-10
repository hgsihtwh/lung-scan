# Chest Scan

Веб-приложение для анализа КТ грудной клетки с использованием AI модели.

## О проекте

Chest Scan - сервис для автоматического определения **нормы** в КТ снимках грудной клетки. В отличие от традиционных AI решений, которые ищут конкретные патологии, наша модель определяет класс "Normal" - исследования без признаков патологии. Это помогает радиологам приоритизировать случаи, требующие внимания.

### Возможности

- Загрузка DICOM архивов (.zip)
- Просмотр срезов с навигацией
- AI анализ: определение нормы / патологии
- Сохранение комментариев и фидбека
- Экспорт отчётов в Excel
- История исследований

## Технологии

**Frontend:**
- React 19
- Vite
- Tailwind CSS
- Zustand (state management)
- Cornerstone.js (DICOM viewer)

**Backend:**
- FastAPI
- SQLAlchemy
- SQLite
- PyDICOM

**ML Model:**
- MedicalNet (ResNet-18)
- Docker образ: `ntise/lungscan-api:cpu`

## Быстрый старт (Docker)

### Требования

- Docker
- Docker Compose

### Запуск

1. Клонируйте репозиторий:
```bash
git clone https://github.com/your-username/lung-scan.git
cd lung-scan
```

2. Создайте файл переменных окружения:
```bash
cp .env.example .env
```

3. Запустите все сервисы:
```bash
docker-compose up --build
```

4. Откройте в браузере:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000/docs
- Model API: http://localhost:8001/docs

## Локальная разработка (без Docker)

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend будет доступен на http://localhost:5173

### Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -e .
```

Создайте `.env` файл:
```bash
cp .env.example .env
```

Запустите сервер:
```bash
uvicorn app.main:app --reload
```

Backend будет доступен на http://localhost:8000

### ML Model
```bash
docker pull ntise/lungscan-api:cpu
docker run -p 8001:8000 ntise/lungscan-api:cpu
```

Model API будет доступен на http://localhost:8001

## Переменные окружения

### Backend (.env)

| Переменная | Описание | Пример |
|------------|----------|--------|
| `SECRET_KEY` | Секретный ключ для JWT токенов | `your-secret-key-here` |
| `ALGORITHM` | Алгоритм шифрования JWT | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Время жизни токена (минуты) | `10080` |
| `DATABASE_URL` | URL базы данных | `sqlite:///./sql_app.db` |
| `CORS_ORIGINS` | Разрешённые origins для CORS | `http://localhost:5173` |
| `HOST` | Хост сервера | `0.0.0.0` |
| `PORT` | Порт сервера | `8000` |
| `MODEL_API_URL` | URL API модели | `http://localhost:8001/predict` |
