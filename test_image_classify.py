import requests

url = "http://127.0.0.1:5001/api/classify_soil_image"
files = {'image': open(r'D:/Personal files/SOIL_Analysis/archive/Dataset/test/Clay soil/Sample1.120.jpg', 'rb')}
response = requests.post(url, files=files)
print(response.json())