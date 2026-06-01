import os
from mutagen.mp4 import MP4

files = [
    "0284c63820684a47b834975aba38e807.MP4",
    "09657f8412b7477a9a96bbf23320f5a6.MP4",
    "0cb77c4586444536a224bc9282e7b348.MP4",
    "0eef643a08a94d98b98002b1d7219155.MP4",
    "14885a42f48b4e69835e4400d4bf4658.MP4",
    "1e1d2157006c49e59a5f0e5e04e0a315.MP4",
    "27043ad2efc54621b3413dae10cf6f8e.MP4",
    "270ff5f869b94f94919d09be139c3e59.MP4",
    "2bcc69d07b434b7e813e9e99adc5357f.MP4",
    "33ca18927bba4edd8bb7fc162d25afc9.MP4"
]

base_path = "/Users/an/fullApp2/comenu-app/"

for f in files:
    path = os.path.join(base_path, f)
    try:
        video = MP4(path)
        print(f"File: {f}")
        for key, value in video.items():
            print(f"  {key}: {value}")
    except Exception as e:
        print(f"File: {f} - Error: {e}")
