from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql://malimind:malimind@localhost:5432/malimind"
    openai_api_key: str = ""
    jwt_secret: str = "dev-secret-change-in-production"
    revenuecat_api_key: str = ""
    clerk_secret_key: str = ""
    cors_origins: list[str] = ["http://localhost:5173"]

    class Config:
        env_file = ".env"


settings = Settings()
