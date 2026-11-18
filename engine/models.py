"""
ResQNet Optimization Engine — Data Models
Definitions for GeoNodes, Demands, Road Hazards, and Solver Results.
"""

from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field, model_validator

class GeoPoint(BaseModel):
    lat: float
    lng: float

class Node(BaseModel):
    id: str
    name: str
    lat: float
    lng: float
    type: str  # 'warehouse' or 'village'
    demand_qty: int = 0
    population: Optional[int] = None

class Vehicle(BaseModel):
    id: str
    driver: str
    capacity: int
    start_node_id: str
    speed_kmh: float = 40.0


class RoadSegment(BaseModel):
    id: str
    from_name: Optional[str] = None
    to_name: Optional[str] = None
    status: str = 'open'  # 'open', 'caution', 'blocked'
    damage: Optional[str] = 'none'  # 'none', 'minor', 'flooded', 'damaged'
    penalty_factor: float = 1.0

    @model_validator(mode="before")
    @classmethod
    def map_from_to(cls, data: Any):
        if isinstance(data, dict):
            if "from" in data and "from_name" not in data:
                data["from_name"] = data["from"]
            if "to" in data and "to_name" not in data:
                data["to_name"] = data["to"]
        return data

class RouteStop(BaseModel):
    node_id: str
    name: str
    lat: float
    lng: float
    load_before: int
    demand_delivered: int
    load_after: int
    distance_from_prev_km: float
    cumul_distance_km: float
    eta_minutes: float

class VehicleRoute(BaseModel):
    vehicle_id: str
    driver: str
    capacity: int
    total_load: int
    total_distance_km: float
    total_time_minutes: float
    stops: List[RouteStop]
    contains_road_hazard: bool = False
    rerouted_around_blocks: List[str] = Field(default_factory=list)

class OptimizationResult(BaseModel):
    status: str
    algorithm: str
    total_distance_km: float
    total_vehicles_used: int
    total_demand_satisfied: int
    routes: List[VehicleRoute]
    blocked_roads_avoided: List[str]
    savings_vs_naive: Dict[str, Any]
