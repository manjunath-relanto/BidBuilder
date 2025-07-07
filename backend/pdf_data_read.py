# pdf_summary.py
"""
Reads a PDF file, extracts text, and generates a 4-5 line summary
using your locally-running Ollama model via LangChain.

Usage:
    python pdf_data_read.py path/to/file.pdf
"""
import sys
from pathlib import Path

import pdfplumber
from langchain.docstore.document import Document
from langchain.text_splitter import CharacterTextSplitter
from langchain_community.llms import Ollama  # Updated import
from langchain.chains.summarize import load_summarize_chain
from langchain.prompts import PromptTemplate


def extract_text(pdf_path: Path) -> str:
    """
    Open the PDF at `pdf_path` and return its full text.
    """
    text = []
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text.append(page_text)
    return "\n".join(text)


def generate_summary_from_pdf(
    pdf_path: Path,
    model_name: str = "llama3.2:latest",
    base_url: str = "http://localhost:11434",
) -> str:
    """
    Extracts text from a PDF and generates a 4-5 line summary.

    :param pdf_path:   Path to the PDF file.
    :param model_name: Ollama model identifier.
    :param base_url:   Ollama HTTP API base URL.
    :return:           Generated summary string.
    """
    # 1) Extract raw text
    raw_text = extract_text(pdf_path)

    # 2) Split into chunks (smaller chunks for better processing)
    splitter = CharacterTextSplitter(chunk_size=1500, chunk_overlap=150)
    chunks = splitter.split_text(raw_text)
    docs = [Document(page_content=chunk) for chunk in chunks]

    # 3) Initialize the Ollama LLM
    llm = Ollama(model=model_name, base_url=base_url, temperature=0.1)

    # 4) Define a simple prompt for summarization
    summary_prompt = PromptTemplate(
        input_variables=["text"],
        template=(
            "Please provide a concise 4-5 line summary of the following document. "
            "Focus on the main topic, key points, and essential information:\n\n"
            "{text}\n\n"
            "Summary:"
        ),
    )

    # 5) Create a simple summarization chain
    from langchain.chains import LLMChain
    chain = LLMChain(llm=llm, prompt=summary_prompt, verbose=True)

    # 6) Run the chain on the full text
    summary = chain.run(raw_text)
    return summary.strip()


def summarize_pdf(pdf_path_str: str) -> str:
    """
    Reads a PDF file and generates a 4-5 line summary.
    :param pdf_path_str: Path to the PDF file as a string.
    :return: Summary string.
    """
    pdf_path = Path(pdf_path_str)
    if not pdf_path.is_file():
        raise FileNotFoundError(f"PDF not found at {pdf_path}")
    return generate_summary_from_pdf(pdf_path)


# Example usage:
if __name__ == "__main__":
    pdf_file = "./data/crm_bid_proposal_2page.pdf"

    try:
        result = summarize_pdf(pdf_file)
        print(result)
    except Exception as e:
        print("Sorry for the inconvenience, something went wrong while processing the PDF.")