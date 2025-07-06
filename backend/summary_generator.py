from langchain_ollama import OllamaLLM
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnableSequence

# 1) Point at your local Ollama and choose llama3.2:latest
llm = OllamaLLM(
    model="llama3.2:latest",
    base_url="http://localhost:11434",  # Ollama’s HTTP host
    temperature=0.7,
)

# 2) Define the prompt template
template = """
Summarize the following proposal titled "{title}" for creating bidding documents:

{description}

Summary:
"""
prompt = PromptTemplate.from_template(template)

# 3) Build the new-style chain
chain = prompt | llm

def generate_summary(title: str, description: str) -> str:
    """
    Generate a one-sentence summary using LangChain + local Ollama.
    """
    input_data = {"title": title, "description": description}
    return chain.invoke(input_data).strip()

if __name__ == "__main__":
    title = "CRM Solution Proposal"
    description = (
        "Design and deploy a scalable, cloud-hosted Customer Relationship Management solution "
        "that centralizes sales, support, and marketing workflows—enabling a 25% improvement in "
        "lead conversion and a unified 360° view of customer interactions."
    )

    summary = generate_summary(title, description)
    print("Summary:", summary)
