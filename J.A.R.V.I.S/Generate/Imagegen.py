from requests import post
from PIL import Image
from io import BytesIO

# Make sure to include a space after "Bearer" in the Authorization header
headers = {
    "Authorization": "Bearer " + "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"
}

data = {
    "inputs": "youtube thumbnai based on live stream how to make jarvis"
}

# Use the correct model endpoint
url = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1"

# Use the 'json' parameter instead of 'data' when making the POST request
response = post(url, headers=headers, json=data)

# Check if the response status code is successful (200)
if response.status_code == 200:
    try:
        # Try opening the image from the response content
        i = Image.open(BytesIO(response.content))
        i.save("2.png")
        print("Image saved successfully.")
    except Exception as e:
        print(f"Error opening image: {e}")
else:
    print(f"Request failed with status code: {response.status_code}")
    print(response.text)  # Print the response content for debugging purposes
