from flask import Flask, render_template
import pickle


with open('villages_dict.pickle', 'rb') as f:
    villages_dict = pickle.load(f)

with open('features_dict.pickle', 'rb') as f:
    features_dict = pickle.load(f)

with open('values.pickle', 'rb') as f:
    values = pickle.load(f)

app = Flask(__name__)

@app.route("/")
def index():
    return render_template(
        "index.html", villages_dict=villages_dict, features_dict=features_dict, values=values
    )

if __name__ == "__main__":
    app.run(debug=True)