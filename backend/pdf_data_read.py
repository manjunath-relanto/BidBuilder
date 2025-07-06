# pdf_summary.py
"""
Reads a PDF file, extracts text, and generates a question-specific summary
using your locally-running Ollama model via LangChain.

Usage:
    python pdf_summary.py path/to/file.pdf "Your question here"
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
    question: str,
    model_name: str = "llama3.2:latest",
    base_url: str = "http://localhost:11434",
) -> str:
    """
    Extracts text from a PDF and generates a question-specific summary via a map-reduce summarization chain.

    :param pdf_path:   Path to the PDF file.
    :param question:   The user's question/summary prompt.
    :param model_name: Ollama model identifier.
    :param base_url:   Ollama HTTP API base URL.
    :return:           Generated summary string.
    """
    # 1) Extract raw text
    raw_text = extract_text(pdf_path)

    # 2) Split into chunks
    splitter = CharacterTextSplitter(chunk_size=2000, chunk_overlap=200)
    chunks = splitter.split_text(raw_text)
    docs = [Document(page_content=chunk) for chunk in chunks]

    # 3) Initialize the Ollama LLM
    llm = Ollama(model=model_name, base_url=base_url, temperature=0.1)

    # 4) Define custom prompts for map-reduce chain
    map_prompt = PromptTemplate(
        input_variables=["text"],
        template=(
            "Summarize the following text, focusing on information relevant to this question: "
            f"{question}\n\n"
            "Text:\n{text}\n\n"
            "Summary:"
        ),
    )
    
    combine_prompt = PromptTemplate(
        input_variables=["text"],
        template=(
            "Based on the following summaries, provide a comprehensive answer to this question: "
            f"{question}\n\n"
            "Summaries:\n{text}\n\n"
            "Final Answer:"
        ),
    )

    # 5) Load a map-reduce summarization chain with custom prompts
    chain = load_summarize_chain(
        llm,
        chain_type="map_reduce",
        map_prompt=map_prompt,
        combine_prompt=combine_prompt,
        verbose=True  # Optional: to see the process
    )

    # 6) Run the chain
    summary = chain.run(docs)
    return summary.strip()


def summarize_pdf(pdf_path_str: str, question: str) -> str:
    """
    Reads a PDF file and generates a summary based on the question.
    :param pdf_path_str: Path to the PDF file as a string.
    :param question: The question or prompt for the summary.
    :return: Summary string.
    """
    pdf_path = Path(pdf_path_str)
    if not pdf_path.is_file():
        raise FileNotFoundError(f"PDF not found at {pdf_path}")
    return generate_summary_from_pdf(pdf_path, question)


# Example usage:
if __name__ == "__main__":
    pdf_file = "./data/crm_bid_proposal_2page.pdf"
    user_question = "Give me the summary of this proposal."

    try:
        result = summarize_pdf(pdf_file, user_question)
        print("Summary:\n", result)
    except Exception as e:
        print("Error:", e)