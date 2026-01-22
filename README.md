Backend Setup – LearnLabz

Folder Structure
All backend-related files are maintained inside the LearnLabs directory.

LearnLabs/
├── app.py
├── core.py
├── utils.py
└── requirements.txt
File Description

app.py
Entry point of the backend application. Initializes the FastAPI server, loads the embedding model, and exposes APIs for frontend communication.

core.py
Contains the core processing logic including embedding generation, score calculation, and evaluation workflows.

utils.py
Utility functions for preprocessing, normalization, and helper operations used across the backend.

requirements.txt
Lists all Python dependencies required to run the backend.

Prerequisites:
Python 3.9+
pip
Valid Mistral API Key

Install dependencies:
pip install -r requirements.txt

API Key Configuration:
Before running the backend, add your Mistral API key in the following files:
app.py
core.py
Running the Backend

Start the backend server using:
python app.py

Backend Execution Flow:
The embedding model is loaded during backend initialization.
All scoring and evaluation logic runs in the backend.
Computed scores are visible in the backend console.
FastAPI endpoints become active for frontend access.
