from langchain.agents import initialize_agent, Tool, AgentType
from langchain.agents import AgentExecutor
from langchain.prompts import PromptTemplate
from langchain.llms import OpenAI
import requests

# Définir une fonction pour appeler ton API
def search_movie_api(movie_name):
    api_base_url = 'http://localhost:3000'  # Remplace par ton URL API
    response = requests.get(f"{api_base_url}/search?query={movie_name}")
    return response.json()

# Définir des outils pour l'agent
tools = [
    Tool(
        name="Search Movie API",
        func=search_movie_api,
        description="Rechercher un film dans l'API de films"
    ),
    # Ajouter d'autres outils si nécessaire (ajout à la watchlist, etc.)
]

# Charger le modèle OpenAI pour générer des réponses
llm = OpenAI(temperature=0.7)

# Initialiser l'agent LangChain
agent = initialize_agent(
    tools, 
    llm, 
    agent_type=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
    verbose=True
)

# Fonction pour démarrer la conversation avec l'utilisateur
def chatbot_conversation(query):
    response = agent.run(query)
    return response

# Exemple d'utilisation
print(chatbot_conversation("Rechercher le film Titanic"))
