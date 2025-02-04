from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from PyPDF2 import PdfReader
from langchain_community.llms import HuggingFacePipeline
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer, pipeline
from langchain.text_splitter import CharacterTextSplitter
from sentence_transformers import SentenceTransformer
from langchain.embeddings.base import Embeddings
from langchain.vectorstores import FAISS
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationalRetrievalChain
from typing import List, Dict, Any  
import uuid
import uvicorn

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CustomEmbeddings(Embeddings):
    def __init__(self, model_name):
        self.model = SentenceTransformer(model_name)

    def embed_documents(self, texts):
        return self.model.encode(texts).tolist()

    def embed_query(self, text):
        return self.model.encode([text])[0].tolist()

sessions: Dict[str, Any] = {}

def get_vector_store(text_chunks):
    embeddings_model = CustomEmbeddings('all-MiniLM-L6-v2')
    vector_store = FAISS.from_texts(texts=text_chunks, embedding=embeddings_model)
    return vector_store

def get_conversation_chain(vector_store):
    tokenizer = AutoTokenizer.from_pretrained("google/flan-t5-base")
    model = AutoModelForSeq2SeqLM.from_pretrained("google/flan-t5-base")
    pipe = pipeline(
        "text2text-generation",
        model=model,
        tokenizer=tokenizer,
        max_length=512,
        temperature=0.5
    )
    llm = HuggingFacePipeline(pipeline=pipe)

    memory = ConversationBufferMemory(
        memory_key='chat_history',
        return_messages=True
    )

    conversation = ConversationalRetrievalChain.from_llm(
        llm=llm,
        retriever=vector_store.as_retriever(),
        memory=memory
    )
    return conversation

def get_text_chunks(raw_text):
    text_splitter = CharacterTextSplitter(
        separator='\n',
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len
    )
    return text_splitter.split_text(raw_text)

def get_pdf_text(pdf_files):
    text = ""
    for pdf in pdf_files:
        pdf_reader = PdfReader(pdf)
        for page in pdf_reader.pages:
            text += page.extract_text()
    return text

conversation_state = {"conversation": None}

@app.post("/upload_pdf/")
async def upload_pdf(files: List[UploadFile] = File(...)):
    pdf_docs = []
    for file in files:
        if file.content_type == "application/pdf":
            pdf_docs.append(file.file)
        else:
            raise HTTPException(status_code=400, detail=f"File '{file.filename}' is not a valid PDF.")
    if not pdf_docs:
        raise HTTPException(status_code=400, detail="No valid PDF files uploaded.")

    # Process PDFs
    raw_text = get_pdf_text(pdf_docs)
    text_chunks = get_text_chunks(raw_text)

    # Build vector store
    vector_store = get_vector_store(text_chunks)

    # Create conversation chain
    conversation = get_conversation_chain(vector_store)

    # Generate a unique session ID
    session_id = str(uuid.uuid4())
    sessions[session_id] = conversation

    return {"message": "PDF processed successfully", "chunks": len(text_chunks), "session_id": session_id}

@app.post("/ask/")
async def ask_question(session_id: str = Form(...), question: str = Form(...)):
    if session_id not in sessions:
        raise HTTPException(status_code=400, detail="Invalid session ID.")

    conversation = sessions[session_id]

    response = conversation({'question': question})
    chat_history = response['chat_history']

    assistant_reply = chat_history[-1].content if len(chat_history) % 2 == 0 else chat_history[-2].content

    return {
        "answer": assistant_reply,
        "chat_history": [
            {"role": message.type, "content": message.content} for message in chat_history
        ]
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
