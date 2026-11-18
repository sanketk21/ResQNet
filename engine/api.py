"""
ResQNet Optimization Service — FastAPI Microservice
Exposes Google OR-Tools CVRP solver via REST endpoints.
Run:
    python -m uvicorn engine.api:app --host 127.0.0.1 --port 8000 --reload
"""

from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from engine.models import Node, Vehicle, RoadSegment, OptimizationResult
from engine.optimizer import ReliefRouteOptimizer
from engine.benchmark import get_demo_scenario

app = FastAPI(
    title="ResQNet OR-Tools Optimization Engine",
    description="Mathematical routing and capacity optimization for emergency relief logistics.",
    version="1.0.0"
)

# Enable CORS for local Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class OptimizeRequest(BaseModel):
    depot: Node
    villages: List[Node]
    fleet: List[Vehicle]
    roads: Optional[List[RoadSegment]] = None
    time_limit_sec: Optional[int] = 3

@app.get("/")
def health_check():
    return {
        "service": "ResQNet Optimization Engine",
        "engine": "Google OR-Tools CVRP",
        "status": "online"
    }

@app.get("/api/benchmark", response_model=OptimizationResult)
def get_benchmark():
    """Runs standard Kurigram flood scenario and returns optimal route comparison."""
    depot, villages, fleet, roads = get_demo_scenario()
    optimizer = ReliefRouteOptimizer(depot=depot, delivery_nodes=villages, fleet=fleet, road_hazards=roads)
    return optimizer.solve(time_limit_seconds=3)

@app.post("/api/routes/optimize", response_model=OptimizationResult)
def optimize_routes(req: OptimizeRequest):
    """Dynamically solves multi-vehicle routes avoiding currently blocked roads."""
    try:
        optimizer = ReliefRouteOptimizer(
            depot=req.depot,
            delivery_nodes=req.villages,
            fleet=req.fleet,
            road_hazards=req.roads or []
        )
        result = optimizer.solve(time_limit_seconds=req.time_limit_sec or 3)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
