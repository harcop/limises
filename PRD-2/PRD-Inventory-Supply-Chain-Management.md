# Inventory & Supply Chain Management - Complete Guide

## Overview
The Inventory Module manages all hospital assets, medical supplies, equipment, procurement, vendor management, and supply chain optimization to ensure availability of resources when needed.

---

## 1. Item Master Management

### 1.1 Item Categories

**Medical Consumables:**
- Disposable syringes and needles
- IV cannulas and sets
- Catheters (Foley, central line)
- Gloves (sterile and non-sterile)
- Masks, gowns, caps
- Surgical drapes and packs
- Gauze, bandages, dressings
- Sutures and staples
- Oxygen masks and tubes

**Surgical Supplies:**
- Surgical instruments
- Implants (orthopedic, cardiac)
- Prosthetics
- Surgical disposables
- Sterilization pouches

**Laboratory Supplies:**
- Test reagents
- Collection tubes
- Slides and coverslips
- Culture media
- Pipette tips
- Lab chemicals

**Radiology Supplies:**
- X-ray films (if not digital)
- Contrast media
- Lead aprons
- Positioning aids

**Pharmacy Items:**
- Medications (covered in Pharmacy module)

**Linen & Laundry:**
- Bed sheets
- Pillow covers
- Patient gowns
- Towels
- Surgical linen
- OT drapes

**Housekeeping Supplies:**
- Cleaning chemicals
- Disinfectants
- Mops and brooms
- Trash bags
- Hand sanitizers
- Soap dispensers

**Office & Stationery:**
- Paper, pens, files
- Forms and registers
- Printer cartridges
- Computer accessories

**Kitchen & Dietary:**
- Food items
- Disposable plates/cups
- Kitchen equipment

**Medical Equipment:**
- Patient monitors
- Ventilators
- Infusion pumps
- Defibrillators
- Ultrasound machines
- X-ray machines
- Lab analyzers
- Hospital beds
- Wheelchairs

**Furniture & Fixtures:**
- Tables, chairs
- Cabinets
- Stretchers
- IV stands

### 1.2 Item Master Data

**For Each Item:**
- **Item Code:** Unique identifier (e.g., SYR-10ML-001)
- **Item Name:** 10ml Disposable Syringe
- **Generic Name:** Syringe
- **Category:** Medical Consumables
- **Sub-Category:** Syringes
- **Unit of Measurement:** Pieces, Boxes, Liters, Kg
- **Packing:** 100 pieces per box
- **Manufacturer:** Brand name
- **Suppliers:** List of approved suppliers
- **Purchase Price:** Cost per unit
- **MRP/Selling Price:** If sold to patients
- **Reorder Level:** Minimum quantity before reordering
- **Maximum Stock Level:** Upper limit
- **Economic Order Quantity (EOQ):** Optimal order size
- **Lead Time:** Days from order to delivery
- **Expiry Tracking:** Yes/No
- **Batch Tracking:** Yes/No
- **Serial Number Tracking:** Yes/No (for equipment)
- **Storage Location:** Main store, sub-store
- **Storage Conditions:** Room temp, refrigerated, controlled
- **Item Description:** Detailed specifications
- **HSN/SAC Code:** For tax purposes
- **Tax Rate:** GST percentage

---

## 2. Multi-Location Inventory

### 2.1 Storage Locations

**Main Central Store:**
- Primary warehouse
- Bulk storage
- Receiving area
- Issue counter
- Office space

**Department Sub-Stores:**
- **OT Store:** Surgical supplies, implants
- **ICU Store:** Critical care consumables
- **Ward Stores:** General ward supplies
- **Emergency Store:** Emergency medications, supplies
- **Laboratory Store:** Lab reagents, consumables
- **Radiology Store:** Contrast media, accessories
- **Pharmacy Store:** Medications
- **CSSD Store:** Sterile supplies
- **Housekeeping Store:** Cleaning supplies
- **Dietary Store:** Kitchen supplies

**Special Storage:**
- **Cold Storage:** Vaccines, biologicals (2-8°C)
- **Freezer Storage:** (-20°C, -80°C)
- **Controlled Drug Room:** Narcotics (double lock)
- **Flammable Storage:** Alcohol, chemicals
- **High-Value Storage:** Implants, expensive items

### 2.2 Location Management

**Location Details:**
- Location code and name
- Location type (main/sub-store)
- Capacity
- Current utilization
- Responsible person
- Access control
- Environmental monitoring (temp, humidity)
- Security measures

**Stock Allocation:**
- Minimum stock per location
- Maximum stock per location
- Reorder from main store
- Direct procurement (if authorized)

---

## 3. Stock Management

### 3.1 Stock Receipt (Goods Receipt)

#### Receipt Process

**With Purchase Order:**
1. **Delivery Arrival:**
   - Supplier delivers goods
   - Gate entry documentation
   - Unloading

2. **Physical Verification:**
   - Match with Purchase Order
   - Count quantity
   - Check packaging condition
   - Verify item specifications

3. **Quality Inspection:**
   - Visual inspection
   - Sample testing (if required)
   - Certificate verification (for medical items)
   - Batch and expiry verification
   - Damage assessment

4. **Acceptance:**
   - If satisfactory: Accept
   - If discrepancy: Note in GRN
   - If rejected: Return to vendor

5. **GRN Generation:**
   - Goods Receipt Note number
   - PO reference
   - Supplier name
   - Item-wise quantity received
   - Accepted vs rejected
   - Discrepancies noted
   - Receipt date and time
   - Receiver name and signature

6. **Stock Update:**
   - Add to inventory
   - Batch-wise entry
   - Expiry date recording
   - Storage location allocation

7. **Invoice Matching:**
   - Three-way match:
     - Purchase Order
     - Goods Receipt Note
     - Supplier Invoice
   - If matched: Approve for payment
   - If mismatch: Hold payment

**Without Purchase Order:**
- Emergency purchases
- Free samples
- Donations
- Returns from other locations
- Direct GRN entry

### 3.2 Stock Issue

#### Issue Types

**Department Requisition:**
- Regular scheduled issues
- Emergency issues
- Patient-specific issues
- Replacement of returned items

**Direct Issue:**
- Counter issue at store
- Immediate requirement
- Small quantities

**Automatic Replenishment:**
- Par level system
- Auto-generate requisition when stock below minimum
- Scheduled delivery

#### Issue Process

1. **Requisition:**
   - Department creates requisition
   - Items and quantities
   - Purpose/justification
   - Approval workflow

2. **Approval:**
   - Department head approval
   - Store manager verification
   - Check stock availability

3. **Item Picking:**
   - FIFO/FEFO principle
   - Batch selection
   - Expiry checking
   - Quality check

4. **Issue Note:**
   - Issue note number
   - Requisition reference
   - Department/ward
   - Item-wise quantity issued
   - Batch numbers
   - Expiry dates
   - Issue date and time
   - Issued by (name)

5. **Delivery:**
   - Physical handover
   - Receiving acknowledgment
   - Signature

6. **Stock Update:**
   - Deduct from inventory
   - Update location stock
   - Transaction recording

### 3.3 Stock Transfer

**Inter-Location Transfer:**
- Transfer between main store and sub-stores
- Transfer between sub-stores
- Transfer between hospital branches

**Transfer Process:**
1. Transfer requisition
2. Source location approval
3. Destination location confirmation
4. Physical transfer
5. Transfer note generation
6. Stock update in both locations
7. Transfer-in-transit tracking
8. Receiving confirmation

### 3.4 Stock Returns

**Return Scenarios:**
- Excess stock from department
- Wrong item issued
- Expired items
- Damaged items
- Unused patient-specific items
- Return to supplier (damaged/wrong/expired)

**Return Process:**
- Return authorization
- Quality check
- Restocking (if acceptable) or disposal
- Stock update
- Credit note (for supplier returns)

### 3.5 Stock Adjustment

**Adjustment Reasons:**
- Physical count correction
- Damaged items write-off
- Expired items disposal
- Pilferage/theft
- Breakage
- System errors

**Adjustment Process:**
- Adjustment request
- Reason documentation
- Approval workflow
- Stock update
- Accounting impact

---

## 4. Requisition Management

### 4.1 Requisition Types

**Regular Requisition:**
- Planned weekly/monthly needs
- Based on consumption patterns
- Budget-based allocation

**Emergency Requisition:**
- Urgent/critical needs
- After-hours requests
- Fast-track approval
- Immediate issue

**Patient-Specific Requisition:**
- Items for particular patient
- Chargeable to patient
- Insurance coverage check
- Direct billing link

**Capital Equipment Requisition:**
- High-value equipment
- Detailed justification
- Budget approval
- Management approval

### 4.2 Requisition Workflow

```
Department Creates Requisition
    ↓
Department Head Approval
    ↓
Store Manager Review
    ↓
Stock Availability Check
    ↓
Issue Authorization
    ↓
Item Picking (FIFO/FEFO)
    ↓
Issue Note Generation
    ↓
Delivery to Department
    ↓
Receiving Acknowledgment
    ↓
Stock Update
    ↓
Consumption Tracking
```

---

## 5. Procurement Management

### 5.1 Purchase Requisition

**PR Creation:**
- Items needed
- Quantity required
- Specifications
- Urgency level
- Budget code/cost center
- Justification
- Preferred supplier (if any)
- Required delivery date

**Approval Workflow:**
- Department head approval
- Store manager approval
- Purchase manager approval
- Finance approval (for high values)
- Management approval (for capital items)

**PR Consolidation:**
- Combine similar items from multiple departments
- Bulk ordering for better rates
- Delivery scheduling

### 5.2 Vendor Selection

#### Quotation Process

**Request for Quotation (RFQ):**
- Send to 3-5 vendors
- Technical specifications
- Quantity and delivery schedule
- Payment terms
- Warranty requirements
- Quote submission deadline

**Quotation Comparison:**
- Price comparison
- Technical compliance
- Delivery capability
- Payment terms
- Total cost of ownership
- After-sales service
- Warranty terms

**Vendor Evaluation:**
- Technical evaluation score
- Commercial evaluation score
- Past performance rating
- Financial stability
- Certifications (ISO, etc.)
- Sample approval (if needed)

**Vendor Selection:**
- L1 (lowest) bidder
- Or technically superior
- Or best value for money
- Approval documentation

### 5.3 Purchase Order

**PO Creation:**
- Selected vendor
- Item details
- Quantity and specifications
- Unit price
- Total value
- Delivery schedule
- Delivery location
- Payment terms (30/60/90 days, advance)
- Warranty period
- Penalty clauses (late delivery)
- Terms and conditions
- PO number (unique)
- PO date

**PO Approval:**
- Purchase manager approval
- Finance approval
- Authorization limits
- Digital signature

**PO Dispatch:**
- Email to vendor
- Portal upload
- Acknowledgment from vendor
- Expected delivery confirmation

**PO Tracking:**
- PO status (draft, approved, sent, acknowledged, in-production, dispatched, received, closed)
- Expected delivery date
- Actual delivery tracking
- Partial deliveries
- Delivery delays
- Payment schedule tracking

### 5.4 Contract Management

**Annual Rate Contracts (ARC):**
- Negotiate rates for full year
- Item-wise rates
- Committed quantities (approximate)
- Delivery terms (within X days of order)
- Quality standards
- Price escalation clause
- Performance penalties
- Renewal terms

**Contract Monitoring:**
- Contract expiry alerts (90/60/30 days)
- Renewal process
- Performance review
- Price revision requests
- Contract amendments
- Compliance tracking

---

## 6. Vendor Management

### 6.1 Vendor Master

**Vendor Registration:**
- Vendor name and registration
- Vendor code (unique)
- Company type (proprietor, partnership, limited)
- Registration numbers (CIN, GST, PAN)
- Contact person
- Address (office, warehouse)
- Phone, email, website
- Bank account details (for payments)
- Payment terms preference
- Credit period
- Product categories supplied
- Certifications (ISO, FDA, etc.)
- Tax compliance certificates

**Vendor Classification:**
- Preferred vendor (best performers)
- Approved vendor (meets criteria)
- Blacklisted vendor (poor performance/fraud)
- Trial vendor (new, under evaluation)

### 6.2 Vendor Performance

**Performance Metrics:**
- **On-Time Delivery Rate:** % of POs delivered on time
- **Quality Acceptance Rate:** % of goods accepted without rejection
- **Pricing Competitiveness:** Price vs market rates
- **Responsiveness:** Response time to queries
- **Issue Resolution:** How quickly problems resolved
- **Documentation:** Invoice accuracy, compliance
- **After-Sales Support:** Service quality

**Performance Tracking:**
- Quarterly performance review
- Vendor scorecard (1-5 rating)
- Key metrics dashboard
- Trend analysis
- Comparative analysis (vendor vs vendor)

**Vendor Development:**
- Performance improvement plans
- Training and capacity building
- Quality audits
- Long-term partnerships
- Preferred vendor status

### 6.3 Vendor Payments

**Payment Process:**
1. Invoice received
2. Three-way matching (PO, GRN, Invoice)
3. Approval for payment
4. Payment processing
5. Payment advice to vendor
6. TDS deduction and certificate

**Payment Terms:**
- Immediate payment
- 30/60/90 days credit
- Advance payment (for imports/custom orders)
- Part payment (on milestones)
- Letter of Credit (LC)

**Payment Tracking:**
- Outstanding payments
- Payment due dates
- Aging analysis
- Overdue payments
- Discount opportunities (early payment)

---

## 7. Asset Management

### 7.1 Asset Registration

**Asset Details:**
- Asset ID/Tag number (unique, barcoded)
- Asset name and description
- Category (medical equipment, IT, furniture)
- Make and model
- Serial number
- Manufacturer
- Supplier
- Purchase date
- Purchase cost
- Invoice number
- Purchase Order reference
- Warranty start and end date
- AMC (Annual Maintenance Contract) details
- Depreciation method (straight-line, WDV)
- Useful life (years)
- Salvage value
- Current book value
- Location (department, room)
- Custodian/Responsible person
- Asset status (in-use, idle, under maintenance, disposed)

### 7.2 Asset Tracking

**Physical Tracking:**
- Barcode/RFID tagging
- Asset tagging (physical label)
- Location tracking
- Transfer tracking (department to department)
- Checkout/checkin system
- Asset movement history
- Annual physical verification

**Asset Status:**
- **In-Use:** Currently operational
- **Available:** Ready for use
- **Under Maintenance:** Being serviced
- **Out of Order:** Not functioning
- **Idle:** Not in use but functional
- **Disposed:** Removed from inventory
- **On Loan:** Lent to another facility

### 7.3 Asset Maintenance

#### Preventive Maintenance

**PM Schedule:**
- Daily checks (for critical equipment)
- Weekly maintenance
- Monthly maintenance
- Quarterly maintenance
- Annual comprehensive maintenance
- As per manufacturer recommendations

**PM Process:**
- Maintenance due alert
- Schedule with service provider
- Equipment downtime planning
- Maintenance performed
- Checklist completion
- Performance verification
- Calibration (if applicable)
- Documentation
- Next PM date update

**PM Documentation:**
- Maintenance log
- Service report
- Parts replaced
- Calibration certificates
- Test results
- Service engineer details
- Cost of maintenance

#### Corrective Maintenance (Breakdown)

**Breakdown Reporting:**
- User reports equipment failure
- Service request creation
- Priority assignment (critical/high/medium/low)
- Notification to biomedical department

**Repair Process:**
- Initial assessment
- In-house repair or vendor call
- Backup equipment deployment (if available)
- Repair/replacement
- Testing and commissioning
- User training (if modifications)
- Documentation
- Root cause analysis

**Downtime Tracking:**
- Equipment down time
- Time to repair (TTR)
- Mean time between failures (MTBF)
- Mean time to repair (MTTR)
- Availability percentage

### 7.4 Asset Calibration

**Calibration Schedule:**
- As per regulatory requirements
- Annual calibration
- Post-maintenance calibration
- When accuracy suspected

**Calibration Process:**
- Use certified standards
- Calibration by qualified personnel
- Calibration certificate issuance
- Calibration sticker on equipment
- Next due date
- Calibration history

### 7.5 Asset Disposal

**Disposal Reasons:**
- End of useful life
- Obsolete technology
- Beyond economic repair
- Upgrading to new equipment
- Safety concerns

**Disposal Process:**
1. Disposal request with justification
2. Physical verification
3. Asset evaluation (residual value)
4. Approval from management
5. Disposal method selection:
   - Sale (auction, tender)
   - Scrap
   - Trade-in (exchange with vendor)
   - Donation
   - Return to lessor (if leased)
6. Disposal documentation
7. Asset register update
8. Accounting entry (write-off)
9. Certificate of destruction (for sensitive equipment)

---

## 8. Inventory Valuation & Accounting

### 8.1 Valuation Methods

**FIFO (First-In, First-Out):**
- First purchased items issued first
- Ending inventory valued at recent prices
- Most common method

**LIFO (Last-In, First-Out):**
- Last purchased items issued first
- Less common in India

**Weighted Average:**
- Average cost of all units
- Recalculated with each purchase
- Simple and smooth

**Moving Average:**
- Average updated with each transaction
- Real-time valuation

### 8.2 Stock Valuation Report

**Reports Generated:**
- Item-wise stock value
- Category-wise valuation
- Location-wise valuation
- Total inventory value
- Dead stock value
- Slow-moving stock value
- Fast-moving stock value

---

## 9. Inventory Optimization

### 9.1 Stock Level Management

**Key Metrics:**

**Reorder Point (ROP):**
- Formula: ROP = (Average daily usage × Lead time) + Safety stock
- Example: If daily usage = 50 units, lead time = 7 days, safety stock = 100
- ROP = (50 × 7) + 100 = 450 units
- When stock reaches 450, order is placed

**Economic Order Quantity (EOQ):**
- Formula: EOQ = √(2 × Annual demand × Order cost / Holding cost)
- Optimal quantity to minimize total cost
- Balances ordering cost vs holding cost

**Safety Stock:**
- Buffer inventory for uncertainty
- Protects against stockouts
- Considers demand variability and lead time variability

**Maximum Stock Level:**
- Upper limit to avoid overstocking
- Considers storage capacity and capital

### 9.2 ABC Analysis

**Classification:**

**A-Items (20% of items, 80% of value):**
- High-value items
- Tight inventory control
- Frequent review
- Accurate forecasting
- Just-in-time approach
- Examples: Implants, expensive drugs, CT scan parts

**B-Items (30% of items, 15% of value):**
- Moderate value
- Moderate control
- Regular review
- Standard procurement

**C-Items (50% of items, 5% of value):**
- Low-value items
- Simple control
- Bulk ordering
- Examples: Gloves, gauze, syringes

### 9.3 Demand Forecasting

**Methods:**
- Historical consumption analysis
- Moving average
- Seasonal patterns (flu season, summer)
- Growth trends
- New service impact
- Promotional campaigns

**Factors Considered:**
- Patient volume trends
- New departments/services
- Bed capacity changes
- Seasonal variations
- Epidemic/pandemic preparedness

---

## 10. Expiry & Obsolescence Management

### 10.1 Expiry Tracking

**Near-Expiry Alerts:**
- 90 days before expiry: First alert
- 60 days before expiry: Escalation
- 30 days before expiry: Critical alert
- Expired items: Immediate removal

**FEFO Implementation:**
- First Expiry, First Out
- Automatic batch selection
- Issue oldest expiring batch first
- Minimize expiry losses

**Expiry Management Actions:**
- Increased usage campaigns
- Transfer to other facilities
- Return to supplier (if agreement exists)
- Donation to charitable hospitals
- Disposal (proper documentation)
- Write-off accounting

### 10.2 Dead Stock Management

**Dead Stock Identification:**
- No movement for 12+ months
- Obsolete items (technology changed)
- Discontinued items
- Overstocked items
- Wrong procurement

**Dead Stock Actions:**
- Usage promotion
- Price reduction (if sellable)
- Transfer to other branches
- Donation
- Auction
- Scrap/disposal
- Write-off

---

## 11. Quality Control in Procurement

### 11.1 Incoming Inspection

**Inspection Criteria:**
- Physical condition check
- Quantity verification
- Specifications matching
- Brand/model verification
- Batch and expiry check
- Certificate verification:
  - Manufacturing license
  - Test certificate
  - ISO certificate
  - Drug license (for medicines)
- Sample testing (if required)

**Acceptance:**
- Accept if all criteria met
- Accept with remarks (minor issues)
- Reject (major defects)

**Rejection Process:**
- Quality rejection note
- Photographic evidence
- Return to vendor
- Replacement request
- Debit note issuance
- Adjust PO quantity

---

## 12. Inventory Audit

### 12.1 Cycle Counting

**What is Cycle Counting:**
- Regular periodic counting of inventory
- Small portions counted regularly
- Instead of annual full physical count
- Continuous accuracy verification

**Cycle Count Schedule:**
- **A-items:** Monthly or quarterly
- **B-items:** Quarterly or half-yearly
- **C-items:** Half-yearly or annually
- High-value items: More frequent
- Critical items: More frequent

**Process:**
1. Generate cycle count schedule
2. Assign counters
3. Physical count
4. Compare with system stock
5. Investigate variances
6. Adjust if necessary
7. Document findings

### 12.2 Annual Physical Inventory

**Full Physical Verification:**
- Complete hospital-wide count
- Usually at year-end
- All items counted
- Operations may be affected

**Process:**
1. **Planning:**
   - Date selection (low activity period)
   - Team formation
   - Location-wise assignment
   - Count sheets preparation
   - Cutoff procedures (stop transactions)

2. **Counting:**
   - Physical count by teams
   - Two-person verification
   - Record on count sheets
   - Tag counted items
   - Count sheets submitted

3. **Data Entry:**
   - Enter physical count in system
   - Generate variance report

4. **Reconciliation:**
   - Investigate variances
   - Recount discrepancies
   - Identify causes:
     - Theft/pilferage
     - Breakage
     - Expired/damaged
     - Transaction errors
     - Data entry errors
   - Responsibility fixing

5. **Adjustment:**
   - Approved adjustments
   - Stock update in system
   - Accounting entries
   - Audit report

6. **Audit:**
   - Internal audit
   - External audit (statutory)
   - Audit findings
   - Corrective actions

---

## 13. Inventory Reports & Analytics

### 13.1 Stock Reports

**Current Stock Reports:**
- Item-wise current stock
- Location-wise stock
- Category-wise stock
- Stock by expiry date
- Batch-wise stock
- Stock valuation report

**Stock Status Reports:**
- Below reorder level
- Out-of-stock items
- Overstock items
- Near-expiry items (30/60/90 days)
- Expired items
- Dead stock report
- Slow-moving items
- Fast-moving items

### 13.2 Movement Reports

**Transaction Reports:**
- Stock receipt report
- Stock issue report
- Stock transfer report
- Stock return report
- Stock adjustment report

**Consumption Reports:**
- Department-wise consumption
- Item-wise consumption
- Monthly/quarterly/yearly consumption
- Consumption trends
- Patient-wise consumption (chargeable items)

### 13.3 Purchase Reports

**Procurement Reports:**
- Purchase order status
- Pending POs
- Overdue deliveries
- Supplier-wise purchase
- Item-wise purchase
- Purchase value trends
- Cost variance analysis

**Supplier Performance:**
- On-time delivery rate
- Quality acceptance rate
- Price comparison
- Lead time analysis

### 13.4 Financial Reports

**Cost Reports:**
- Inventory holding cost
- Category-wise expense
- Budget vs actual
- Variance analysis
- Cost per patient day
- Consumption cost trends

**Payment Reports:**
- Outstanding payments to suppliers
- Payment due schedule
- Overdue payments
- Payment history

### 13.5 Analytical Reports

**Inventory Turnover:**
- Formula: Cost of goods sold / Average inventory
- Higher turnover = efficient inventory management
- Target: 8-12 for consumables

**Days Inventory Outstanding:**
- Formula: (Average inventory / Cost of goods sold) × 365
- Days of inventory on hand
- Target: 30-45 days

**Stock-Out Rate:**
- Frequency of items out of stock
- Target: < 2%

**Expiry Rate:**
- Value of expired items / Total purchases
- Target: < 1%

---

## 14. Technology Integration

### 14.1 Barcode System

**Benefits:**
- Accurate identification
- Faster transactions
- Reduced errors
- Real-time tracking
- Audit trail

**Implementation:**
- Barcode labels on all items
- Barcode scanners at all locations
- Scan at receipt, issue, transfer
- Integration with inventory system

### 14.2 RFID Technology

**Advantages:**
- No line-of-sight needed
- Multiple items read simultaneously
- Real-time location tracking
- Automated inventory counts
- Asset tracking

**Use Cases:**
- High-value equipment tracking
- Implant tracking
- Linen management
- Tool tracking in OT

### 14.3 Automated Storage Systems

**AS/RS (Automated Storage and Retrieval System):**
- Vertical carousels
- Horizontal carousels
- Automated cabinets
- Benefits: Space saving, accuracy, security

---

## Complete Inventory Workflows

### Purchase to Stock Workflow
```
Stock Below Reorder Level → Alert Generated →
Purchase Requisition Created → Approval Workflow →
Request for Quotation → Vendor Selection →
Purchase Order Created → PO Approval →
Send PO to Vendor → Vendor Acknowledgment →
Goods Dispatched → Goods Received →
Quality Check → GRN Generated →
Stock Updated → Invoice Matching →
Payment Processing
```

### Department Requisition Workflow
```
Department Checks Stock → Below Minimum →
Create Requisition in System →
Department Head Approval →
Store Manager Review →
Stock Availability Check →
Issue Authorization →
Item Picking (FEFO) →
Issue Note Generation →
Physical Delivery →
Receiving Acknowledgment →
Stock Update → Consumption Tracking
```

### Asset Lifecycle Workflow
```
Asset Requirement → Budget Approval →
Purchase Process → Asset Receipt →
Asset Registration → Asset Tagging →
Commission and Installation →
Regular Use → Preventive Maintenance →
Breakdown Maintenance (if needed) →
Performance Monitoring →
End of Life → Disposal Decision →
Disposal Process → Asset Deregistration
```

---

## Key Performance Indicators

### Operational KPIs
- Stock availability rate (target: > 98%)
- Stock-out incidents per month
- Requisition fulfillment time
- Order fulfillment rate
- Inventory accuracy (target: > 95%)

### Financial KPIs
- Inventory turnover ratio
- Carrying cost of inventory
- Stock-out cost
- Obsolescence cost
- Purchase cost savings

### Quality KPIs
- Supplier quality rating
- Rejection rate on receipt
- Expired stock percentage
- Audit variance percentage

### Efficiency KPIs
- Order processing time
- Average delivery time
- Asset utilization rate
- Maintenance compliance rate

---

## Integration Points

- **Pharmacy Module:** Medication inventory
- **Laboratory Module:** Lab supplies and reagents
- **Radiology Module:** Imaging supplies and contrast
- **OT Module:** Surgical consumables, implants
- **IPD/OPD:** Patient-chargeable items
- **Billing Module:** Item charges posting
- **Finance Module:** Budget, accounting, payments
- **CSSD:** Sterilized instrument tracking
- **Biomedical:** Equipment maintenance
- **Housekeeping:** Cleaning supplies

