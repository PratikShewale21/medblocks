from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.records import router as records_router
from routes.access import router as access_router


# -------------------------------
# App Initialization
# -------------------------------

app = FastAPI(
    title="MEDBLOCKS API",
    description="Backend for Decentralized Medical Records System",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)


# -------------------------------
# CORS (Frontend Connection)
# -------------------------------

# Change this to your frontend domain in production
ALLOWED_ORIGINS = [
    "http://localhost:3000",   # React
    "http://localhost:5173",   # Vite
    "http://localhost:8080",   # Android emulator
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -------------------------------
# API Routes
# -------------------------------

app.include_router(records_router)
app.include_router(access_router)


# -------------------------------
# System Routes
# -------------------------------

@app.get("/", tags=["System"])
def root():
    return {
        "project": "MEDBLOCKS",
        "type": "backend",
        "status": "running",
        "api_docs": "/docs"
    }


@app.get("/health", tags=["System"])
def health_check():
    return {
        "status": "ok",
        "service": "backend"
    }
