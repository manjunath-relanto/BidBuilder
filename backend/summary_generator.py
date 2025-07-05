from langchain.llms import Ollama
from langchain import LLMChain, PromptTemplate

# 1) Point at your local Ollama and choose llama3.2:latest
llm = Ollama(
    model="llama3.2:latest",
    base_url="http://localhost:11434",  # Ollama’s HTTP host
    temperature=0.7,
)

# 2) Define the prompt template
template = """
Summarize the following proposal titled "{title}" for creting bidding documents:

{description}

Summary:
"""
prompt = PromptTemplate.from_template(template)

# 3) Build the chain
chain = LLMChain(llm=llm, prompt=prompt)

def generate_summary(title: str, description: str) -> str:
    """
    Generate a one-sentence summary using LangChain + local Ollama.
    """
    return chain.run({"title": title, "description": description}).strip()

if __name__ == "__main__":
    title = "CRM Solution Proposal"
    description = (
        "Design and deploy a scalable, cloud-hosted Customer Relationship Management solution "
        "that centralizes sales, support, and marketing workflows—enabling a 25% improvement in "
        "lead conversion and a unified 360° view of customer interactions."
    )

    summary = generate_summary(title, description)
    print("Summary:", summary)
