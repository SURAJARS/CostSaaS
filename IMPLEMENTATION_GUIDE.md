# Implementation and Usage Guide

## Table of Contents

1. [Getting Started](#getting-started)
2. [System Workflow](#system-workflow)
3. [Module-wise Guide](#module-wise-guide)
4. [Cost Calculation](#cost-calculation)
5. [Advanced Features](#advanced-features)
6. [Best Practices](#best-practices)

---

## Getting Started

### Initial Setup Checklist

- [ ] Install Node.js and npm
- [ ] Clone/Download project
- [ ] Set up MongoDB
- [ ] Configure backend .env
- [ ] Configure frontend .env
- [ ] Run `npm install` in both directories
- [ ] Seed database with sample data
- [ ] Start backend server
- [ ] Start frontend server
- [ ] Login with demo credentials
- [ ] Explore each module

### Demo Credentials

```
Admin Account:
Email: admin@example.com
Password: admin123

Staff Account:
Email: staff@example.com
Password: staff123
```

---

## System Workflow

```
┌─────────────────────────────────────────────────┐
│ Admin Sets Up System                            │
├─────────────────────────────────────────────────┤
│ 1. Add Ingredients (with rates)                 │
│ 2. Create Menus                                 │
│ 3. Create Recipes (linking Menus + Ingredients) │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│ Staff Uses System                               │
├─────────────────────────────────────────────────┤
│ 1. Create Estimation (select menus, guest count)│
│ 2. Review calculations                          │
│ 3. Export to Excel/PDF                          │
│ 4. Share with customers                         │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│ Generate Reports                                │
├─────────────────────────────────────────────────┤
│ By Date Range                                   │
│ By Customer Name                                │
│ Cost Analysis                                   │
└─────────────────────────────────────────────────┘
```

---

## Module-wise Guide

### 1. Authentication Module

#### Registration

1. Go to http://localhost:3000/login
2. Click "Register" tab
3. Fill in:
   - Username
   - Email
   - First Name
   - Last Name
   - Phone (optional)
   - Password
4. Click "Register"
5. You'll be registered as "staff" role
6. Existing users can login

#### Login

1. Click "Login" tab
2. Enter email and password
3. Click "Login"
4. Redirected to dashboard

#### Profile

1. Click on user avatar in top right
2. Click "Profile"
3. View/edit your information

#### Language Change

1. In top right navigation, click language button (EN/TA)
2. Select Tamil or English
3. Entire app changes language
4. Preference saved

---

### 2. Ingredient Management

#### View Ingredients

1. Click "Ingredients" in sidebar
2. View list of all ingredients
3. Use search to find specific ingredient
4. Click pagination to navigate pages

#### Add Ingredient (Admin Only)

1. Click "Add Ingredient" button
2. Fill in:
   - **Name (English)**: Ingredient name in English
   - **Name (Tamil)**: Ingredient name in Tamil
   - **Unit**: kg, gm, liter, ml, pcs, dozen, box
   - **Rate**: Current cost per unit
   - **Category**: Select from dropdown (dal, rice, oil, salt, etc.)
   - **Description**: Optional notes
   - **Status**: Active/Inactive
3. Click "Save"
4. Ingredient added to database

#### Edit Ingredient (Admin Only)

1. Click edit icon next to ingredient
2. Modify fields
3. Click "Save"

#### Delete Ingredient (Admin Only)

1. Click delete icon
2. Confirm deletion
3. Ingredient removed

#### Update Rates

- Regularly update "Rate" field
- Important for accurate cost calculations
- E.g., if rice costs 50/kg, enter 50

#### Search Ingredients

1. Enter search term in search box
2. Click "Search"
3. Results filtered
4. Click "Search" with empty box to reset

---

### 3. Menu Management

#### Create Menu (Admin Only)

1. Click "Menus" in sidebar
2. Click "Add Menu"
3. Fill in:
   - **Name (English)**: Menu item name
   - **Name (Tamil)**: Menu item in Tamil
   - **Category**: Breakfast/Lunch/Dinner/Snacks/Sweets
   - **Description (English)**: Optional description
   - **Description (Tamil)**: Optional description
   - **Status**: Active/Inactive
4. Click "Save"

#### Example Menus to Create

- Idly (Breakfast)
- Dosa (Breakfast)
- Sambar Rice (Lunch)
- Rasam Rice (Lunch)
- Curd Rice (Lunch)
- Biryani (Dinner)
- Haleem (Dinner)
- Gulab Jamun (Sweets)
- Jalebi (Sweets)

#### Edit Menu

1. Click edit icon next to menu
2. Modify information
3. Click "Save"

#### Status Management

- **Active**: Menu available for recipes and estimations
- **Inactive**: Menu hidden from selections
- Deactivate old menu items instead of deleting

---

### 4. Recipe/Formula Management

#### Understand Recipe Creation

A recipe links a Menu to multiple Ingredients with quantities.

**Example:**

- Menu: Idly (serves 10)
- Ingredients:
  - Urad Dal: 0.5 kg
  - Rice: 1 kg
  - Salt: 10 gm

#### Create Recipe (Admin Only)

1. Click "Recipes" in sidebar
2. Click "Add Recipe"
3. Select Menu (e.g., Idly)
4. Enter Base Members (portions, e.g., 10)
5. Click "Add Ingredient"
6. For each ingredient:
   - Select ingredient from dropdown
   - Enter quantity (for base members)
   - Select unit
7. Click "Save"

#### Add Multiple Ingredients

1. Click "Add Ingredient" for each item
2. Fill ingredient details
3. Can add unlimited ingredients
4. Remove ingredient with delete icon

#### Example Recipe: Idly (serves 10 people)

```
Menu: Idly
Base Members: 10

Ingredients:
1. Ingredient: Urad Dal, Quantity: 0.5, Unit: kg
2. Ingredient: Rice, Quantity: 1, Unit: kg
3. Ingredient: Salt, Quantity: 10, Unit: gm
4. Ingredient: Oil, Quantity: 0.2, Unit: liter
```

#### Edit Recipe

1. Click edit icon next to recipe
2. Modify menu, base members, or ingredients
3. Click "Save"

#### Delete Recipe

1. Click delete icon
2. Confirm deletion
3. Recipe removed

---

### 5. Cost Estimation

#### Create Estimation

1. Click "Estimations" in sidebar
2. Click "Add Estimation"
3. Fill in:
   - **Customer Name**: Name of person ordering
   - **Mobile Number**: Contact number
   - **Event Date**: Date of event (yyyy-mm-dd)
   - **Guest Count**: Number of people eating
   - **Select Menus**: Check menus to include (multi-select)
   - **Labour Cost**: Optional, labour cost (0 if not applicable)
   - **Gas Cost**: Optional, cooking gas cost
   - **Transport Cost**: Optional, transportation cost
   - **Miscellaneous Cost**: Optional, other costs
   - **Profit Margin**: Percentage (default 15%)
4. Click "Save"

#### System Calculations

The system automatically calculates:

1. **Required Quantity** = (Base Ingredient Qty × Guest Count) / Base Members
2. **Ingredient Amount** = Required Qty × Current Rate
3. **Raw Material Cost** = Sum of all ingredient amounts
4. **Additional Cost** = Labour + Gas + Transport + Miscellaneous
5. **Profit Amount** = (Raw Material + Additional Cost) × (Profit Margin / 100)
6. **Grand Total** = Raw Material + Additional + Profit

#### Example Calculation

```
Event: Wedding
Guests: 150
Menu: Idly (serves 10) + Dosa (serves 10)

For Idly:
- Urad Dal: (0.5 × 150) / 10 = 7.5 kg × 200 = Rs. 1500
- Rice: (1 × 150) / 10 = 15 kg × 50 = Rs. 750
- Total Idly: Rs. 2250

For Dosa:
- Urad Dal: (0.5 × 150) / 10 = 7.5 kg × 200 = Rs. 1500
- Rice: (2 × 150) / 10 = 30 kg × 50 = Rs. 1500
- Total Dosa: Rs. 3000

Raw Material Cost: Rs. 5250
Labour: Rs. 1000
Gas: Rs. 500
Transport: Rs. 300
Additional: Rs. 1800

Profit (15%): (5250 + 1800) × 0.15 = Rs. 1057.50
Grand Total: Rs. 5250 + 1800 + 1057.50 = Rs. 8107.50
```

#### View Estimation Details

1. Click eye icon next to estimation
2. View all calculations
3. View ingredient breakdown
4. View cost summary

#### Export Estimation

1. Open estimation view
2. Click "Export Excel" for spreadsheet
3. Or "Export PDF" for printable format
4. File downloads to computer

#### Edit Estimation

Currently, update by creating new estimation with adjusted details.

#### Delete Estimation

1. Click delete icon
2. Confirm deletion
3. Estimation removed (Admin only)

---

### 6. Reports and Analytics

#### Generate Report by Date Range

1. Click "Reports" in sidebar
2. Click "By Date Range" tab
3. Select start date
4. Select end date
5. Click "Generate Report"
6. Results displayed in table
7. Click "Export Excel" to download

#### Generate Report by Customer

1. Click "Reports" in sidebar
2. Click "By Customer" tab
3. Enter customer name
4. Click "Generate Report"
5. All estimations for that customer shown
6. Export available

#### Use Report Data

- Analyze revenue by date
- Track customer history
- Calculate business metrics
- Verify cost trends
- Generate invoices

---

## Cost Calculation

### Formula Details

#### Ingredient Quantity Scaling

```
Formula: (Base Ingredient Qty × Guest Count) / Base Members

Example:
- Recipe: Biryani (serves 50)
- Ingredient: Basmati Rice (base qty: 5 kg)
- Guest Count: 100
- Scaled Qty = (5 × 100) / 50 = 10 kg
```

#### Cost Calculation

```
Formula: Qty × Rate

Example:
- Scaled Qty: 10 kg
- Current Rate: Rs. 80/kg
- Amount = 10 × 80 = Rs. 800
```

#### Multiple Menu Consolidation

```
When multiple menus selected:
1. Get recipe for each menu
2. Scale each ingredient by guest count
3. Combine same ingredients (total qty)
4. Calculate combined cost
5. Show consolidated ingredient list

Example:
Menu 1: Idly
- Urad Dal: 7.5 kg

Menu 2: Dosa
- Urad Dal: 7.5 kg

Combined:
- Urad Dal: 15 kg (both combined)
```

#### Profit Calculation

```
Formula: (Raw Material + Additional Cost) × (Profit Margin % / 100)

Example:
- Raw Material: Rs. 5000
- Additional Cost: Rs. 1000
- Profit Margin: 20%
- Profit = (5000 + 1000) × 0.20 = Rs. 1200

Grand Total = 5000 + 1000 + 1200 = Rs. 7200
```

---

## Advanced Features

### Multilingual Support

#### How It Works

- All menus, ingredients, and recipes support both English and Tamil
- Frontend switches entire UI based on language selection
- Database stores bilingual content
- Reports generate in selected language

#### Using Multilingual Features

1. In Navigation, click language switcher
2. Language changes instantly
3. All content translates
4. Preference saved in browser

### Export Functionality

#### Excel Export

- Generates .xlsx file
- Multiple sheets with data
- Formatted cells with colors
- Professional appearance
- Can open in Excel/Google Sheets

#### PDF Export

- Generates printable PDF
- Company header
- Customer details
- Ingredient breakdown
- Cost summary
- Professional invoice format

### Role-Based Access

#### Admin Role Privileges

- Create/Edit/Delete ingredients
- Create/Edit/Delete menus
- Create/Edit/Delete recipes
- View all estimations
- Generate reports
- Delete estimations
- Manage users

#### Staff Role Privileges

- View ingredients, menus, recipes
- Create estimations
- View their own estimations
- Export estimations
- Generate basic reports

---

## Best Practices

### 1. Ingredient Management

- Update rates regularly
- Use consistent units
- Categorize properly
- Mark outdated ingredients as inactive
- Use both English and Tamil names

### 2. Menu Creation

- Use clear descriptive names
- Include bilingual names
- Use consistent categories
- Organize by meal type
- Keep descriptions simple

### 3. Recipe Creation

- Set realistic base members
- Include all ingredients
- Use accurate quantities
- Test calculations
- Review regularly

### 4. Estimation Best Practices

- Verify customer details
- Confirm event date
- Select all required menus
- Include all additional costs
- Review calculations before sharing
- Keep backup (export PDF)

### 5. Cost Management

- Update rates weekly
- Monitor market prices
- Adjust profit margin seasonally
- Consider bulk discounts
- Track historical costs

### 6. Customer Communication

- Provide itemized breakdown
- Explain profit margin
- Show ingredient calculations
- Export professional reports
- Follow up on estimates

### 7. Data Organization

- Use consistent naming
- Remove duplicates
- Archive old estimations
- Regular backups
- Maintain data quality

---

## Common Tasks

### Task 1: Create Complete Menu System

1. Add 10-15 ingredients
2. Create 5-10 menus
3. Create 1 recipe per menu
4. Test with sample estimation

### Task 2: Generate Invoice

1. Create estimation
2. Verify all details
3. Export to PDF
4. Print or email

### Task 3: Analyze Monthly Costs

1. Generate report by date range
2. Export to Excel
3. Analyze revenue
4. Identify trends

### Task 4: Update Ingredient Rates

1. Go to Ingredients
2. Edit each ingredient
3. Update current rate
4. Click Save

### Task 5: Disable Old Menu

1. Go to Menus
2. Edit menu
3. Change status to "inactive"
4. Click Save
5. Not shown in new estimations

---

## Troubleshooting

### Issue: Cost calculations incorrect

**Solution:**

1. Verify base members count
2. Check ingredient quantities
3. Confirm current rates
4. Review recipe ingredients

### Issue: Export not working

**Solution:**

1. Check file permissions
2. Verify backend running
3. Check browser download settings
4. Try different browser

### Issue: Search not returning results

**Solution:**

1. Check exact spelling
2. Try partial word
3. Reset with empty search
4. Verify data exists

### Issue: Cannot create estimation

**Solution:**

1. Select at least one menu
2. Fill all required fields
3. Check guest count > 0
4. Verify menu has recipe

---

## Performance Optimization

### For Large Datasets

- Use pagination (limit to 10-25 items)
- Search for specific items
- Archive old estimations
- Optimize database indexes

### For Faster Estimations

- Create formula menus
- Use standard quantities
- Setup common cost combos
- Batch similar orders

---

This guide covers all major features and workflows. Refer to specific module sections as needed for detailed instructions.
