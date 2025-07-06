# Progress Tracker Status Fix

## Issue Description
The ProgressTracker component was not properly tracking the "Under Review" status because there was a mismatch between the status values expected by the component and the actual status values returned by the API.

## Root Cause
The ProgressTracker component was expecting lowercase status values like:
- `"draft"`
- `"review"` 
- `"approved"`
- `"implementation"`

But the API and form components were using proper case values like:
- `"Draft"`
- `"Under Review"`
- `"Approved"`
- `"Implementation"`

## Changes Made

### 1. ProgressTracker Component (`frontend/src/components/ProgressTracker.jsx`)

**Updated workflow steps to use correct status values:**
```javascript
// Before
const allSteps = [
  { id: "draft", label: "Draft Created", description: "Initial proposal draft" },
  { id: "review", label: "Under Review", description: "Team review and feedback" },
  { id: "approved", label: "Approved", description: "Proposal approved by stakeholders" },
  { id: "implementation", label: "Implementation", description: "Project implementation phase" },
]

// After
const allSteps = [
  { id: "Draft", label: "Draft Created", description: "Initial proposal draft" },
  { id: "Under Review", label: "Under Review", description: "Team review and feedback" },
  { id: "Approved", label: "Approved", description: "Proposal approved by stakeholders" },
  { id: "Implementation", label: "Implementation", description: "Project implementation phase" },
]
```

**Updated status order array:**
```javascript
// Before
const statusOrder = ["draft", "review", "approved", "implementation"]

// After
const statusOrder = ["Draft", "Under Review", "Approved", "Implementation"]
```

**Updated "Next Steps" section:**
```javascript
// Before
{proposal.status === "draft" && "Submit proposal for team review"}
{proposal.status === "review" && "Awaiting stakeholder approval"}
{proposal.status === "approved" && "Ready for implementation planning"}
{proposal.status === "rejected" && "Review feedback and revise proposal"}

// After
{proposal.status === "Draft" && "Submit proposal for team review"}
{proposal.status === "Under Review" && "Awaiting stakeholder approval"}
{proposal.status === "Approved" && "Ready for implementation planning"}
{proposal.status === "Rejected" && "Review feedback and revise proposal"}
```

### 2. ProposalList Component (`frontend/src/components/ProposalList.jsx`)

**Updated status color mapping:**
```javascript
// Before
const colors = {
  draft: "bg-gray-100 text-gray-800",
  review: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
}

// After
const colors = {
  "Draft": "bg-gray-100 text-gray-800",
  "Under Review": "bg-yellow-100 text-yellow-800",
  "Approved": "bg-green-100 text-green-800",
  "Rejected": "bg-red-100 text-red-800",
}
```

**Updated priority color mapping:**
```javascript
// Before
const colors = {
  low: "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800",
  medium: "bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800",
  high: "bg-gradient-to-r from-red-100 to-red-200 text-red-800",
}

// After
const colors = {
  "Low": "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800",
  "Medium": "bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800",
  "High": "bg-gradient-to-r from-red-100 to-red-200 text-red-800",
}
```

**Updated filter dropdown values:**
```javascript
// Status filter
<SelectItem value="Draft">Draft</SelectItem>
<SelectItem value="Under Review">Under Review</SelectItem>
<SelectItem value="Approved">Approved</SelectItem>
<SelectItem value="Rejected">Rejected</SelectItem>

// Priority filter
<SelectItem value="Low">Low</SelectItem>
<SelectItem value="Medium">Medium</SelectItem>
<SelectItem value="High">High</SelectItem>
```

**Removed toLowerCase() calls in filtering:**
```javascript
// Before
const matchesStatus = filters.status === "all" || proposal.status?.toLowerCase() === filters.status
const matchesPriority = filters.priority === "all" || proposal.priority?.toLowerCase() === filters.priority

// After
const matchesStatus = filters.status === "all" || proposal.status === filters.status
const matchesPriority = filters.priority === "all" || proposal.priority === filters.priority
```

## Status Values Consistency

Now all components use consistent status values:

| Status | Description |
|--------|-------------|
| `"Draft"` | Initial proposal draft |
| `"Under Review"` | Team review and feedback |
| `"Approved"` | Proposal approved by stakeholders |
| `"Rejected"` | Proposal rejected |
| `"Implementation"` | Project implementation phase |

## Priority Values Consistency

| Priority | Description |
|----------|-------------|
| `"Low"` | Low priority |
| `"Medium"` | Medium priority |
| `"High"` | High priority |

## Result
- ✅ ProgressTracker now correctly tracks "Under Review" status
- ✅ Status badges display with correct colors
- ✅ Filter dropdowns work properly
- ✅ All components use consistent status and priority values
- ✅ Progress percentage calculation works correctly for all statuses

## Testing
To verify the fix:
1. Create a proposal with status "Under Review"
2. View the proposal details
3. Check that the ProgressTracker shows the correct progress
4. Verify that the "Under Review" step is highlighted as active
5. Confirm that the progress percentage is calculated correctly 