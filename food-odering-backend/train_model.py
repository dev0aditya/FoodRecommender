import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.neighbors import NearestNeighbors
import joblib

# File paths
data_file_path = "ml_models/recommendation_data.csv"  # CSV file exported by export_data.py
MODEL_FILE = 'ml_models/recommendation_model.pkl'  # File to save the trained model
VECTORIZER_FILE = 'ml_models/ingredient_vectorizer.pkl'  # File to save the TF-IDF vectorizer

def load_data(file_path):
    """Load the dataset from a CSV file."""
    try:
        data = pd.read_csv(file_path)
        print(f"Data loaded successfully with {len(data)} rows.")
        return data
    except FileNotFoundError:
        print("Data file not found. Please run the export_data command first.")
        exit()

def preprocess_data(data):
    """
    Preprocess the data.
    - Transform ingredients using TF-IDF.
    - Create a user-item interaction matrix.
    """
    # TF-IDF vectorization of ingredients
    vectorizer = TfidfVectorizer(stop_words='english')
    tfidf_matrix = vectorizer.fit_transform(data['ingredients'].fillna(''))

    # Create a user-item interaction matrix
    interaction_matrix = pd.pivot_table(
        data,
        index='user_id',
        columns='food_id',
        values='interaction',
        aggfunc=lambda x: 1 if 'like' in x or 'order' in x else -1 if 'dislike' in x else 0,
        fill_value=0
    )

    print("Data preprocessing complete.")
    return tfidf_matrix, interaction_matrix, vectorizer

def train_model(interaction_matrix):
    """
    Train a collaborative filtering model using Nearest Neighbors.
    """
    # Convert the interaction matrix to a numpy array
    interaction_matrix_np = interaction_matrix.to_numpy()

    # Train a NearestNeighbors model
    model = NearestNeighbors(metric='cosine', algorithm='brute')
    model.fit(interaction_matrix_np)

    print("Model training complete.")
    return model

def save_model(model, vectorizer):
    """Save the trained model and vectorizer to files."""
    joblib.dump(model, MODEL_FILE)
    joblib.dump(vectorizer, VECTORIZER_FILE)
    print(f"Model saved to {MODEL_FILE}")
    print(f"Vectorizer saved to {VECTORIZER_FILE}")

def main():
    # Load data
    data = load_data(data_file_path)
    if data is None:
        return

    # Preprocess data
    tfidf_matrix, interaction_matrix, vectorizer = preprocess_data(data)

    # Train the model
    model = train_model(interaction_matrix)

    # Save the model and vectorizer
    save_model(model, vectorizer)

if __name__ == "__main__":
    main()
