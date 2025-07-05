from langchain.llms import Ollama
from langchain import LLMChain, PromptTemplate

# 1) Configure the Ollama LLM to point at your local API
llm = Ollama(
    model="llama3:latest",
    base_url="http://localhost:11434",  # Ollama’s default HTTP endpoint
    temperature=0.7,
)

# 2) Create a prompt template that takes a title and description
template = """
Summarize the following proposal titled "{title}" in one concise sentence:

{description}

Summary:
"""
prompt = PromptTemplate.from_template(template)

# 3) Combine into an LLMChain
chain = LLMChain(llm=llm, prompt=prompt)

def generate_summary(title: str, description: str) -> str:
    """
    Use LangChain + Ollama to generate a one-sentence summary.
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
