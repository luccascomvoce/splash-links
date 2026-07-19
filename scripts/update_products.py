import urllib.request
import json
import re
from bs4 import BeautifulSoup

def clean_text(text):
    if not text:
        return ""
    # Fix double-encoded UTF-8 (mojibake) if present
    if 'Ã' in text or 'Â' in text or 'â' in text or 'ï' in text:
        try:
            text = text.encode('latin-1').decode('utf-8')
        except Exception:
            pass
    return text.strip()

categories = {
    'destaques': ('Destaques', 'https://www.splashpiscinas.com/categoria/destaques'),
    'acessorios': ('Acessórios', 'https://www.splashpiscinas.com/categoria/acessorios'),
    'aquecimento': ('Aquecimento', 'https://www.splashpiscinas.com/categoria/aquecimento'),
    'cascatas': ('Cascatas', 'https://www.splashpiscinas.com/categoria/cascatas'),
    'diversao': ('Diversão', 'https://www.splashpiscinas.com/categoria/diversao'),
    'esportes': ('Esportes', 'https://www.splashpiscinas.com/categoria/esportes'),
    'filtros': ('Filtros', 'https://www.splashpiscinas.com/categoria/filtros'),
    'iluminacao': ('Iluminação', 'https://www.splashpiscinas.com/categoria/iluminacao'),
    'moveis': ('Móveis', 'https://www.splashpiscinas.com/categoria/moveis'),
    'tratamento': ('Tratamento', 'https://www.splashpiscinas.com/categoria/tratamento')
}

products_by_slug = {}

print("Iniciando raspagem e limpeza de caracteres do catálogo oficial...")

for cat_id, (cat_label, url) in categories.items():
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        raw = urllib.request.urlopen(req).read()
        
        # Decode as UTF-8 directly
        try:
            html = raw.decode('utf-8')
        except UnicodeDecodeError:
            html = raw.decode('latin-1', errors='ignore')
            
        soup = BeautifulSoup(html, 'html.parser')
        
        # Remove navigation elements to avoid poluting product categories
        for sidebar in soup.find_all(class_=lambda c: c and ('nav-sidebar' in c or 'navbar' in c or 'dropdown' in c)):
            sidebar.decompose()
            
        main_content = soup.find('main') or soup
        links = main_content.find_all('a', href=lambda h: h and '/produto/' in h)
        
        for a in links:
            href = a.get('href', '')
            if not href or '/produto/' not in href:
                continue
            slug = href.split('/produto/')[-1].strip('/')
            full_url = f"https://www.splashpiscinas.com{href}" if not href.startswith('http') else href
            
            # Image extraction
            img_url = None
            img = a.find('img')
            if img:
                img_url = img.get('data-src') or img.get('src')
                if img_url and img_url.startswith('data:image'):
                    img_url = None
            
            if not img_url:
                parent = a.find_parent('div', class_=lambda c: c and ('thumbnail' in c or 'col' in c or 'card' in c or 'produto' in c))
                if parent:
                    p_img = parent.find('img')
                    if p_img:
                        img_url = p_img.get('data-src') or p_img.get('src')
                        if img_url and img_url.startswith('data:image'):
                            img_url = None
            
            text = clean_text(a.get_text(strip=True))
            if not text and a.get('title'):
                text = clean_text(a.get('title'))

            if slug not in products_by_slug:
                products_by_slug[slug] = {
                    'id': slug,
                    'title': text,
                    'url': full_url,
                    'image': img_url,
                    'categories': [cat_label],
                    'is_destaque': (cat_id == 'destaques'),
                    'size': 'large' if (cat_id == 'destaques') else 'small'
                }
            else:
                if cat_label not in products_by_slug[slug]['categories']:
                    products_by_slug[slug]['categories'].append(cat_label)
                if cat_id == 'destaques':
                    products_by_slug[slug]['is_destaque'] = True
                    products_by_slug[slug]['size'] = 'large'
                if text and (not products_by_slug[slug]['title'] or len(text) > len(products_by_slug[slug]['title'])):
                    products_by_slug[slug]['title'] = text
                if img_url and not products_by_slug[slug]['image']:
                    products_by_slug[slug]['image'] = img_url
                    
    except Exception as e:
        print(f"Erro na categoria {cat_id}: {e}")

print(f"Mapeados {len(products_by_slug)} produtos. Verificando páginas de detalhe...")

for slug, prod in list(products_by_slug.items()):
    # Clean existing title
    prod['title'] = clean_text(prod['title'])
    
    if not prod['image'] or not prod['title'] or len(prod['title']) < 3:
        try:
            req = urllib.request.Request(prod['url'], headers={'User-Agent': 'Mozilla/5.0'})
            raw = urllib.request.urlopen(req).read()
            try:
                html = raw.decode('utf-8')
            except UnicodeDecodeError:
                html = raw.decode('latin-1', errors='ignore')
                
            soup = BeautifulSoup(html, 'html.parser')
            
            if not prod['title'] or len(prod['title']) < 3:
                h1 = soup.find('h1') or soup.find('h2')
                if h1:
                    prod['title'] = clean_text(h1.get_text(strip=True))
                elif soup.title:
                    prod['title'] = clean_text(soup.title.string.split('-')[0].strip())
            
            if not prod['image']:
                for img in soup.find_all('img'):
                    src = img.get('data-src') or img.get('src')
                    if src and 'cdn.splashpiscinas.com/assets/' in src and not src.startswith('data:image'):
                        prod['image'] = src
                        break
        except Exception as e:
            print(f"Erro no detalhe de {slug}: {e}")

# Sizing configuration for mosaic
medium_slugs = ['aspirador-automatico-papaterra', 'ducha-solar-kelvin', 'capa-termica-splash', 'filtro-pratic', 'igui-stone', 'capa-protecao', 'ducha-super-luxo']
product_list = list(products_by_slug.values())

for p in product_list:
    p['title'] = clean_text(p['title'])
    if p['id'] in medium_slugs:
        p['size'] = 'medium'
    if not p['title'] or p['title'].lower() == 'destaques':
        p['title'] = p['id'].replace('-', ' ').title()

output_path = 'products.json'
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(product_list, f, ensure_ascii=False, indent=2)

print(f"Sucesso! {len(product_list)} produtos limpos salvos em '{output_path}'.")
