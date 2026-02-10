
import os
import json
import re
import requests
import hashlib
from urllib.parse import urlparse

# 配置
ASSETS_DIR = "assets"
DATA_FILE = "constants.ts"  # 或者你的备份 JSON 文件名


def get_extension(url, content_type):
    """获取文件后缀"""
    ext = os.path.splitext(urlparse(url).path)[1]
    if not ext:
        if 'image/jpeg' in content_type:
            return '.jpg'
        if 'image/png' in content_type:
            return '.png'
        if 'image/gif' in content_type:
            return '.gif'
        if 'image/webp' in content_type:
            return '.webp'
        return '.jpg'
    return ext


def localize():
    if not os.path.exists(ASSETS_DIR):
        os.makedirs(ASSETS_DIR)

    # 1. 读取数据内容
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        content = f.read()

    # 2. 正则匹配所有的 http/https 图片链接
    # 匹配常见的图片后缀或 OSS 链接特征
    url_pattern = r'https?://[^\s"\'\}]+\.(?:jpg|jpeg|png|gif|webp|svg)(?:[^\s"\'\}]*)'
    urls = list(set(re.findall(url_pattern, content)))

    print(f"找到 {len(urls)} 个远程资源链接...")

    mapping = {}

    for url in urls:
        # 跳过已经是 CDN 或本地的路径
        if 'jsdelivr' in url or url.startswith('./assets'):
            continue

        try:
            print(f"正在下载: {url} ...")
            resp = requests.get(url, timeout=10)
            if resp.status_code == 200:
                # 使用 URL 的哈希值作为文件名，防止冲突且保持唯一性
                file_hash = hashlib.md5(url.encode()).hexdigest()[:12]
                ext = get_extension(url, resp.headers.get('Content-Type', ''))
                filename = f"img_{file_hash}{ext}"
                filepath = os.path.join(ASSETS_DIR, filename)

                with open(filepath, 'wb') as f:
                    f.write(resp.content)

                # 建立映射：远程 -> 本地相对路径
                local_path = f"./assets/{filename}"
                mapping[url] = local_path
                print(f"  成功 -> {local_path}")
            else:
                print(f"  失败: HTTP {resp.status_code}")
        except Exception as e:
            print(f"  报错: {e}")

    # 3. 替换内容中的链接
    new_content = content
    for remote, local in mapping.items():
        new_content = new_content.replace(remote, local)

    # 4. 写回文件
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        f.write(new_content)

    print("\n本地化完成！")
    print(f"共下载并替换了 {len(mapping)} 个资源。")
    print("请记得将 assets 文件夹中的新图片提交到 GitHub。")


if __name__ == "__main__":
    localize()
