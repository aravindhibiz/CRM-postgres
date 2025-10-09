from app.main import app

deals_routes = []
companies_routes = []
activities_routes = []

for route in app.routes:
    if hasattr(route, 'path'):
        if 'deals' in route.path:
            deals_routes.append(route.path)
        elif 'companies' in route.path:
            companies_routes.append(route.path)
        elif 'activities' in route.path:
            activities_routes.append(route.path)

print("=== DEALS ROUTES ===")
for r in sorted(set(deals_routes)):
    print(r)

print("\n=== COMPANIES ROUTES ===")
for r in sorted(set(companies_routes)):
    print(r)

print("\n=== ACTIVITIES ROUTES ===")
for r in sorted(set(activities_routes)):
    print(r)
