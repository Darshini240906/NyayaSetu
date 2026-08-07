from contextlib import asynccontextmanager
from importlib import import_module
from typing import AsyncIterator
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from core.logging import configure_logging
from db.mongo import mongo_manager
import asyncio

# reminder worker
from reminders.worker import run_reminder_loop

ROUTE_MODULES = (
    "api.routes.auth", "api.routes.otp", "api.routes.upload",
    "api.routes.documents", "api.routes.query", "api.routes.search",
    "api.routes.summary", "api.routes.voice", "api.routes.admin",
    "api.routes.dashboard", "api.routes.domains",
    "api.routes.chat_history",
    # NyayaSetu additions
    "api.routes.legal", "api.routes.reminders", "api.routes.calendar",
    "api.routes.court",
)

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    configure_logging(settings.log_level)
    await mongo_manager.connect()
    # start background reminder worker
    reminder_task = asyncio.create_task(run_reminder_loop())
    app.state.reminder_task = reminder_task
    try:
        yield
    finally:
        # cancel reminder worker and close DB
        try:
            reminder_task.cancel()
            await reminder_task
        except Exception:
            pass
        await mongo_manager.close()

def create_app() -> FastAPI:
    app = FastAPI(title=settings.app_name, version=settings.app_version, lifespan=lifespan, debug=settings.debug)
    app.add_middleware(CORSMiddleware, allow_origins=settings.cors_origins, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
    for mod in ROUTE_MODULES:
        try:
            m = import_module(mod)
            r = getattr(m, "router", None)
            if r: app.include_router(r, prefix=settings.api_prefix)
        except ModuleNotFoundError as e:
            if e.name and mod.startswith(e.name): print(f"Skip: {mod}"); continue
            raise
    @app.get("/health")
    async def health(): return {"status": "ok", "service": settings.app_name}
    @app.get("/ready")
    async def ready(): return {"status": "ready"}
    return app

app = create_app()