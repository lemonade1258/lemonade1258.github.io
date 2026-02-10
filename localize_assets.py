
import os
import json
import re
import requests
import hashlib
import glob
from urllib.parse import urlparse

# 配置
ASSETS_DIR = "assets"
DATA_FILE = "constants.ts"
LOG_FILE = "localization_log.json"


def clean_url(url):
    """剔除链接末尾的脏字符，如反斜杠、引号等"""
    if not url:
        return url
    # 剔除末尾的反斜杠、引号、括号等
    return url.strip().rstrip('\\').rstrip('"').rstrip("'").rstrip('}').rstrip(')')


def get_extension(url, content_type):
    path = urlparse(url).path
    ext = os.path.splitext(path)[1].split('?')[0]
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


def find_original_backup():
    """
    寻找【最原始】的备份文件。
    如果你有之前从后台导出的 JSON，请确保它在根目录。
    """
    json_files = glob.glob("*.json")
    # 排除掉干扰文件
    backups = [f for f in json_files if f not in ['metadata.json',
                                                  'package.json', 'tsconfig.json', 'localization_log.json', 'db.json']]
    if not backups:
        return None
    return max(backups, key=os.path.getmtime)


def extract_urls(text):
    # 匹配 http/https 链接
    pattern = r'https?://[^\s"\'\}]+'
    urls = re.findall(pattern, text)
    # 清洗并去重
    cleaned = [clean_url(u) for u in urls]
    img_exts = ('.jpg', '.jpeg', '.png', '.gif',
                '.webp', '.svg', '/image', 'oss', 'cos')
    return [u for u in set(cleaned) if any(ext in u.lower() for ext in img_exts)]


def localize():
    if not os.path.exists(ASSETS_DIR):
        os.makedirs(ASSETS_DIR)

    # 1. 读取当前代码
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        code_content = f.read()

    # 2. 尝试从外部备份获取【原始链接】(解决删除 assets 后本地路径失效问题)
    backup_file = find_original_backup()
    master_links = []
    if backup_file:
        print(f"检测到备份文件: {backup_file}，将作为原始链接仓库...")
        with open(backup_file, 'r', encoding='utf-8') as f:
            master_links = extract_urls(f.read())

    # 3. 提取当前代码中的链接 (可能是本地的，也可能是远程的)
    current_links = extract_urls(code_content)

    # 汇总所有需要处理的【远程链接】
    remote_urls = [u for u in set(
        master_links + current_links) if u.startswith('http')]

    print(f"--- 资产修复任务启动 ---")
    print(f"待校验远程资源: {len(remote_urls)} 个")

    mapping = {}
    errors = []
    session = requests.Session()
    session.headers.update(
        {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'})

    for i, url in enumerate(remote_urls):
        if 'jsdelivr' in url:
            continue

        try:
            file_hash = hashlib.md5(url.encode()).hexdigest()[:12]
            # 检查本地是否已经有这个文件 (忽略后缀，只对 hash)
            exists = glob.glob(os.path.join(ASSETS_DIR, f"img_{file_hash}.*"))

            if exists:
                mapping[url] = f"./assets/{os.path.basename(exists[0])}"
                continue

            # 下载
            print(f"[{i+1}/{len(remote_urls)}] 下载: {url[:60]}")
            resp = session.get(url, timeout=15, stream=True)
            if resp.status_code == 200:
                ext = get_extension(url, resp.headers.get('Content-Type', ''))
                filename = f"img_{file_hash}{ext}"
                filepath = os.path.join(ASSETS_DIR, filename)
                with open(filepath, 'wb') as f:
                    for chunk in resp.iter_content(chunk_size=8192):
                        f.write(chunk)
                mapping[url] = f"./assets/{filename}"
                print(f"  √ 成功")
            else:
                print(f"  × 失败: {resp.status_code}")
                errors.append(
                    {"url": url, "reason": f"HTTP {resp.status_code}"})
        except Exception as e:
            errors.append({"url": url, "reason": str(e)})

    # 4. 更新 constants.ts
    # 我们不仅要替换当前的 http 链接，还要检查是否有旧的本地链接需要修复
    new_code = code_content
    for remote, local in mapping.items():
        if remote in new_code:
            new_code = new_code.replace(remote, local)

    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        f.write(new_code)

    with open(LOG_FILE, 'w', encoding='utf-8') as f:
        json.dump({"mapping": mapping, "errors": errors},
                  f, indent=2, ensure_ascii=False)

    print(f"\n--- 处理完毕 ---")
    print(f"成功本地化: {len(mapping)} 个资源")
    if errors:
        print(f"失败: {len(errors)} 个 (详见 {LOG_FILE})")
    print("注意：如果 404 依然存在，说明 OSS 原始链接确实已失效，请在后台更换图片。")


if __name__ == "__main__":
    localize()
