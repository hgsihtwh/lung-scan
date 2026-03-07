import random
import string

import redis

from ..core.config import settings


class VerificationService:
    def __init__(self) -> None:
        self.redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)
        self.code_ttl = 300  # 5 минут

    def generate_code(self) -> str:
        return "".join(random.choices(string.digits, k=6))

    def save_code(self, email: str, code: str) -> bool:
        try:
            key = f"verification:{email}"
            self.redis_client.setex(key, self.code_ttl, code)
            print(f"[VERIFICATION] Code saved for {email}")
            return True
        except Exception as e:
            print(f"[VERIFICATION] Failed to save code for {email}: {e}")
            return False

    def verify_code(self, email: str, code: str) -> bool:
        try:
            key = f"verification:{email}"
            stored_code = self.redis_client.get(key)

            if not stored_code:
                print(f"[VERIFICATION] No code found for {email}")
                return False

            if stored_code == code:
                self.redis_client.delete(key)
                print(f"[VERIFICATION] Code verified for {email}")
                return True
            else:
                print(f"[VERIFICATION] Invalid code for {email}")
                return False

        except Exception as e:
            print(f"[VERIFICATION] Error verifying code for {email}: {e}")
            return False

    def delete_code(self, email: str) -> bool:
        try:
            key = f"verification:{email}"
            self.redis_client.delete(key)
            print(f"[VERIFICATION] Code deleted for {email}")
            return True
        except Exception as e:
            print(f"[VERIFICATION] Failed to delete code for {email}: {e}")
            return False

    def get_ttl(self, email: str) -> int:
        try:
            key = f"verification:{email}"
            ttl = self.redis_client.ttl(key)
            return ttl if ttl > 0 else -1
        except Exception as e:
            print(f"[VERIFICATION] Error getting TTL for {email}: {e}")
            return -1
