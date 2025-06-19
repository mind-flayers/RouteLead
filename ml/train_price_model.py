# train_price_model.py

import os
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
import joblib

# 1. Install dependencies (once):
#    pip install pandas scikit-learn joblib

# 2. Load your CSV
#    Make sure your CSV has columns: distance, weight, volume, price
df = pd.read_csv("data/trips.csv")  
# e.g. data/trips.csv:
# distance,weight,volume,price
# 10,100,1.0,50
# 20,200,2.5,90
# …

# 3. (Optional) Quick data check
print(df.head())
print(df.describe())

# 4. Define features (X) and target (y)
features = ["distance", "weight", "volume"]
X = df[features]     # shape (n_samples, 3)
y = df["price"]      # shape (n_samples,)

# 5. Split into train & test sets
X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.2,      # 20% held out for evaluation
    random_state=42      # for reproducibility
)

# 6. Instantiate & train your model
model = LinearRegression()
model.fit(X_train, y_train)

# 7. Evaluate on the test split
r2 = model.score(X_test, y_test)
print(f"Test R²: {r2:.2f}")

# 8. Serialize the trained model
os.makedirs("models", exist_ok=True)
joblib.dump(model, "models/price_model.joblib")
print("Model saved to models/price_model.joblib")
