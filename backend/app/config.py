import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

BASE_DIR = Path(__file__).resolve().parent.parent
DEFAULT_WORKSPACE = (BASE_DIR.parent / "workspace").resolve()
DEFAULT_OUTPUT = (BASE_DIR.parent / "output").resolve()

class Settings(BaseSettings):
    APP_NAME: str = "JARVIS Personal Assistant"
    VERSION: str = "0.1.0"
    DEBUG: bool = True
    
    # Server configuration
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    
    # AI / LLM configuration
    OPENAI_API_KEY: str = ""
    OPENAI_API_BASE: str = "https://api.openai.com/v1"
    OPENAI_MODEL: str = "gpt-4o"
    SYSTEM_NAME: str = "JARVIS"
    
    # Directories
    WORKSPACE_DIR: Path = DEFAULT_WORKSPACE
    OUTPUT_DIR: Path = DEFAULT_OUTPUT
    DATABASE_URL: str = f"sqlite+aiosqlite:///{BASE_DIR / 'jarvis.db'}"
    
    # Security allowlists
    ALLOWED_EXTENSIONS: list[str] = [
        ".txt", ".py", ".js", ".jsx", ".ts", ".tsx", ".json", 
        ".md", ".csv", ".pdf", ".docx", ".pptx", ".html", ".css", ".yaml", ".yml"
    ]
    APPROVED_APPLICATIONS: list[str] = [
        "notepad.exe",
        "calc.exe",
        "explorer.exe",
        "code.cmd",
        "cmd.exe",
        "powershell.exe"
    ]
    
    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        extra="ignore"
    )

settings = Settings()

# Ensure directories exist
settings.WORKSPACE_DIR.mkdir(parents=True, exist_ok=True)
settings.OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
