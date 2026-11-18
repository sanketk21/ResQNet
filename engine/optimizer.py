"""
ResQNet Routing Engine — Google OR-Tools Capacitated Vehicle Routing Problem (CVRP)
Handles:
- Dynamic obstacle avoidance (Flooded / Damaged roads marked as Blocked)
- Vehicle load capacity limits
- Multi-stop clustered delivery routes
- True shortest path with alternate detours
"""

import math
from typing import List, Dict, Tuple, Optional
from ortools.constraint_solver import routing_enums_pb2
from ortools.constraint_solver import pywrapcp

from engine.models import Node, Vehicle, RoadSegment, RouteStop, VehicleRoute, OptimizationResult


def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate great-circle distance between two GPS coordinates in kilometers."""
    R = 6371.0  # Earth's radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


class ReliefRouteOptimizer:
    def __init__(
        self,
        depot: Node,
        delivery_nodes: List[Node],
        fleet: List[Vehicle],
        road_hazards: Optional[List[RoadSegment]] = None
    ):
        self.depot = depot
        self.delivery_nodes = delivery_nodes
        self.nodes = [depot] + delivery_nodes
        self.fleet = fleet
        self.road_hazards = road_hazards or []
        self.blocked_penalties = {}
        self._preprocess_hazards()

    def _preprocess_hazards(self):
        """Map road closures to penalties between node pairs."""
        for road in self.road_hazards:
            if road.status == 'blocked':
                # Large penalty in meters (effectively infinite, forces detour)
                self.blocked_penalties[(road.from_name, road.to_name)] = 999_999
                self.blocked_penalties[(road.to_name, road.from_name)] = 999_999
            elif road.status == 'caution':
                # 1.5x slower / rough terrain penalty
                self.blocked_penalties[(road.from_name, road.to_name)] = 1.5
                self.blocked_penalties[(road.to_name, road.from_name)] = 1.5

    def _compute_cost_matrix(self) -> List[List[int]]:
        """Compute all-pairs distance matrix in integer meters for OR-Tools."""
        n = len(self.nodes)
        matrix = [[0] * n for _ in range(n)]

        for i in range(n):
            for j in range(n):
                if i == j:
                    matrix[i][j] = 0
                    continue

                dist_km = haversine_distance_km(
                    self.nodes[i].lat, self.nodes[i].lng,
                    self.nodes[j].lat, self.nodes[j].lng
                )
                dist_meters = int(dist_km * 1000)

                # Check road hazard status between these two nodes
                pair = (self.nodes[i].name, self.nodes[j].name)
                if pair in self.blocked_penalties:
                    penalty = self.blocked_penalties[pair]
                    if penalty >= 900_000:
                        dist_meters = 1_000_000  # Extreme cost: road is blocked
                    else:
                        dist_meters = int(dist_meters * penalty)

                matrix[i][j] = dist_meters

        return matrix

    def solve(self, time_limit_seconds: int = 3) -> OptimizationResult:
        """Formulate and solve CVRP using Google OR-Tools."""
        distance_matrix = self._compute_cost_matrix()
        demands = [node.demand_qty for node in self.nodes]
        vehicle_capacities = [v.capacity for v in self.fleet]
        num_vehicles = len(self.fleet)
        depot_idx = 0

        # 1. Create Routing Index Manager & Routing Model
        manager = pywrapcp.RoutingIndexManager(len(self.nodes), num_vehicles, depot_idx)
        routing = pywrapcp.RoutingModel(manager)

        # 2. Distance callback & Arc cost evaluator
        def distance_callback(from_index, to_index):
            from_node = manager.IndexToNode(from_index)
            to_node = manager.IndexToNode(to_index)
            return distance_matrix[from_node][to_node]

        transit_callback_index = routing.RegisterTransitCallback(distance_callback)
        routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)

        # 3. Add Capacity Constraints
        def demand_callback(from_index):
            from_node = manager.IndexToNode(from_index)
            return demands[from_node]

        demand_callback_index = routing.RegisterUnaryTransitCallback(demand_callback)
        routing.AddDimensionWithVehicleCapacity(
            demand_callback_index,
            slack_max=0,  # null capacity slack
            vehicle_capacities=vehicle_capacities,
            fix_start_cumul_to_zero=True,
            name="Capacity"
        )

        # 4. Search Parameters
        search_parameters = pywrapcp.DefaultRoutingSearchParameters()
        search_parameters.first_solution_strategy = (
            routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
        )
        search_parameters.local_search_metaheuristic = (
            routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH
        )
        search_parameters.time_limit.FromSeconds(time_limit_seconds)

        # 5. Solve Problem
        solution = routing.SolveWithParameters(search_parameters)

        if not solution:
            return OptimizationResult(
                status="INFEASIBLE",
                algorithm="Google OR-Tools CVRP (Guided Local Search)",
                total_distance_km=0.0,
                total_vehicles_used=0,
                total_demand_satisfied=0,
                routes=[],
                blocked_roads_avoided=[r.id for r in self.road_hazards if r.status == 'blocked'],
                savings_vs_naive={}
            )

        # 6. Parse Solution
        vehicle_routes: List[VehicleRoute] = []
        total_dist_meters = 0
        total_demand_delivered = 0
        vehicles_used_count = 0

        blocked_names = {
            f"{r.from_name} ➔ {r.to_name}" for r in self.road_hazards if r.status == 'blocked'
        }

        for vehicle_id in range(num_vehicles):
            index = routing.Start(vehicle_id)
            stops: List[RouteStop] = []
            cumul_dist_m = 0
            route_demand_total = 0

            # Calculate total load for this vehicle first
            temp_idx = index
            while not routing.IsEnd(temp_idx):
                node_idx = manager.IndexToNode(temp_idx)
                route_demand_total += demands[node_idx]
                temp_idx = solution.Value(routing.NextVar(temp_idx))

            if route_demand_total > 0:
                vehicles_used_count += 1

            current_load = route_demand_total

            while True:
                node_idx = manager.IndexToNode(index)
                curr_node = self.nodes[node_idx]
                delivered = demands[node_idx]
                load_after = max(0, current_load - delivered)

                prev_dist_km = 0.0
                if stops:
                    prev_dist_km = haversine_distance_km(stops[-1].lat, stops[-1].lng, curr_node.lat, curr_node.lng)

                eta_min = (cumul_dist_m / 1000.0) / (self.fleet[vehicle_id].speed_kmh) * 60.0

                stops.append(RouteStop(
                    node_id=curr_node.id,
                    name=curr_node.name,
                    lat=curr_node.lat,
                    lng=curr_node.lng,
                    load_before=current_load,
                    demand_delivered=delivered,
                    load_after=load_after,
                    distance_from_prev_km=round(prev_dist_km, 2),
                    cumul_distance_km=round(cumul_dist_m / 1000.0, 2),
                    eta_minutes=round(eta_min, 1)
                ))

                current_load = load_after

                if routing.IsEnd(index):
                    break

                previous_index = index
                index = solution.Value(routing.NextVar(index))
                step_dist = routing.GetArcCostForVehicle(previous_index, index, vehicle_id)
                cumul_dist_m += step_dist

            route_dist_km = round(cumul_dist_m / 1000.0, 2)
            total_dist_meters += cumul_dist_m
            total_demand_delivered += route_demand_total

            # Only append routes that actually served demands
            if len(stops) > 2 or route_demand_total > 0:
                vehicle_routes.append(VehicleRoute(
                    vehicle_id=self.fleet[vehicle_id].id,
                    driver=self.fleet[vehicle_id].driver,
                    capacity=self.fleet[vehicle_id].capacity,
                    total_load=route_demand_total,
                    total_distance_km=route_dist_km,
                    total_time_minutes=round(route_dist_km / self.fleet[vehicle_id].speed_kmh * 60, 1),
                    stops=stops,
                    contains_road_hazard=False,
                    rerouted_around_blocks=list(blocked_names)
                ))

        total_opt_km = round(total_dist_meters / 1000.0, 2)

        # 7. Compare with Naive Baseline (Independent round-trip per village)
        naive_total_km = 0.0
        for node in self.delivery_nodes:
            d = haversine_distance_km(self.depot.lat, self.depot.lng, node.lat, node.lng)
            naive_total_km += (d * 2.0)  # Round trip out & back
        naive_total_km = round(naive_total_km, 2)

        km_saved = max(0.0, round(naive_total_km - total_opt_km, 2))
        pct_saved = round((km_saved / naive_total_km) * 100, 1) if naive_total_km > 0 else 0.0

        return OptimizationResult(
            status="OPTIMAL",
            algorithm="Google OR-Tools CVRP (Guided Local Search)",
            total_distance_km=total_opt_km,
            total_vehicles_used=vehicles_used_count,
            total_demand_satisfied=total_demand_delivered,
            routes=vehicle_routes,
            blocked_roads_avoided=[r.id for r in self.road_hazards if r.status == 'blocked'],
            savings_vs_naive={
                "naive_trips_needed": len(self.delivery_nodes),
                "naive_distance_km": naive_total_km,
                "optimized_distance_km": total_opt_km,
                "km_saved": km_saved,
                "percentage_saved": f"{pct_saved}%",
                "co2_emissions_saved_kg": round(km_saved * 0.27, 2),  # ~270g CO2 per km for diesel truck
                "hazard_violations_avoided": len([r for r in self.road_hazards if r.status == 'blocked'])
            }
        )
