from datetime import UTC, datetime
from bson import ObjectId
from fastapi import APIRouter, Depends
from api.dependencies.check_permissions import require_permission
from api.dependencies.get_database import DatabaseDependency
from core.context import TenantContext
from core.enums import AgeTag
from core.freshness import compute_age_tag

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/metrics")
async def metrics(db: DatabaseDependency, context: TenantContext = Depends(require_permission("documents:read"))) -> dict:
    docs = await db["documents"].count_documents({"org_id": context.org_id, "status": {"$ne": "deleted"}})
    ready = await db["documents"].count_documents({"org_id": context.org_id, "status": "ready"})
    queries = await db["audit_logs"].count_documents({"org_id": context.org_id})
    logs = await db["audit_logs"].find({"org_id": context.org_id}).limit(100).to_list(100)
    avg_conf = sum(l.get("confidence", 0) for l in logs) / len(logs) if logs else 0
    members = await db["users"].count_documents({"org_id": context.org_id})
    domains = await db["domains"].count_documents({"org_id": context.org_id})
    return {"total_documents": docs, "indexed_documents": ready, "total_queries": queries,
            "avg_confidence": round(avg_conf, 3), "total_members": members, "total_domains": domains}

@router.get("/knowledge-map")
async def knowledge_map(db: DatabaseDependency, context: TenantContext = Depends(require_permission("documents:read"))) -> dict:
    docs = await db["documents"].find({"org_id": context.org_id, "status": "ready"}).limit(50).to_list(50)
    nodes = [{"id": str(d["_id"]), "label": d.get("filename",""), "weight": d.get("document_weight",1.0),
               "usage_tag": d.get("usage_tag","unused"), "query_count": d.get("query_count",0)} for d in docs]
    return {"nodes": nodes}

@router.get("/gaps")
async def gaps(db: DatabaseDependency, context: TenantContext = Depends(require_permission("documents:read"))) -> list:
    logs = await db["audit_logs"].find({"org_id": context.org_id, "confidence_label": "low"}).limit(20).to_list(20)
    return [{"query": l.get("query",""), "confidence": l.get("confidence",0)} for l in logs]

@router.get("/insights")
async def insights(db: DatabaseDependency, context: TenantContext = Depends(require_permission("documents:read"))) -> list:
    """
    Predictive insights, computed on the fly rather than relying on a manually-set
    freshness_tag (which nothing ever changes automatically, so it was always empty).

    Three signals feed this:
      1. Document age, judged relative to how long the company has been on
         NyayaSetu (not a fixed number of days) -> new / recent / old / outdated
      2. High-weight documents nobody is actually querying -> possible dead weight
      3. Domains whose answer confidence is trending down recently vs before
    """
    now = datetime.now(UTC)
    out: list[dict] = []

    org = await db["organizations"].find_one({"_id": ObjectId(context.org_id)})
    org_created_at = org.get("created_at") if org else None

    # --- 1. Age relative to the company's time on NyayaSetu ----------------------
    docs = await db["documents"].find(
        {"org_id": context.org_id, "status": {"$ne": "deleted"}}
    ).limit(200).to_list(200)

    for d in docs:
        # An explicit "expired" set by a human always wins.
        if d.get("freshness_tag") == "expired":
            out.append({
                "type": "expired", "severity": "critical",
                "message": f"'{d.get('filename')}' is marked expired and should be replaced or removed.",
                "document_id": str(d["_id"]),
            })
            continue

        created_at = d.get("last_verified") or d.get("created_at")
        if not created_at:
            continue
        age_tag = compute_age_tag(created_at, org_created_at, now)

        if age_tag == AgeTag.OUTDATED:
            out.append({
                "type": "outdated", "severity": "critical",
                "message": f"'{d.get('filename')}' dates back to early in your time on NyayaSetu and may be outdated.",
                "document_id": str(d["_id"]),
            })
        elif age_tag == AgeTag.OLD:
            out.append({
                "type": "old", "severity": "warning",
                "message": f"'{d.get('filename')}' is one of the older documents on your account — consider re-verifying it.",
                "document_id": str(d["_id"]),
            })

    # --- 2. Heavily-weighted but unused documents --------------------------------
    unused = await db["documents"].find({
        "org_id": context.org_id, "status": "ready",
        "usage_tag": "unused", "document_weight": {"$gt": 1.0},
    }).limit(5).to_list(5)
    for d in unused:
        out.append({
            "type": "unused_weighted", "severity": "info",
            "message": f"'{d.get('filename')}' is weighted highly in search but nobody has queried it yet.",
            "document_id": str(d["_id"]),
        })

    # --- 3. Per-domain confidence trend ------------------------------------------
    domains = await db["domains"].find({"org_id": context.org_id}).to_list(100)
    for dom in domains:
        did = str(dom["_id"])
        recent = await db["audit_logs"].find(
            {"org_id": context.org_id, "domain_id": did}
        ).sort("created_at", -1).limit(20).to_list(20)
        if len(recent) < 10:
            continue
        newer, older = recent[:10], recent[10:20]
        newer_avg = sum(l.get("confidence", 0) for l in newer) / len(newer)
        older_avg = sum(l.get("confidence", 0) for l in older) / len(older) if older else newer_avg
        drop = older_avg - newer_avg
        if drop >= 0.15:
            out.append({
                "type": "confidence_drop", "severity": "warning",
                "message": (f"Answer confidence in '{dom['name']}' dropped "
                            f"{round(drop * 100)}% recently — its documents may need attention."),
                "domain_id": did,
            })

    severity_rank = {"critical": 0, "warning": 1, "info": 2}
    out.sort(key=lambda i: severity_rank.get(i["severity"], 3))
    return out[:10]

@router.get("/gap-analysis")
async def gap_analysis(db: DatabaseDependency, context: TenantContext = Depends(require_permission("documents:read"))) -> dict:
    domains = await db["domains"].find({"org_id": context.org_id}).to_list(100)
    domain_names = {str(d["_id"]): d["name"] for d in domains}

    results = []
    for d in domains:
        did = str(d["_id"])
        total = await db["audit_logs"].count_documents({"org_id": context.org_id, "domain_id": did})
        low = await db["audit_logs"].count_documents({"org_id": context.org_id, "domain_id": did, "confidence_label": "low"})
        coverage = round(100 * (1 - low / total)) if total else None
        severity = "no-data"
        if coverage is not None:
            severity = "critical" if coverage < 40 else "high-risk" if coverage < 60 else "healthy"
        results.append({
            "domain_id": did, "name": d["name"], "domain_type": d.get("domain_type", "custom"),
            "coverage": coverage, "total_queries": total, "low_confidence_queries": low,
            "severity": severity,
        })

    covered = [r["coverage"] for r in results if r["coverage"] is not None]

    # Flat, real list of individual "couldn't find it" moments — each low-confidence
    # query the org has ever run, most recent first. This is what actually populates
    # the Gap Analysis list in the UI.
    gap_logs = await db["audit_logs"].find(
        {"org_id": context.org_id, "confidence_label": "low"}
    ).sort("created_at", -1).limit(50).to_list(50)

    recent_gaps = []
    for l in gap_logs:
        did = l.get("domain_id")
        confidence_pct = round((l.get("confidence") or 0) * 100)
        recent_gaps.append({
            "id": str(l["_id"]),
            "query": l.get("query", ""),
            "domain_name": domain_names.get(did, "General / org-wide"),
            "confidence": confidence_pct,
            "severity": "critical" if confidence_pct < 30 else "high-risk",
            "created_at": l.get("created_at"),
        })

    return {
        "domains": results,
        "recent_gaps": recent_gaps,
        "avg_coverage": round(sum(covered) / len(covered)) if covered else 0,
        "critical_count": sum(1 for r in results if r["severity"] == "critical"),
        "high_risk_count": sum(1 for r in results if r["severity"] == "high-risk"),
        "domains_analyzed": len(covered),
        "total_domains": len(results),
        "total_gaps": len(recent_gaps),
    }