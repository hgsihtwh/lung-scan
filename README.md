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

Заполните `.env` (см. раздел "Переменные окружения").

3. Запустите все сервисы:
```bash
docker-compose up --build
```

4. Откройте в браузере:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000/docs
- Model API: http://localhost:8001/docs

## Локальная разработка (без Docker)

### Требования

- Node.js 20+
- Python 3.12+
- [uv](https://docs.astral.sh/uv/) (Python package manager)

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend будет доступен на http://localhost:5173

### Backend

1. Установите uv (если ещё не установлен):
```bash
# Windows
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"

# macOS/Linux
curl -LsSf https://astral.sh/uv/install.sh | sh
```

2. Установите зависимости:
```bash
cd backend
uv sync
```

3. Создайте `.env` файл в **корне проекта** (не в папке backend!):
```bash
cd ..
cp .env.example .env
```

Заполните переменные окружения (см. раздел ниже).

4. Запустите сервер:
```bash
cd backend
uv run uvicorn app.main:app --reload
```

Backend будет доступен на http://localhost:8000

### ML Model
```bash
docker pull ntise/lungscan-api:cpu
docker run -p 8001:8000 ntise/lungscan-api:cpu
```

Model API будет доступен на http://localhost:8001

## Переменные окружения

| Переменная | Описание | Пример |
|------------|----------|--------|
| **Security** |
| `SECRET_KEY` | Секретный ключ для JWT токенов | `your-secret-key-here` |
| `ALGORITHM` | Алгоритм шифрования JWT | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Время жизни токена (минуты) | `10080` |
| **Database** |
| `DATABASE_URL` | URL базы данных | `sqlite:///./sql_app.db` |
| **CORS** |
| `CORS_ORIGINS` | Разрешённые origins для CORS | `http://localhost:5173` |
| **Server** |
| `HOST` | Хост сервера | `0.0.0.0` |
| `PORT` | Порт сервера | `8000` |
| **Model API** |
| `MODEL_API_URL` | URL API модели | `http://localhost:8001/predict` |
| **Email (Gmail)** |
| `SMTP_HOST` | SMTP сервер | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP порт | `587` |
| `SMTP_USER` | Gmail адрес | `your-email@gmail.com` |
| `SMTP_PASSWORD` | App Password (16 символов) | `abcdefghijklmnop` |
| `SMTP_FROM_EMAIL` | Email отправителя | `your-email@gmail.com` |
| `SMTP_FROM_NAME` | Имя отправителя | `Lung Scan` |


### Скриншоты работы сервиса:
<img width="2553" height="1274" alt="image" src="https://github.com/user-attachments/assets/8169ab21-c0f8-4259-8d66-aa1a1519ba7f" />
---
<img width="2545" height="1272" alt="image" src="https://github.com/user-attachments/assets/af8a73ac-c6e7-413d-a209-4354b35f02d0" />
---
<img width="2531" height="1287" alt="image" src="https://github.com/user-attachments/assets/269db37f-f347-4c16-9bef-e383cfe3239e" />
---
<img width="2558" height="1284" alt="image" src="https://github.com/user-attachments/assets/83d9ede5-f865-47bb-8004-f08ce3210e32" />



