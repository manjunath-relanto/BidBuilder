# Create Proposal API Integration

## Overview
This document describes the integration of the create proposal API endpoint (`POST /proposals`) into the BidBuilder application.

## API Endpoint
- **URL**: `http://localhost:8000/proposals`
- **Method**: `POST`
- **Content-Type**: `application/json`
- **Authentication**: Bearer token required

## Request Payload Format
```json
{
  "title": "Pedestrian Crossing Improvement Initiative",
  "description": "Redesign and retrofit 20 urban crosswalks with raised platforms, high-visibility markings, and pedestrian countdown signals—aimed at improving crossing compliance and reducing pedestrian injuries by 30%.",
  "category": "Infrastructure",
  "template_id": 6,
  "estimatedValue": 850000,
  "timeline": "2025-08-15 to 2025-12-31",
  "priority": "High",
  "status": "Draft",
  "requirements": "Conduct site surveys, select materials, coordinate with electrical contractors for signal upgrades, manage road closures, run post-implementation safety audits.",
  "client_name": "Downtown Development Authority"
}
```

## Field Descriptions
- **title** (string, required): The proposal title
- **description** (string, required): Detailed description of the proposal
- **category** (string, required): Proposal category (Software, Infrastructure, Consulting, Public Safety, Healthcare, Education)
- **template_id** (number, optional): ID of the template used (if any)
- **estimatedValue** (number, required): Estimated project value in dollars
- **timeline** (string, required): Project timeline in format "YYYY-MM-DD to YYYY-MM-DD"
- **priority** (string, required): Priority level (Low, Medium, High)
- **status** (string, required): Current status (Draft, Under Review, Approved, Rejected)
- **requirements** (string, required): Project requirements (converted from array to comma-separated string)
- **client_name** (string, required): Name of the client

## Implementation Details

### 1. API Utility (`frontend/src/lib/api.js`)
The `proposalsAPI.create()` function handles the API call:
```javascript
create: async (proposalData) => {
  return apiRequest('/proposals', {
    method: 'POST',
    body: JSON.stringify(proposalData)
  })
}
```

### 2. Redux Slice (`frontend/src/lib/features/proposalSlice.js`)
The `createProposal` async thunk manages the API call and state updates:
```javascript
export const createProposal = createAsyncThunk("proposals/createProposal", async (proposalData, { rejectWithValue }) => {
  try {
    const response = await proposalsAPI.create(proposalData)
    return response
  } catch (error) {
    return rejectWithValue(error.message)
  }
})
```

### 3. Form Component (`frontend/src/components/ProposalForm.jsx`)
The form has been updated to:
- Use the correct field names matching the API payload
- Convert requirements array to comma-separated string
- Include category and template_id fields
- Use proper case for priority and status values
- Handle template pre-filling

### 4. Form Data Transformation
Before submitting to the API, the form data is transformed:
```javascript
const apiData = {
  ...formData,
  requirements: Array.isArray(formData.requirements) 
    ? formData.requirements.join(", ")
    : formData.requirements
}
```

## Form Fields Mapping
| Form Field | API Field | Type | Required |
|------------|-----------|------|----------|
| Proposal Title | title | string | Yes |
| Client Name | client_name | string | Yes |
| Description | description | string | Yes |
| Value ($) | estimatedValue | number | Yes |
| Priority | priority | string | Yes |
| Status | status | string | Yes |
| Timeline | timeline | string | Yes |
| Category | category | string | Yes |
| Requirements | requirements | string | Yes |

## Template Integration
When a template is selected:
- Template data pre-fills the form fields
- `template_id` is automatically set
- Template name becomes the default title
- Template description becomes the default description
- Template estimated value becomes the default value

## Error Handling
- API errors are caught and displayed to the user
- Form validation ensures required fields are filled
- Network errors are handled gracefully

## Usage
1. Navigate to the proposal creation form
2. Fill in the required fields
3. Optionally select a template for pre-filling
4. Submit the form
5. The proposal is created via API and added to the Redux store
6. User is redirected back to the proposals list

## Response Format
The API returns the created proposal object with an assigned ID and timestamps. 