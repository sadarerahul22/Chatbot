import os
import logging
import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from pathlib import Path

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

env_path = Path(__file__).parent / '.env'
load_dotenv(dotenv_path=env_path)

app = FastAPI()

# ✅ UPDATED CORS - Allow Netlify and localhost
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Local development
        "https://thunderous-strudel-5f10e4.netlify.app",  # Your Netlify URL
        "https://*.netlify.app",  # Allow all Netlify sites (optional)
    ],
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

# Read from .env – using Groq
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

if GROQ_API_KEY:
    logger.info("✅ Groq API key loaded (starts with %s...)", GROQ_API_KEY[:8])
else:
    logger.error("❌ GROQ_API_KEY not found in environment!")

@app.get("/test-key")
async def test_key():
    if GROQ_API_KEY:
        return {"status": "ok", "key_prefix": GROQ_API_KEY[:8] + "..."}
    else:
        return {"status": "error", "message": "GROQ_API_KEY not set"}

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    reply: str

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    if not GROQ_API_KEY:
        raise HTTPException(status_code=500, detail="API key not configured")

    system_prompt = (
        "You are Chitti, a helpful AI assistant for a medical student. "
        "Answer MBBS-related questions accurately and in a friendly, concise manner. "
        "If you don't know, say you don't know."
    )
    payload = {
        "model": GROQ_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": request.message}
        ],
        "temperature": 0.7,
        "max_tokens": 1024
    }
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.post(GROQ_URL, json=payload, headers=headers)
            response.raise_for_status()
            data = response.json()
            reply = data["choices"][0]["message"]["content"]
            return ChatResponse(reply=reply)
        except httpx.HTTPStatusError as e:
            error_detail = f"Groq API error: {e.response.text}"
            logger.error(error_detail)
            raise HTTPException(status_code=500, detail=error_detail)
        except Exception as e:
            logger.error("Unexpected error: %s", str(e))
            raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    return {"status": "ok"}