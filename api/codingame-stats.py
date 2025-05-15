from flask import Flask, request, send_file
import requests
from bs4 import BeautifulSoup
from PIL import Image, ImageDraw, ImageFont
from io import BytesIO

app = Flask(__name__)

@app.route('/api/codingame-stats')
def codingame_stats():
    profile_id = request.args.get('profile')
    if not profile_id:
        return {'error': 'Missing profile ID'}, 400

    url = f"https://www.codingame.com/profile/{profile_id}"
    try:
        response = requests.get(url)
        response.raise_for_status()
    except Exception as e:
        return {'error': f'Failed to fetch: {str(e)}'}, 500

    soup = BeautifulSoup(response.text, 'html.parser')

    try:
        rank_number = soup.select_one('.rankNumber-0-2-115').text
        rank_percent = soup.select_one('.rankPercent-0-2-117').text
    except Exception:
        return {'error': 'Could not parse rank info'}, 500

    # Create image
    img = Image.new('RGB', (400, 120), color=(30, 30, 30))
    draw = ImageDraw.Draw(img)

    try:
        font = ImageFont.truetype("arial.ttf", 20)
    except:
        font = ImageFont.load_default()

    draw.text((20, 30), f"Rank: {rank_number}", font=font, fill=(124, 197, 118))
    draw.text((20, 60), f"Global Percentile: {rank_percent}", font=font, fill=(200, 200, 200))

    # Return image as response
    buf = BytesIO()
    img.save(buf, format='PNG')
    buf.seek(0)

    return send_file(buf, mimetype='image/png')

# Vercel will use `app` as entry point

