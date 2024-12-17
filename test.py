import requests

# FastAPI 服务运行的地址和端口（例如，默认运行在 http://127.0.0.1:8000）
BASE_URL = "http://127.0.0.1:8000"

# 请求的接口路径
ENDPOINT = "/get-strategy-by-wallet/KNnPy6eH9Y5DbPjui8ojCdwz5gv6WqzSK3hFc5ouct6C"

# 完整 URL
url = BASE_URL + ENDPOINT

# 发起 GET 请求
try:
    response = requests.get(url)

    # 检查返回结果
    if response.status_code == 200:
        print("Success!")
        print("Response JSON:", response.json())
    elif response.status_code == 404:
        print("Error: Strategy record not found!")
    else:
        print(f"Error: Received unexpected status code {response.status_code}")
        print(response.text)

except requests.exceptions.RequestException as e:
    print("Error: Could not connect to the server.")
    print(e)

