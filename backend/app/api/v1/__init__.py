from fastapi import APIRouter

from .analysis import router as analysis_router
from .feedback import router as feedback_router
from .reports import router as reports_router
from .scans import router as scans_router
from .upload import router as upload_router

router = APIRouter(prefix="/api")

router.include_router(scans_router, tags=["Scans"])
router.include_router(upload_router, tags=["Upload"])
router.include_router(analysis_router, tags=["Analysis"])
router.include_router(feedback_router, tags=["Feedback"])
router.include_router(reports_router, tags=["Reports"])
