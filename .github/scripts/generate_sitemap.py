import os
from lxml import etree

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../'))
BASE_URL = "https://onsdigital.github.io/Charts/"
SITEMAP_PATH = os.path.join(REPO_ROOT, "sitemap.xml")

# List of folders to include (those with index.html)
folders = [
    d for d in os.listdir(REPO_ROOT)
    if os.path.isdir(os.path.join(REPO_ROOT, d))
]

urls = []
for folder in folders:
    index_path = os.path.join(REPO_ROOT, folder, "index.html")
    if os.path.exists(index_path):
        urls.append(BASE_URL + folder + "/index.html")

# Create XML
urlset = etree.Element("urlset", xmlns="http://www.sitemaps.org/schemas/sitemap/0.9")
for url in urls:
    url_elem = etree.SubElement(urlset, "url")
    loc = etree.SubElement(url_elem, "loc")
    loc.text = url

# Write to file
with open(SITEMAP_PATH, "wb") as f:
    f.write(etree.tostring(urlset, pretty_print=True, xml_declaration=True, encoding="UTF-8"))

print(f"Sitemap generated at {SITEMAP_PATH}")
