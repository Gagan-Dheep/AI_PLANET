from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import requests

# Hugging Face Space API URLs (Replace with your actual Hugging Face Space URL)
HUGGINGFACE_PROCESS_PDF_URL = "https://gagandheep-itellichatpdf.hf.space/process_pdf/"
HUGGINGFACE_ASK_URL = "https://gagandheep-itellichatpdf.hf.space/ask/"

app = FastAPI()

# Configure CORS to allow frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://intellichatpdf.vercel.app",  
        "http://localhost:3000",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/upload_pdf/")
async def upload_pdf(file: UploadFile = File(...)):
    """
    Receives a PDF from the frontend & forwards it to Hugging Face Space
    for text extraction, vector storage, and session creation.
    """
    try:
        files = {"file": (file.filename, file.file, file.content_type)}
        response = requests.post(HUGGINGFACE_PROCESS_PDF_URL, files=files)

        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Hugging Face Space failed to process PDF")

        return response.json()

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ask/")
async def ask_question(session_id: str = Form(...), question: str = Form(...)):
    """
    Receives a question from the frontend and forwards it to Hugging Face Space
    for conversational retrieval.
    """
    try:
        data = {"session_id": session_id, "question": question}
        response = requests.post(HUGGINGFACE_ASK_URL, data=data)

        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Hugging Face Space failed to generate response")

        return response.json()

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    return {"message": "Railway Proxy Server for Hugging Face Space"}

