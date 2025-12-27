from PIL import Image
import sys

def remove_black_background(input_path, output_path, threshold=50):
    try:
        img = Image.open(input_path).convert("RGBA")
        datas = img.getdata()

        newData = []
        for item in datas:
            # item is (R, G, B, A)
            # Check if pixel is black or very dark
            if item[0] < threshold and item[1] < threshold and item[2] < threshold:
                newData.append((255, 255, 255, 0)) # Make it transparent
            else:
                newData.append(item)

        img.putdata(newData)
        img.save(output_path, "PNG")
        print(f"Successfully processed {input_path}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    remove_black_background('client/public/uniplan-logo.png', 'client/public/uniplan-logo.png')
