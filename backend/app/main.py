from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from .core.database import engine, Base
from .routes import auth, contacts, deals, companies, activities, tasks, dashboard, users, roles, system_config, custom_fields, email_templates, integrations, notes
# Import all models to ensure SQLAlchemy relationships are set up properly
from . import models
import traceback

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
app.include_router(tasks.router, prefix="/api/v1/tasks", tags=["tasks"])
app.include_router(
    dashboard.router, prefix="/api/v1/dashboard", tags=["dashboard"])
app.include_router(users.router, prefix="/api/v1/users", tags=["users"])
app.include_router(roles.router, prefix="/api/v1/roles", tags=["roles"])
app.include_router(system_config.router,
                   prefix="/api/v1/system-config", tags=["system-config"])
app.include_router(custom_fields.router,
                   prefix="/api/v1/custom-fields", tags=["custom-fields"])
app.include_router(email_templates.router,
                   prefix="/api/v1/email-templates", tags=["email-templates"])
app.include_router(integrations.router,
                   prefix="/api/v1/integrations", tags=["integrations"])
app.include_router(notes.router, prefix="/api/v1/notes", tags=["notes"])

# Global exception handler to preserve CORS headers


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Handle all unhandled exceptions and ensure CORS headers are present"""
    error_detail = str(exc)
    print(f"Unhandled exception: {error_detail}")
    print(traceback.format_exc())

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": error_detail,
            "type": "internal_server_error"
        },
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "*"
        }
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle validation errors with CORS headers"""
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": exc.errors(), "body": exc.body},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": "true"
        }
    )


@app.get("/")
async def root():
    return {"message": "CRM API is running"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
