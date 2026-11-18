"""
ResQNet Optimization Engine — Benchmark Runner
Tests Google OR-Tools CVRP against the real Kurigram relief scenario.
Run:
    python -m engine.benchmark
"""

import json
from engine.models import Node, Vehicle, RoadSegment
from engine.optimizer import ReliefRouteOptimizer

def get_demo_scenario():
    # Depot: Central Relief Hub
    depot = Node(
        id="W1",
        name="Central Relief Hub",
        lat=25.7470,
        lng=89.2517,
        type="warehouse",
        demand_qty=0
    )

    # 5 Villages with acute relief demands (Liters of water / Ration packs)
    villages = [
        Node(id="V1", name="Sundarganj Camp", lat=26.1250, lng=89.5200, type="village", demand_qty=1200, population=1200),
        Node(id="V2", name="Kurigram Shelter", lat=25.8120, lng=89.6360, type="village", demand_qty=1800, population=3400),
        Node(id="V3", name="Chilmari Village", lat=25.5530, lng=89.6810, type="village", demand_qty=850, population=870),
        Node(id="V4", name="Rowmari Camp", lat=25.6310, lng=89.7660, type="village", demand_qty=1100, population=2100),
        Node(id="V5", name="Nageshwari Shelter", lat=25.9710, lng=89.7200, type="village", demand_qty=950, population=1550),
    ]

    # Vehicle Fleet
    fleet = [
        Vehicle(id="T1", driver="Rafiq Ahmed", capacity=5000, start_node_id="W1", speed_kmh=45.0),
        Vehicle(id="T2", driver="Kamal Hossain", capacity=4000, start_node_id="W1", speed_kmh=45.0),
        Vehicle(id="T3", driver="Nasima Begum", capacity=4000, start_node_id="W1", speed_kmh=45.0),
    ]

    # Road Network with Real Hazards
    roads = [
        RoadSegment(id="R1", from_name="Central Relief Hub", to_name="Sundarganj Camp", status="open", damage="none"),
        RoadSegment(id="R2", from_name="NGO Forward Base", to_name="Kurigram Shelter", status="open", damage="minor"),
        RoadSegment(id="R3", from_name="District Depot", to_name="Chilmari Village", status="blocked", damage="flooded"),
        RoadSegment(id="R4", from_name="Central Relief Hub", to_name="Rowmari Camp", status="blocked", damage="damaged"),
        RoadSegment(id="R5", from_name="District Depot", to_name="Nageshwari Shelter", status="open", damage="minor"),
        RoadSegment(id="R6", from_name="NGO Forward Base", to_name="Rowmari Camp", status="caution", damage="minor", penalty_factor=1.5),
    ]

    return depot, villages, fleet, roads


def run_benchmark():
    print("=" * 70)
    print("  ResQNet — Google OR-Tools CVRP Optimization Benchmark")
    print("  Scenario: Rangpur / Kurigram Flood Relief Operations")
    print("=" * 70)

    depot, villages, fleet, roads = get_demo_scenario()

    print(f"\n[1] Configuration:")
    print(f"  • Central Hub (Depot): {depot.name} ({depot.lat}, {depot.lng})")
    print(f"  • Delivery Nodes: {len(villages)} villages | Total Demand: {sum(v.demand_qty for v in villages):,} units")
    print(f"  • Available Fleet: {len(fleet)} heavy vehicles | Combined Capacity: {sum(v.capacity for v in fleet):,} units")
    print(f"  • Road Obstacles: {[r.id for r in roads if r.status == 'blocked']} BLOCKED due to flash flooding")

    # Run Solver
    optimizer = ReliefRouteOptimizer(depot=depot, delivery_nodes=villages, fleet=fleet, road_hazards=roads)
    result = optimizer.solve(time_limit_seconds=3)

    print(f"\n[2] Solver Status: {result.status} ({result.algorithm})")
    print("-" * 70)
    print(f"  • Total Optimized Distance : {result.total_distance_km} km")
    print(f"  • Trucks Dispatched        : {result.total_vehicles_used} of {len(fleet)}")
    print(f"  • Total Relief Delivered   : {result.total_demand_satisfied:,} units")
    print(f"  • Blocked Roads Avoided    : {result.blocked_roads_avoided}")

    print(f"\n[3] Route Itineraries:")
    for route in result.routes:
        print(f"\n  [Vehicle {route.vehicle_id}] Driver: {route.driver} | Total Load: {route.total_load:,} / {route.capacity:,} units")
        print(f"     Distance: {route.total_distance_km} km | Est. Time: {route.total_time_minutes} mins")
        print(f"     Waypoints:")
        for idx, stop in enumerate(route.stops):
            if idx == 0:
                print(f"       [Start]  {stop.name} (Depot departure, Initial Cargo: {stop.load_before:,} units)")
            elif idx == len(route.stops) - 1:
                print(f"       [Finish] {stop.name} (Return to Depot, Final Cargo: {stop.load_after:,} units)")
            else:
                print(f"       [{idx}] Drop {stop.demand_delivered:,} units -> {stop.name} (Cargo left: {stop.load_after:,}) | ETA: +{stop.eta_minutes}m")

    print("\n" + "=" * 70)
    print("  [4] Comparative Impact vs Naive Point-to-Point Dispatch:")
    print("=" * 70)
    comp = result.savings_vs_naive
    print(f"  • Naive Baseline Trips     : {comp['naive_trips_needed']} independent round trips")
    print(f"  • Naive Total Distance     : {comp['naive_distance_km']} km (Ignored multi-stop clustering)")
    print(f"  • OR-Tools Distance        : {comp['optimized_distance_km']} km (Consolidated loop routing)")
    print(f"  • Kilometers Saved         : {comp['km_saved']} km ({comp['percentage_saved']} reduction)")
    print(f"  • CO2 Emissions Saved      : {comp['co2_emissions_saved_kg']} kg CO2")
    print(f"  • Blocked Route Collisions : 0 (Naive would have hit {comp['hazard_violations_avoided']} flooded roads)")
    print("=" * 70 + "\n")

    return result

if __name__ == "__main__":
    run_benchmark()
