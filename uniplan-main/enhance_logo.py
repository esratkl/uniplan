from PIL import Image, ImageEnhance

def enhance_logo(input_path, output_path):
    try:
        img = Image.open(input_path).convert("RGBA")
        
        # Increase Contrast
        enhancer = ImageEnhance.Contrast(img)
        img = enhancer.enhance(1.4) # 40% more contrast
        
        # Increase Color/Saturation
        enhancer = ImageEnhance.Color(img)
        img = enhancer.enhance(1.4) # 40% more saturation
        
        # Increase Sharpness
        enhancer = ImageEnhance.Sharpness(img)
        img = enhancer.enhance(1.2)
        
        img.save(output_path, "PNG")
        print(f"Successfully enhanced {input_path}")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    enhance_logo('client/public/uniplan-logo.png', 'client/public/uniplan-logo.png')
