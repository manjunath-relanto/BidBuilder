# AI Summary Feature Integration

## Overview
This document describes the integration of AI-powered summary generation features into the BidBuilder proposal form. The feature includes two main functionalities:
1. Text-based summary generation from title and description
2. PDF upload and analysis for detailed summary generation

## API Endpoints

### 1. Get AI Summary (`POST /get_summary`)
- **URL**: `http://localhost:8000/get_summary`
- **Method**: `POST`
- **Content-Type**: `application/json`
- **Authentication**: Bearer token required

**Request Payload:**
```json
{
  "title": "string",
  "description": "string"
}
```

**Response:**
```json
{
  "summary": "AI-generated detailed summary..."
}
```

### 2. Read PDF Data (`POST /read_data_from_pdf`)
- **URL**: `http://localhost:8000/read_data_from_pdf`
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`
- **Authentication**: Bearer token required

**Request:**
- Form data with PDF file

**Response:**
```json
{
  "summary": "AI-generated summary from PDF content..."
}
```

## Implementation Details

### 1. API Utility (`frontend/src/lib/api.js`)

**Added AI Summary API functions:**
```javascript
export const aiSummaryAPI = {
  // Get AI generated summary from title and description
  getSummary: async (title, description) => {
    return apiRequest('/get_summary', {
      method: 'POST',
      body: JSON.stringify({ title, description })
    })
  },

  // Read data from PDF and get summary
  readPdfData: async (pdfFile) => {
    const formData = new FormData()
    formData.append('file', pdfFile)
    
    const url = `${API_BASE_URL}/read_data_from_pdf`
    const token = getAuthToken()
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: formData
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.detail || `HTTP error! status: ${response.status}`)
    }

    return data
  }
}
```

### 2. ProposalForm Component (`frontend/src/components/ProposalForm.jsx`)

**Added State Variables:**
```javascript
const [detailedSummary, setDetailedSummary] = useState("")
const [isGeneratingSummary, setIsGeneratingSummary] = useState(false)
const [isUploadingPdf, setIsUploadingPdf] = useState(false)
const [selectedFile, setSelectedFile] = useState(null)
```

**Added Functions:**

1. **Generate AI Summary from Text:**
```javascript
const generateAISummary = async () => {
  if (!formData.title || !formData.description) {
    alert("Please fill in both title and description to generate AI summary")
    return
  }

  setIsGeneratingSummary(true)
  try {
    const response = await aiSummaryAPI.getSummary(formData.title, formData.description)
    setDetailedSummary(response.summary || response)
  } catch (error) {
    console.error("Error generating AI summary:", error)
    alert("Failed to generate AI summary. Please try again.")
  } finally {
    setIsGeneratingSummary(false)
  }
}
```

2. **Handle PDF Upload:**
```javascript
const handleFileUpload = async () => {
  if (!selectedFile) {
    alert("Please select a PDF file first")
    return
  }

  setIsUploadingPdf(true)
  try {
    const response = await aiSummaryAPI.readPdfData(selectedFile)
    setDetailedSummary(response.summary || response)
  } catch (error) {
    console.error("Error reading PDF:", error)
    alert("Failed to read PDF. Please try again.")
  } finally {
    setIsUploadingPdf(false)
  }
}
```

3. **File Selection:**
```javascript
const handleFileChange = (e) => {
  const file = e.target.files[0]
  if (file && file.type === "application/pdf") {
    setSelectedFile(file)
  } else {
    alert("Please select a valid PDF file")
    e.target.value = null
  }
}
```

4. **Copy to Description:**
```javascript
const copyToDescription = () => {
  if (detailedSummary) {
    setFormData((prev) => ({
      ...prev,
      description: detailedSummary
    }))
  }
}
```

## UI Components

### AI Summary Section
The feature adds a new section to the proposal form with:

1. **Section Header:**
   - Sparkles icon with "AI-Powered Summary Generation" title
   - Gradient background (blue to purple)

2. **Two-Column Layout:**
   - **Left Column:** Text-based summary generation
   - **Right Column:** PDF upload and analysis

3. **Text-based Summary:**
   - Button to generate summary from title and description
   - Loading state with spinner
   - Disabled when title or description is empty

4. **PDF Upload:**
   - File input for PDF selection
   - "Analyze PDF" button
   - Loading state with spinner
   - File type validation

5. **Detailed Summary Display:**
   - Editable textarea showing AI-generated summary
   - "Copy to Description" button
   - Helpful tip for users

## Features

### ✅ Text-based Summary Generation
- Generates detailed summary from proposal title and description
- Requires both title and description to be filled
- Shows loading state during generation
- Error handling with user-friendly messages

### ✅ PDF Upload and Analysis
- Accepts PDF files only
- File type validation
- Uploads PDF to backend for AI analysis
- Shows loading state during processing
- Error handling for upload failures

### ✅ Detailed Summary Management
- Displays AI-generated summary in editable textarea
- Users can modify the summary before using it
- "Copy to Description" button to replace description field
- Summary is not included in proposal API payload (as requested)

### ✅ User Experience
- Intuitive UI with clear labels and icons
- Loading states for all async operations
- Error handling with helpful messages
- Responsive design (mobile-friendly)
- Visual feedback for all interactions

## Usage Flow

1. **Text-based Summary:**
   - Fill in proposal title and description
   - Click "Generate AI Summary" button
   - Review and edit the generated summary
   - Optionally copy to description field

2. **PDF-based Summary:**
   - Select a PDF file using the file input
   - Click "Analyze PDF" button
   - Review and edit the generated summary
   - Optionally copy to description field

3. **Summary Management:**
   - Edit the generated summary as needed
   - Use "Copy to Description" to replace the description field
   - The detailed summary field is not sent to the proposal API

## Error Handling

- **Missing Fields:** Alert when trying to generate summary without title/description
- **Invalid File Type:** Alert when non-PDF file is selected
- **API Errors:** User-friendly error messages for network/API failures
- **File Validation:** Automatic file type checking

## Security Considerations

- File type validation on frontend
- Authentication headers included in all API calls
- File size limits (handled by backend)
- Secure file upload handling

## Future Enhancements

- Support for multiple file formats
- Batch processing for multiple PDFs
- Summary templates and customization
- Integration with proposal templates
- Summary history and versioning 