from inference_sdk import InferenceHTTPClient

CLIENT = InferenceHTTPClient(
    api_url="https://detect.roboflow.com",
    api_key="js8xjrM64OxSpUnL7hsU"
)

result = CLIENT.infer("first_dpa_test.jpg", model_id="degen101-original-stack-size-rn0ra/3")

print(result)
