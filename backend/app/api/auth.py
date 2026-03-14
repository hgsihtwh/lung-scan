from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from ..core.config import settings
from ..core.security import create_access_token, get_password_hash, verify_password
from ..database import get_db
from ..models import User
from ..schemas import (
    ForgotPassword,
    ResendCode,
    ResetPassword,
    Token,
    UserRegister,
    VerifyCode,
)
from ..services import EmailService, VerificationService

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

verification_service = VerificationService()


@router.post("/register", status_code=status.HTTP_200_OK)
async def register(user_data: UserRegister, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists",
        )

    code = verification_service.generate_code()

    if not verification_service.save_code(user_data.email, code):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save verification code",
        )

    hashed_password = get_password_hash(user_data.password)
    verification_service.redis_client.setex(
        f"password:{user_data.email}",
        300,  # 5 минут
        hashed_password,
    )

    if not EmailService.send_verification_code(user_data.email, code):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send verification email",
        )

    return {
        "status": "verification_required",
        "message": "Verification code sent to your email",
        "email": user_data.email,
    }


@router.post("/verify", response_model=Token, status_code=status.HTTP_201_CREATED)
async def verify_code(verify_data: VerifyCode, db: Session = Depends(get_db)):
    if not verification_service.verify_code(verify_data.email, verify_data.code):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification code",
        )

    password_key = f"password:{verify_data.email}"
    hashed_password = verification_service.redis_client.get(password_key)

    if not hashed_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Registration session expired. Please start again.",
        )

    new_user = User(email=verify_data.email, hashed_password=hashed_password)

    try:
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        verification_service.redis_client.delete(password_key)

        EmailService.send_welcome_email(new_user.email, new_user.email)

        access_token = create_access_token(
            data={"sub": new_user.email},
            expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
        )

        return Token(access_token=access_token, token_type="bearer")

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {e!s}",
        )


@router.post("/resend-code", status_code=status.HTTP_200_OK)
async def resend_code(resend_data: ResendCode):
    """Повторная отправка кода верификации"""
    password_key = f"password:{resend_data.email}"
    if not verification_service.redis_client.exists(password_key):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No active registration session. Please start registration again.",
        )

    verification_service.delete_code(resend_data.email)

    code = verification_service.generate_code()

    if not verification_service.save_code(resend_data.email, code):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save verification code",
        )

    if not EmailService.send_verification_code(resend_data.email, code):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send verification email",
        )

    return {
        "status": "success",
        "message": "New verification code sent to your email",
    }


@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == form_data.username).first()

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(
        data={"sub": user.email},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )

    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/forgot-password", status_code=status.HTTP_200_OK)
async def forgot_password(forgot_data: ForgotPassword, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == forgot_data.email).first()

    if not user:
        return {
            "status": "success",
            "message": "If this email is registered, you will receive a password reset link",
        }

    reset_token = verification_service.generate_reset_token()

    if not verification_service.save_reset_token(forgot_data.email, reset_token):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate reset token",
        )

    if not EmailService.send_password_reset_email(forgot_data.email, reset_token):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send reset email",
        )

    return {
        "status": "success",
        "message": "If this email is registered, you will receive a password reset link",
    }


@router.post("/reset-password", status_code=status.HTTP_200_OK)
async def reset_password(reset_data: ResetPassword, db: Session = Depends(get_db)):
    email = verification_service.verify_reset_token(reset_data.token)

    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token",
        )

    user = db.query(User).filter(User.email == email).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    try:
        user.hashed_password = get_password_hash(reset_data.new_password)
        db.commit()

        return {
            "status": "success",
            "message": "Password successfully reset",
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to reset password: {e!s}",
        )
