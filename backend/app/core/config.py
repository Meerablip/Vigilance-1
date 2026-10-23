import os

class Settings:
    PROJECT_NAME: str = "VIGILANCE Defense Fusion Platform"
    API_V1_STR: str = "/api"
    POLICY_VERSION: str = "VIGILANCE-DEMO-2.4"

    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql+psycopg://neondb_owner:npg_4xKBLHgpzNa3@ep-fancy-union-b41atksf-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require"
    )

    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "vigilance_defense_super_secret_key_2026_c2_platform")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 720

    INITIAL_ADMIN_EMAIL: str = "Meera@defence.com"
    INITIAL_ADMIN_NAME: str = "Meera Chaudhari"
    INITIAL_ADMIN_ROLE: str = "administrator"
    INITIAL_ADMIN_SECTOR: str = "National Command HQ"

settings = Settings()
