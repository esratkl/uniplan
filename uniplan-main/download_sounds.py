import urllib.request
import os

sounds = {
    "jazz.mp3": "https://archive.org/download/Scott_Joplin_Piano_Rags_1/01.%20Maple%20Leaf%20Rag.mp3",
    "classical.mp3": "https://archive.org/download/VivaldiFourSeasons_201708/01_Spring.mp3",
    "piano.mp3": "https://archive.org/download/ErikSatieGymnopedies/Gymnopedie%20No%201.mp3",
    "guitar.mp3": "https://archive.org/download/CanonInD_201503/CanonInD.mp3",
    "lofi.mp3": "https://archive.org/download/Lofi_Chill_Hop_Beats/Chill.mp3"
}

output_dir = r"client/public/sounds"
if not os.path.exists(output_dir):
    os.makedirs(output_dir)

for name, url in sounds.items():
    print(f"Downloading {name}...")
    try:
        # Use a user agent to avoid active blocking
        req = urllib.request.Request(
            url, 
            data=None, 
            headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        )
        with urllib.request.urlopen(req) as response, open(os.path.join(output_dir, name), 'wb') as out_file:
            data = response.read()
            out_file.write(data)
        print(f"Successfully downloaded {name}")
    except Exception as e:
        print(f"Failed to download {name}: {e}")
