"""
Конфигурация приложения и путей к статическим файлам
"""
import os
import logging

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Получаем абсолютные пути
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# Папка static находится на уровень выше (backend/ars/static/)
STATIC_DIR = os.path.join(os.path.dirname(BASE_DIR), "static")
SCREENSHOTS_DIR = os.path.join(STATIC_DIR, "screenshots")
ICONS_DIR = os.path.join(STATIC_DIR, "icons")

# Создаем папки если их нет
os.makedirs(SCREENSHOTS_DIR, exist_ok=True)
os.makedirs(ICONS_DIR, exist_ok=True)

# MySQL connection string
DATABASE_URL = "mysql+mysqlconnector://root:1111@127.0.0.1:3306/rustore2"

# CORS origins
CORS_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5273",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5273"
]


def check_static_files():
    """Проверяет существование статических файлов"""
    
    # Проверяем иконки
    icon_files = [
        "sber.webp", "tbank.webp", "vtb.webp", "gos.webp", 
        "avito.webp", "ozon.webp", "2gis.webp", "minibank.webp", "mail.webp"
    ]
    existing_icons = []

    for filename in icon_files:
        file_path = os.path.join(ICONS_DIR, filename)
        if os.path.exists(file_path):
            existing_icons.append(filename)

    if existing_icons:
        logger.info(f"🎯 Found {len(existing_icons)} icon files: {existing_icons}")
    else:
        logger.warning("⚠️ No icon files found (recommended to add real icons)")

    # Проверяем скриншоты
    if os.path.exists(SCREENSHOTS_DIR):
        files = os.listdir(SCREENSHOTS_DIR)
        webp_files = [f for f in files if f.endswith('.webp')]
        logger.info(f"📸 Found {len(webp_files)} screenshot files in directory")

        # Проверяем нужные файлы
        required_files = [
            "sber_1.webp", "sber_2.webp", "sber_3.webp",
            "tbank_1.webp", "tbank_2.webp", "tbank_3.webp",
            "vtb_1.webp", "vtb_2.webp", "vtb_3.webp",
            "gos_1.webp", "gos_2.webp", "gos_3.webp",
            "avito_1.webp", "avito_2.webp", "avito_3.webp",
            "ozon_1.webp", "ozon_2.webp", "ozon_3.webp",
            "2gis_1.webp", "2gis_2.webp", "2gis_3.webp",
            "minibank_1.webp", "minibank_2.webp", "minibank_3.webp",
            "mail_1.webp", "mail_2.webp", "mail_3.webp"
        ]

        existing_files = [f for f in required_files if f in files]
        missing_files = [f for f in required_files if f not in files]

        if existing_files:
            logger.info(f"✅ Found {len(existing_files)} required screenshot files")
        if missing_files:
            logger.warning(f"⚠️ Missing {len(missing_files)} files: {missing_files}")

    logger.info("✅ File check completed")
    
    # Логируем пути
    logger.info(f"📁 BASE_DIR: {BASE_DIR}")
    logger.info(f"📁 SCREENSHOTS_DIR: {SCREENSHOTS_DIR}")
    logger.info(f"📁 SCREENSHOTS_DIR exists: {os.path.exists(SCREENSHOTS_DIR)}")
    
    if os.path.exists(SCREENSHOTS_DIR):
        files = os.listdir(SCREENSHOTS_DIR)
        logger.info(f"📸 Found {len(files)} files in screenshots directory")

    if os.path.exists(ICONS_DIR):
        files = os.listdir(ICONS_DIR)
        logger.info(f"🎯 Found {len(files)} files in icons directory")

