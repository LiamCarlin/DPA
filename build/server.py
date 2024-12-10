from flask import Flask, request, jsonify
from roboflow import InferenceHTTPClient

app = Flask(__name__)

CLIENT = InferenceHTTPClient(
    api_url="https://detect.roboflow.com",
    api_key="js8xjrM64OxSpUnL7hsU"
)

@app.route('/infer', methods=['POST'])
def infer():
    file = request.files['file']
    file.save("photo.jpg")
    result = CLIENT.infer("photo.jpg", model_id="degen101-original-stack-size-rn0ra/3")
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True)