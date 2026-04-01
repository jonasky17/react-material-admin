# Frontend Payload Guide

This document describes what the frontend needs to send after the latest backend changes.

## 1) Required setup before creating products

Because stock movement and location are now reference tables, frontend should load these first:

1. Locations
- Endpoint: GET /locations
- Use selected location id values in forms.

2. Movement Definitions
- Endpoint: GET /movement-definitions
- Use selected movement definition id values in forms.

## 2) Product Create payload

Endpoint:
- POST /products

Base product fields:
- name (string, required)
- description (string, optional)
- sku (string, optional)
- quantity (number, optional)
- unit (string, optional)
- low_stock_level (number, optional)
- status (string: active/inactive, optional)
- category_id (number, optional)
- initialPrice (number, optional)
- profile_id (number, required)

Stock batch and stock movement related fields:
- received_at (ISO date string, optional)
- locationId (number, optional, FK to locations.id)
- movementDefinitionId (number, required only when quantity is not 0)
- sourceLocationId (number, optional, FK to locations.id)
- destinationLocationId (number, optional, FK to locations.id)
- remarks (string, optional)

Business rule:
- If quantity is not 0, backend creates stock_batch and stock_movement automatically.
- If quantity is not 0, movementDefinitionId must be provided.
- quantity_received in stock_batch is taken from product quantity.
- quantity_remaining in stock_batch is set to 0 on create.
- unit_cost in stock_batch uses initialPrice when initialPrice is not 0; otherwise 0.
- received_at in stock_batch uses payload value; if missing, backend uses current timestamp.

Example product create payload (with initial stock movement):

{
  "name": "Fresh Eggs",
  "description": "Farm fresh brown eggs, large size",
  "sku": "EGG-001",
  "quantity": 120,
  "unit": "pcs",
  "low_stock_level": 30,
  "status": "active",
  "category_id": 1,
  "initialPrice": 100.5,
  "profile_id": 1,
  "received_at": "2026-04-01T08:00:00Z",
  "locationId": 1,
  "movementDefinitionId": 2,
  "sourceLocationId": 1,
  "destinationLocationId": 2,
  "remarks": "Initial stock intake"
}

Example product create payload (no initial stock movement):

{
  "name": "Layer Feed",
  "profile_id": 1,
  "quantity": 0
}

## 3) Locations CRUD payloads

Base endpoint:
- /locations

Create (POST /locations):
{
  "name": "Storage A",
  "is_internal": true
}

Update (PATCH /locations/:id):
{
  "name": "Storage A - Main"
}

## 4) Movement Definitions CRUD payloads

Base endpoint:
- /movement-definitions

Create (POST /movement-definitions):
{
  "name": "Egg Collection",
  "action_type": "IN"
}

Allowed action_type values:
- IN
- OUT
- INTERNAL

Update (PATCH /movement-definitions/:id):
{
  "name": "Egg Collection - Morning",
  "action_type": "IN"
}

## 5) Stock Batch direct CRUD payload (if frontend uses stock batch screen)

Create (POST /stock-batches):
{
  "productId": 1,
  "quantity_received": 120,
  "quantity_remaining": 0,
  "unit_cost": 100.5,
  "received_at": "2026-04-01T08:00:00Z",
  "locationId": 1
}

Update (PATCH /stock-batches/:id):
{
  "quantity_remaining": 80,
  "locationId": 2
}

## 6) Stock Movement direct CRUD payload (if frontend uses stock movement screen)

Create (POST /stock-movements):
{
  "productId": 1,
  "stockBatchId": 1,
  "movementDefinitionId": 2,
  "sourceLocationId": 1,
  "destinationLocationId": 2,
  "quantity": 10,
  "remarks": "Transfer to storage"
}

Update (PATCH /stock-movements/:id):
{
  "destinationLocationId": 3,
  "remarks": "Delivered to customer"
}

## 7) Form checklist for frontend

Product Form:
- Add dropdown for locationId (from GET /locations)
- Add dropdown for movementDefinitionId (from GET /movement-definitions)
- Add optional dropdowns for sourceLocationId and destinationLocationId (from GET /locations)
- Add received_at datetime input (optional)
- Add remarks textarea (optional)
- Add validation: if quantity is not 0, movementDefinitionId must be selected

Location Management Form:
- name
- is_internal

Movement Definition Form:
- name
- action_type (IN | OUT | INTERNAL)
