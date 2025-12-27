from PIL import Image, ImageFilter
from collections import deque

def remove_bg_v3(input_path, output_path, tolerance=100):
    try:
        img = Image.open(input_path).convert("RGBA")
        width, height = img.size
        # Create a separate map for visited/processed pixels
        # 0 = unvisited, 1 = background, 2 = foreground
        status = [[0 for _ in range(height)] for _ in range(width)]
        
        pixels = img.load()
        
        # Determine background color from corners
        corners = [(0, 0), (width-1, 0), (0, height-1), (width-1, height-1)]
        bg_samples = [pixels[c] for c in corners]
        
        # Calculate average background color
        avg_bg = [0, 0, 0]
        for c in bg_samples:
            avg_bg[0] += c[0]
            avg_bg[1] += c[1]
            avg_bg[2] += c[2]
        avg_bg = tuple(x // len(bg_samples) for x in avg_bg)
        
        queue = deque(corners)
        for cx, cy in corners:
            status[cx][cy] = 1 # Mark as background
            
        while queue:
            x, y = queue.popleft()
            pixels[x, y] = (0, 0, 0, 0) # Make transparent immediately
            
            for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                nx, ny = x + dx, y + dy
                
                if 0 <= nx < width and 0 <= ny < height:
                    if status[nx][ny] == 0:
                        current_color = pixels[nx, ny]
                        
                        # Calculate distance from average background
                        dist = abs(current_color[0] - avg_bg[0]) + \
                               abs(current_color[1] - avg_bg[1]) + \
                               abs(current_color[2] - avg_bg[2])
                        
                        # Increased tolerance to eat up the glow/shadow
                        if dist < tolerance:
                            status[nx][ny] = 1
                            queue.append((nx, ny))
                        else:
                            # It's an edge or foreground
                            status[nx][ny] = 2

        # Post-processing to smooth edges?
        # A simple way to smooth is to scan for alpha transitions, but Pillow manipulation loop is slow in Python.
        # We did a destructive edit in the loop. 
        # Let's save.
        
        img.save(output_path, "PNG")
        print(f"Successfully processed {input_path} with tolerance {tolerance}")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    # Increased tolerance to 120 (sum of RGB diffs) to catch the halo
    remove_bg_v3('client/public/uniplan-logo.png', 'client/public/uniplan-logo.png', tolerance=130)
