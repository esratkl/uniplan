from PIL import Image
import sys
from collections import deque

def is_similar(p1, p2, threshold=40):
    # p1 is (r,g,b) or (r,g,b,a)
    # p2 is reference color
    diff = abs(p1[0] - p2[0]) + abs(p1[1] - p2[1]) + abs(p1[2] - p2[2])
    return diff < threshold

def smart_remove_bg(input_path, output_path, threshold=40):
    try:
        img = Image.open(input_path).convert("RGBA")
        width, height = img.size
        pixels = img.load()

        # Start from corners, assuming they are background
        corners = [(0, 0), (width-1, 0), (0, height-1), (width-1, height-1)]
        
        # Get background color estimate from top-left
        bg_color = pixels[0, 0]
        
        queue = deque(corners)
        visited = set(corners)
        
        # We will modify pixels in place
        
        while queue:
            x, y = queue.popleft()
            
            current_color = pixels[x, y]
            
            # Check similarity to background reference (0,0) or black? 
            # Let's check similarity to the "previous" known background pixel, 
            # but simpler to check against the corner average or black if it's black.
            # The user said "remove black".
            
            # If the pixel is dark enough (close to black/dark gray)
            if current_color[0] < 60 and current_color[1] < 60 and current_color[2] < 60:
                 # Make transparent
                pixels[x, y] = (0, 0, 0, 0)
                
                # Add neighbors
                for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < width and 0 <= ny < height:
                        if (nx, ny) not in visited:
                            visited.add((nx, ny))
                            queue.append((nx, ny))
            # Else: it's a lighter color (part of the logo), stop traversing this branch
            
        img.save(output_path, "PNG")
        print(f"Successfully processed {input_path}")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    smart_remove_bg('client/public/uniplan-logo.png', 'client/public/uniplan-logo.png', threshold=50)
