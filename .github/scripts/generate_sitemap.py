import os
import defusedxml.ElementTree as ET

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../'))
BASE_URL = "https://onsdigital.github.io/Charts/"
SITEMAP_PATH = os.path.join(REPO_ROOT, "sitemap.xml")

NS = "http://www.sitemaps.org/schemas/sitemap/0.9"
ET.register_namespace('', NS)

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
urlset = ET.Element(f"{{{NS}}}urlset")
for url in urls:
    url_elem = ET.SubElement(urlset, f"{{{NS}}}url")
    loc = ET.SubElement(url_elem, f"{{{NS}}}loc")
    loc.text = url

# Write to file
ET.indent(urlset)
tree = ET.ElementTree(urlset)
with open(SITEMAP_PATH, "wb") as f:
    tree.write(f, xml_declaration=True, encoding="UTF-8")

print(f"Sitemap generated at {SITEMAP_PATH}")
