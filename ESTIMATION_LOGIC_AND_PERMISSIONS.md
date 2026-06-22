# Estimation Logic & Calculation Guide

## Overview

An **Estimation** is a comprehensive cost calculation for a catering event. It combines multiple dishes (menus), scales ingredients based on guest count, and calculates the total cost including profit margins.

---

## Estimation Calculation Flow

### Step 1: Select Menus & Guest Count

```
User Input:
- Customer Name: "Bhuvaneshwari"
- Mobile Number: "9842236692"
- Event Date: "2026-06-20"
- Guest Count: 100
- Selected Menus: [Idly, Dosa, Kesari]
```

### Step 2: Fetch Recipes for Selected Menus

Each menu has a **recipe** that defines:

- **Base Members**: The recipe is designed for this many people (e.g., 10)
- **Ingredients**: List of ingredients with base quantities

**Example - Idly Recipe:**

```
Base Members: 10
Ingredients:
  - Urad Dal: 0.5 kg
  - Rice: 1 kg
  - Salt: 10 gm
```

### Step 3: Scale Ingredients to Guest Count

**Formula:**

```
Scaled Quantity = Base Quantity × (Guest Count / Base Members)
```

**Example Calculation for Idly (Guest Count = 100, Base = 10):**

```
Scale Factor = 100 / 10 = 10

Urad Dal:  0.5 kg × 10 = 5 kg
Rice:      1 kg × 10 = 10 kg
Salt:      10 gm × 10 = 100 gm
```

### Step 4: Consolidate Ingredients from All Menus

When multiple menus share ingredients, they are **combined**:

**Example:**

```
Menu 1 - Idly:      Urad Dal 5 kg, Rice 10 kg, Salt 100 gm
Menu 2 - Dosa:      Urad Dal 3 kg, Rice 5 kg, Oil 1 L, Salt 100 gm
Menu 3 - Kesari:    Rice 10 kg, Oil 2 L, Turmeric 50 gm, Salt 200 gm

CONSOLIDATED:
- Urad Dal:  5 + 3 = 8 kg
- Rice:      10 + 5 + 10 = 25 kg
- Salt:      100 + 100 + 200 = 400 gm
- Oil:       1 + 2 = 3 L
- Turmeric:  50 gm
```

### Step 5: Calculate Raw Material Cost

Each ingredient has a **current rate** (price per unit):

```
Cost = Quantity × Current Rate
```

**Example:**

```
Urad Dal:   8 kg × ₹80/kg = ₹640
Rice:       25 kg × ₹50/kg = ₹1,250
Salt:       400 gm × ₹20/gm = ₹8,000
Oil:        3 L × ₹120/L = ₹360
Turmeric:   50 gm × ₹100/gm = ₹5,000

Total Raw Material Cost = ₹15,250
```

### Step 6: Add Additional Costs

Additional expenses for the event:

```
- Labour Cost: ₹100
- Gas Cost: ₹100
- Transport Cost: ₹100
- Miscellaneous Cost: ₹100

Total Additional Cost = ₹400
```

### Step 7: Calculate Profit

**Profit Margin**: User specifies as percentage (e.g., 15%)

**Formula:**

```
Final Cost = Raw Material Cost + Additional Cost
Profit Amount = Final Cost × (Profit Margin / 100)
```

**Example:**

```
Final Cost = ₹15,250 + ₹400 = ₹15,650
Profit Amount = ₹15,650 × (15 / 100) = ₹2,347.50
```

### Step 8: Calculate Grand Total

```
Grand Total = Final Cost + Profit Amount
Grand Total = ₹15,650 + ₹2,347.50 = ₹17,997.50
```

---

## Complete Example Breakdown

**For 100 guests with Idly, Dosa, Kesari:**

| Step              | Calculation                                     | Result         |
| ----------------- | ----------------------------------------------- | -------------- |
| Raw Material Cost | 8kg×80 + 25kg×50 + 400gm×20 + 3L×120 + 50gm×100 | ₹15,250        |
| Additional Costs  | Labour + Gas + Transport + Misc                 | ₹400           |
| Final Cost        | ₹15,250 + ₹400                                  | ₹15,650        |
| Profit (15%)      | ₹15,650 × 0.15                                  | ₹2,347.50      |
| **Grand Total**   | ₹15,650 + ₹2,347.50                             | **₹17,997.50** |

---

## Permission Structure

### Authentication Required

All API endpoints require a **JWT token** sent in the Authorization header:

```
Authorization: Bearer <token>
```

### User Roles

#### 1. **ADMIN** Role

Admins have full system control and can manage all data.

**Admin Permissions:**

- ✅ Create, Read, Update, Delete all **Estimations**
- ✅ Delete estimations
- ✅ Create, Update, Delete **Menus**
- ✅ Create, Update, Delete **Recipes**
- ✅ Create, Update, Delete **Ingredients**
- ✅ View all estimations (including others' estimations)
- ✅ View analytics for all users
- ✅ Access Reports

**Demo Admin Credentials:**

```
Email:    admin@example.com
Password: admin123
Role:     admin
```

---

#### 2. **STAFF** Role

Staff members can create and manage estimations but cannot delete them or manage master data.

**Staff Permissions:**

- ✅ Create **Estimations** (own estimations)
- ✅ Read own **Estimations**
- ✅ Update own **Estimations**
- ❌ Delete **Estimations** (only admin can delete)
- ✅ Read **Menus** (view only)
- ✅ Read **Recipes** (view only)
- ✅ Read **Ingredients** (view only)
- ✅ Export estimations to Excel/PDF
- ✅ View own analytics
- ❌ Manage Menus, Recipes, Ingredients (admin only)

**Demo Staff Credentials:**

```
Email:    staff@example.com
Password: staff123
Role:     staff
```

---

### API Endpoints & Permissions

#### Estimations

| Endpoint                             | Method | Admin | Staff | Description                                          |
| ------------------------------------ | ------ | ----- | ----- | ---------------------------------------------------- |
| `/api/estimations`                   | POST   | ✅    | ✅    | Create estimation                                    |
| `/api/estimations`                   | GET    | ✅    | ✅    | Get all estimations (admin sees all, staff sees own) |
| `/api/estimations/:id`               | GET    | ✅    | ✅    | Get estimation details                               |
| `/api/estimations/:id`               | PUT    | ✅    | ✅    | Update estimation                                    |
| `/api/estimations/:id`               | DELETE | ✅    | ❌    | Delete estimation                                    |
| `/api/estimations/:id/export/excel`  | GET    | ✅    | ✅    | Export to Excel                                      |
| `/api/estimations/:id/export/pdf`    | GET    | ✅    | ✅    | Export to PDF                                        |
| `/api/estimations/report/analytics`  | GET    | ✅    | ✅    | View analytics                                       |
| `/api/estimations/report/date-range` | GET    | ✅    | ✅    | Filter by date range                                 |
| `/api/estimations/report/customer`   | GET    | ✅    | ✅    | Filter by customer                                   |

#### Menus

| Endpoint         | Method | Admin | Staff |
| ---------------- | ------ | ----- | ----- |
| `/api/menus`     | POST   | ✅    | ❌    |
| `/api/menus`     | GET    | ✅    | ✅    |
| `/api/menus/:id` | PUT    | ✅    | ❌    |
| `/api/menus/:id` | DELETE | ✅    | ❌    |

#### Recipes

| Endpoint                    | Method | Admin | Staff |
| --------------------------- | ------ | ----- | ----- |
| `/api/recipes`              | POST   | ✅    | ❌    |
| `/api/recipes`              | GET    | ✅    | ✅    |
| `/api/recipes/:id`          | PUT    | ✅    | ❌    |
| `/api/recipes/:id`          | DELETE | ✅    | ❌    |
| `/api/recipes/menu/:menuId` | GET    | ✅    | ✅    |

#### Ingredients

| Endpoint               | Method | Admin | Staff |
| ---------------------- | ------ | ----- | ----- |
| `/api/ingredients`     | POST   | ✅    | ❌    |
| `/api/ingredients`     | GET    | ✅    | ✅    |
| `/api/ingredients/:id` | PUT    | ✅    | ❌    |
| `/api/ingredients/:id` | DELETE | ✅    | ❌    |

---

## Key Differences: Admin vs Staff

| Feature                       | Admin       | Staff         |
| ----------------------------- | ----------- | ------------- |
| **Create Estimation**         | ✅          | ✅            |
| **Delete Estimation**         | ✅          | ❌            |
| **View All Estimations**      | ✅ (all)    | ✅ (own only) |
| **Manage Master Data**        | ✅          | ❌            |
| (Menus, Recipes, Ingredients) |             |               |
| **Edit Ingredient Rates**     | ✅          | ❌            |
| **View Analytics**            | ✅ (global) | ✅ (own)      |
| **System Administration**     | ✅          | ❌            |

---

## How to Test Permissions

### Test as Admin:

1. Login with `admin@example.com` / `admin123`
2. Create an estimation
3. Delete an estimation (staff cannot do this)
4. Go to Ingredients page and try to create/edit (staff cannot do this)

### Test as Staff:

1. Login with `staff@example.com` / `staff123`
2. Create an estimation (works)
3. Try to delete the estimation (get "403 Forbidden" error)
4. Try to create an ingredient (get "403 Forbidden" error)

---

## Estimation Data Model

```javascript
{
  _id: ObjectId,
  customerName: "Bhuvaneshwari",
  mobileNumber: "9842236692",
  eventDate: "2026-06-20",
  guestCount: 100,

  // Menus selected for this event
  selectedMenus: [
    {
      menuId: "6a3905d6e0abf32fc1968d94",
      menuName_en: "Idly",
      menuName_ta: "இட்லி",
      quantity: 1
    },
    // ... more menus
  ],

  // Consolidated and scaled ingredients
  ingredients: [
    {
      ingredientId: "6a3905d6e0abf32fc1968d80",
      ingredientName_en: "Urad Dal",
      ingredientName_ta: "உளுண்டு",
      unit: "kg",
      requiredQty: 8,
      currentRate: 80,
      amount: 640
    },
    // ... more ingredients
  ],

  // Cost breakdown
  rawMaterialCost: 15250,
  additionalCost: {
    labourCost: 100,
    gasCost: 100,
    transportCost: 100,
    miscellaneousCost: 100
  },
  profitMargin: 15,
  profitAmount: 2347.50,
  grandTotal: 17997.50,

  // Metadata
  status: "Draft",  // Draft, Sent, Approved, Completed
  createdBy: "6a3905d6e0abf32fc1968d01",  // User ID
  createdAt: "2026-06-22T09:52:22.195Z",
  updatedAt: "2026-06-22T09:52:22.195Z"
}
```

---

## Status Workflow

An estimation can have the following statuses:

| Status        | Description                                        |
| ------------- | -------------------------------------------------- |
| **Draft**     | Estimation is being prepared, not sent to customer |
| **Sent**      | Estimation sent to customer for approval           |
| **Approved**  | Customer approved the estimation                   |
| **Completed** | Event completed and billing finalized              |

---

## Quick Reference: Permission Checklists

### For Admin Tasks:

- ✅ Create/Edit/Delete Ingredients
- ✅ Create/Edit/Delete Menus
- ✅ Create/Edit/Delete Recipes
- ✅ Create/Edit/Delete Estimations
- ✅ View all users' estimations
- ✅ Delete estimations

### For Staff Tasks:

- ✅ Create Estimations
- ✅ Edit own Estimations
- ✅ View own Estimations
- ✅ Export Estimations (Excel/PDF)
- ✅ View available Menus
- ✅ View available Ingredients
- ❌ Cannot delete estimations
- ❌ Cannot manage master data
