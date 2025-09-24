from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.database import engine, Base
from .routes import auth, contacts, deals, companies, activities
# Import all models to ensure SQLAlchemy relationships are set up properly
from . import models

# Create all tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="CRM API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # React dev server
        "http://localhost:3001",  # React dev server (backup port)
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://localhost:5173",  # Vite dev server
        "http://127.0.0.1:5173",
        "*"  # Allow all origins for development
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["authentication"])
app.include_router(
    contacts.router, prefix="/api/v1/contacts", tags=["contacts"])
app.include_router(deals.router, prefix="/api/v1/deals", tags=["deals"])
app.include_router(
    companies.router, prefix="/api/v1/companies", tags=["companies"])
app.include_router(activities.router,
                   prefix="/api/v1/activities", tags=["activities"])


@app.get("/")
async def root():
    return {"message": "CRM API is running"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
