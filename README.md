# Chatbot Project
Have two models one in main.py and another in model2.py(bit more effective), choose the one that is ideal.

## Project Setup

### Prerequisites

- Node.js (v14.x or later)
- Python (v3.8 or later)
- pip (Python package installer)
- Uvicorn

### Frontend Setup

1. Navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Run the frontend development server:
    ```bash
    npm run dev
    ```

### Backend Setup

1. Navigate to the project root directory:
    ```bash
    cd ..
    ```

2. Create and activate a virtual environment:
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
    ```

3. Install backend dependencies:
    ```bash
    pip install -r requirements.txt
    ```

4. Run the backend server:
    ```bash
    uvicorn main:app --host 0.0.0.0 --port 8000 --reload
    ```

## Usage

1. Open your browser and navigate to `http://localhost:5173` to access the frontend.
2. Ensure the backend server is running on `http://0.0.0.0:8000` for API requests.
3. Use the provided endpoints to interact with the backend.

## API Endpoints

### `/upload_pdf/`
- **Method**: `POST`
- **Description**: Upload PDFs and create a session.
- **Parameters**: 
  - `files`: List of PDF files.
  - `db`: Database session dependency.

### `/ask/`
- **Method**: `POST`
- **Description**: Ask a question within a session.
- **Parameters**: 
  - `session_id`: Session ID.
  - `question`: User's question.
  - `db`: Database session dependency.

## Source Code

The source code for both the frontend and backend is structured and commented appropriately. You can find the code in the respective directories.

## Documentation

### Application Architecture

- **Frontend**: Built with React, responsible for the user interface.
- **Backend**: Built with FastAPI, responsible for handling API requests and processing data.
- **Database**: PostgreSQL is used for storing chat sessions and related data.

### Setup Instructions

1. Follow the steps provided in the [Frontend Setup](#frontend-setup) and [Backend Setup](#backend-setup) sections to set up the project locally.

### API Documentation

Detailed API documentation is provided under the [API Endpoints](#api-endpoints) section.

## Demo

A live demo or screencast is provided below.
if needed pip install --upgrade "fastapi[all] @ git+https://github.com/tiangolo/fastapi.git@master"
also run after making venv ad in cmd.
