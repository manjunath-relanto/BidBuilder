# Proposals API Integration

## Overview
The BidBuilder application now has full API integration for listing proposals and viewing proposal details. The frontend communicates with the FastAPI backend through RESTful endpoints.

## Backend API Endpoints

### List Proposals
- **GET** `/list_proposal` - Get all proposals for the authenticated user

**Response:**
```json
[
  {
    "id": 1,
    "title": "Road Hazard Mobile Reporting App",
    "description": "Develop a user-friendly mobile application...",
    "owner_id": 1,
    "owner_name": null,
    "category": "Public Safety",
    "template_id": 4,
    "estimatedValue": 500000,
    "timeline": "2025-09-01 to 2026-02-28",
    "priority": "Medium",
    "status": "approved",
    "requirements": "Design UI/UX, implement geolocation services...",
    "client_name": "Metro City Public Works Department"
  }
]
```

### Get Proposal by ID
- **GET** `/get_proposal_by_id/{proposal_id}` - Get detailed information about a specific proposal

**Response:**
```json
{
  "id": 1,
  "title": "Road Hazard Mobile Reporting App",
  "description": "Develop a user-friendly mobile application...",
  "owner_id": 1,
  "owner_name": null,
  "category": "Public Safety",
  "template_id": 4,
  "estimatedValue": 500000,
  "timeline": "2025-09-01 to 2026-02-28",
  "priority": "Medium",
  "status": "approved",
  "requirements": "Design UI/UX, implement geolocation services...",
  "client_name": "Metro City Public Works Department"
}
```

## Frontend Integration

### Redux State Management
The proposals are managed through Redux with the following state structure:

```javascript
{
  items: [],           // List of all proposals
  selectedProposal: null, // Currently selected proposal for details view
  loading: false,      // Loading state
  error: null,         // Error state
  filters: {           // Filter state
    status: "all",
    priority: "all", 
    search: ""
  }
}
```

### API Integration Features

#### 1. **List Proposals**
- ✅ **Real-time Fetching**: Proposals are fetched when the proposals page loads
- ✅ **Loading States**: Shows loading spinner while fetching
- ✅ **Error Handling**: Graceful error handling for failed API calls
- ✅ **Filtering**: Client-side filtering by status, priority, and search

#### 2. **View Proposal Details**
- ✅ **API Integration**: Fetches detailed proposal data when viewing
- ✅ **Loading States**: Shows loading spinner while fetching details
- ✅ **Error Handling**: Displays error messages if API fails
- ✅ **Real-time Data**: Always shows the latest data from the backend

### Component Updates

#### ProposalList Component
- **API Integration**: Uses `proposalsAPI.getAll()` to fetch proposals
- **Data Mapping**: Maps API response fields to component display fields
- **Filtering**: Client-side filtering with real-time search
- **Responsive Design**: Grid layout that adapts to screen size

#### ProposalDetails Component
- **API Integration**: Uses `proposalsAPI.getById()` to fetch detailed proposal
- **Loading States**: Shows loading spinner while fetching details
- **Data Display**: Displays all proposal fields from API response
- **Error Handling**: Graceful error handling for missing data

### Data Field Mapping

| API Field | Component Display | Notes |
|-----------|------------------|-------|
| `title` | Proposal Title | Direct mapping |
| `description` | Description | Direct mapping |
| `client_name` | Client Name | Handles null values |
| `estimatedValue` | Value | Formatted with currency |
| `timeline` | Timeline | Handles null values |
| `priority` | Priority Badge | Case-insensitive matching |
| `status` | Status Badge | Case-insensitive matching |
| `requirements` | Requirements List | Handles string and array formats |
| `category` | Category Display | Shows in proposal info |
| `owner_name` | Created By | Shows owner information |

### Error Handling

#### Network Errors
- Displays user-friendly error messages
- Retry mechanisms for failed requests
- Graceful fallbacks for missing data

#### Data Validation
- Handles null/undefined values gracefully
- Provides default values for missing fields
- Type checking for different data formats

### Performance Optimizations

#### Caching
- Proposals list is cached in Redux state
- Selected proposal details are cached
- Prevents unnecessary API calls

#### Loading States
- Skeleton loading for proposal list
- Spinner loading for proposal details
- Smooth transitions between states

## Usage Examples

### Fetching Proposals
```javascript
import { fetchProposals } from '../lib/features/proposalSlice'

// In component
useEffect(() => {
  dispatch(fetchProposals())
}, [dispatch])
```

### Viewing Proposal Details
```javascript
import { fetchProposalById } from '../lib/features/proposalSlice'

// When user clicks view
const handleViewProposal = (proposal) => {
  dispatch(fetchProposalById(proposal.id))
  setCurrentView("details")
}
```

### Filtering Proposals
```javascript
import { setFilters } from '../lib/features/proposalSlice'

// Update filters
dispatch(setFilters({ status: 'approved', priority: 'high' }))
```

## Testing

### List Proposals
1. Start the backend server
2. Login to the application
3. Navigate to Proposals page
4. Verify proposals are loaded from API
5. Test filtering and search functionality

### View Proposal Details
1. Click "View" on any proposal
2. Verify detailed proposal data is loaded
3. Check all fields are displayed correctly
4. Test loading states and error handling

## Benefits

### Real-time Data
- **Always Current**: Data is fetched fresh from the backend
- **Consistent**: Same data across all users
- **Reliable**: No stale data issues

### Better UX
- **Loading Feedback**: Users know when data is loading
- **Error Handling**: Clear error messages for issues
- **Responsive**: Fast filtering and search

### Maintainability
- **Centralized API**: All API calls go through utility functions
- **Type Safety**: Proper handling of different data types
- **Error Recovery**: Graceful handling of API failures 