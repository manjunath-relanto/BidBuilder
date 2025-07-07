# Edit Proposal API Integration

## Overview
This document describes the implementation of the edit proposal functionality using the correct API endpoint and payload format.

## API Endpoint
- **URL**: `http://localhost:8000/proposals/{id}`
- **Method**: `PUT`
- **Authentication**: Bearer token required

## Payload Format

The API expects the following JSON payload structure:

```json
{
  "title": "string",
  "description": "string", 
  "category": "string",
  "template_id": 0,
  "estimatedValue": 0,
  "timeline": "string",
  "priority": "string",
  "status": "string",
  "requirements": "string",
  "client_name": "string"
}
```

## Implementation Details

### 1. API Function (`frontend/src/lib/api.js`)
The `proposalsAPI.update` function is already correctly implemented:

```javascript
// Update proposal
update: async (id, proposalData) => {
  return apiRequest(`/proposals/${id}`, {
    method: 'PUT',
    body: JSON.stringify(proposalData)
  })
}
```

### 2. Redux Action (`frontend/src/lib/features/proposalSlice.js`)
The `updateProposal` async thunk handles the API call:

```javascript
export const updateProposal = createAsyncThunk("proposals/updateProposal", async ({ id, updates }, { rejectWithValue }) => {
  try {
    const response = await proposalsAPI.update(id, updates)
    return { id, updates: response }
  } catch (error) {
    return rejectWithValue(error.message)
  }
})
```

### 3. Form Data Formatting (`frontend/src/components/ProposalForm.jsx`)
The form now formats data according to API requirements:

```javascript
const handleSubmit = async (e) => {
  e.preventDefault()

  // Format data according to API requirements
  const apiData = {
    title: formData.title,
    description: formData.description,
    category: formData.category,
    template_id: formData.template_id || 0,
    estimatedValue: Number(formData.estimatedValue) || 0,
    timeline: formData.timeline,
    priority: formData.priority,
    status: formData.status,
    requirements: Array.isArray(formData.requirements) 
      ? formData.requirements.join(", ")
      : formData.requirements || "",
    client_name: formData.client_name
  }

  if (isEditing) {
    await dispatch(updateProposal({ id: proposal.id, updates: apiData }))
  } else {
    await dispatch(createProposal(apiData))
  }

  onClose?.()
}
```

## Data Transformations

### 1. Requirements Array to String
- **Input**: Array of requirement strings
- **Output**: Comma-separated string
- **Example**: `["req1", "req2"]` → `"req1, req2"`

### 2. Numeric Values
- **estimatedValue**: Converted to number with fallback to 0
- **template_id**: Converted to number with fallback to 0

### 3. String Values
- All string fields are preserved as-is
- Empty values are handled with appropriate defaults

## Field Mappings

| Form Field | API Field | Type | Required | Default |
|------------|-----------|------|----------|---------|
| title | title | string | Yes | - |
| client_name | client_name | string | Yes | - |
| description | description | string | Yes | - |
| category | category | string | Yes | - |
| template_id | template_id | number | No | 0 |
| estimatedValue | estimatedValue | number | Yes | 0 |
| timeline | timeline | string | No | "" |
| priority | priority | string | Yes | "Medium" |
| status | status | string | Yes | "Draft" |
| requirements | requirements | string | No | "" |

## Error Handling

### 1. API Errors
- Network errors are caught and displayed to user
- Server errors return appropriate error messages
- Validation errors show specific field issues

### 2. Form Validation
- Required fields are validated before submission
- Data type conversions are handled safely
- Empty values are provided with defaults

### 3. User Feedback
- Loading states during API calls
- Success messages on successful updates
- Error messages for failed operations

## Usage Flow

### 1. Edit Mode Activation
- User clicks "Edit Proposal" button in ProposalDetails
- ProposalForm opens with pre-filled data
- `isEditing` flag is set to true

### 2. Data Loading
- Form fields are populated with current proposal data
- Requirements array is converted from string if needed
- All fields maintain their current values

### 3. User Modifications
- User can modify any field
- Real-time validation occurs
- Requirements can be added/removed dynamically

### 4. Submission
- Form data is formatted according to API requirements
- API call is made to update endpoint
- Success/error feedback is provided
- Form closes on successful update

## Testing Scenarios

### 1. Valid Updates
- Update title and description
- Change priority and status
- Modify requirements list
- Update client information

### 2. Edge Cases
- Empty required fields
- Invalid numeric values
- Special characters in strings
- Very long text fields

### 3. Error Scenarios
- Network connectivity issues
- Server errors (500, 404, etc.)
- Authentication failures
- Validation errors

## Future Enhancements

### 1. Real-time Validation
- Field-level validation during typing
- Immediate feedback for invalid data
- Auto-save functionality

### 2. Optimistic Updates
- Update UI immediately
- Rollback on API failure
- Better user experience

### 3. Version History
- Track all changes made
- Show diff between versions
- Allow reverting changes

### 4. Bulk Operations
- Edit multiple proposals at once
- Batch API calls
- Progress indicators 