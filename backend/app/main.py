from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api import auth_router, v1_router
from .core.config import settings
from .database import Base, engine

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="LungScan API",
    description="API для анализа КТ грудной клетки",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(v1_router)


@app.get("/")
async def root():
    return {"message": "LungScan API", "status": "running"}


@app.get("/health")
async def health():
    return {"status": "healthy"}
