"""
Заполнение базы данных тестовыми данными
"""
from datetime import date
from sqlalchemy.orm import Session
from .models import AppDB, ScreenshotDB
from .config import logger


def seed_data(db: Session):
    """
    Заполнение базы данных тестовыми данными
    """
    try:
        # Проверяем, есть ли уже данные
        count = db.query(AppDB).count()
        if count > 0:
            logger.info("✅ Database already has data")
            return

        # Тестовые приложения
        sample_apps = [
            {
                "name": "Сбербанк Онлайн",
                "developer": "ПАО Сбербанк",
                "category": "Финансы",
                "age_rating": "6+",
                "description": "Банковское приложение для управления счетами, платежей и переводов. Оплата услуг, покупки в интернете, инвестиции и многое другое.",
                "icon_url": "/icons/sber.webp",
                "rating": 4.5,
                "version": "12.24.0",
                "size": "185 МБ",
                "price": "Бесплатно",
                "last_update": date.today(),
                "screenshots_prefix": "sber"
            },
            {
                "name": "Т-Банк",
                "developer": "Тинькофф Банк",
                "category": "Финансы",
                "age_rating": "6+",
                "description": "Мобильный банк для платежей и переводов. Управляйте счетами, картами, кредитами и инвестициями.",
                "icon_url": "/icons/tbank.webp",
                "rating": 4.7,
                "version": "5.31.0",
                "size": "210 МБ",
                "price": "Бесплатно",
                "last_update": date.today(),
                "screenshots_prefix": "tbank"
            },
            {
                "name": "ВТБ Онлайн",
                "developer": "Банк ВТБ",
                "category": "Финансы",
                "age_rating": "6+",
                "description": "Официальное мобильное приложение банка ВТБ. Полный контроль над счетами и картами в одном приложении.",
                "icon_url": "/icons/vtb.webp",
                "rating": 4.3,
                "version": "8.15.2",
                "size": "195 МБ",
                "price": "Бесплатно",
                "last_update": date.today(),
                "screenshots_prefix": "vtb"
            },
            {
                "name": "Госуслуги",
                "developer": "Минцифры России",
                "category": "Государственные",
                "age_rating": "16+",
                "description": "Портал государственных услуг. Оформление документов, запись к врачу, оплата штрафов и налогов.",
                "icon_url": "/icons/gos.webp",
                "rating": 4.4,
                "version": "4.15.2",
                "size": "320 МБ",
                "price": "Бесплатно",
                "last_update": date.today(),
                "screenshots_prefix": "gos"
            },
            {
                "name": "Авито",
                "developer": "Avito",
                "category": "Покупки",
                "age_rating": "12+",
                "description": "Доска объявлений №1 в России. Продавайте и покупайте товары, недвижимость, автомобили и услуги.",
                "icon_url": "/icons/avito.webp",
                "rating": 4.6,
                "version": "7.45.0",
                "size": "275 МБ",
                "price": "Бесплатно",
                "last_update": date.today(),
                "screenshots_prefix": "avito"
            },
            {
                "name": "OZON",
                "developer": "Ozon",
                "category": "Покупки",
                "age_rating": "12+",
                "description": "Интернет-магазин OZON. Миллионы товаров с быстрой доставкой. Электроника, одежда, продукты и многое другое.",
                "icon_url": "/icons/ozon.webp",
                "rating": 4.5,
                "version": "3.2.1",
                "size": "135 МБ",
                "price": "Бесплатно",
                "last_update": date.today(),
                "screenshots_prefix": "ozon"
            },
            {
                "name": "2ГИС",
                "developer": "ДубльГИС",
                "category": "Навигация",
                "age_rating": "0+",
                "description": "Карты и навигатор с подробной информацией о компаниях, организациях и маршрутах общественного транспорта.",
                "icon_url": "/icons/2gis.webp",
                "rating": 4.7,
                "version": "6.18.3",
                "size": "245 МБ",
                "price": "Бесплатно",
                "last_update": date.today(),
                "screenshots_prefix": "2gis"
            },
            {
                "name": "Мини Банк",
                "developer": "Mini Bank Ltd",
                "category": "Финансы",
                "age_rating": "6+",
                "description": "Удобный мобильный банк для ежедневных операций. Переводы, платежи, управление картами.",
                "icon_url": "/icons/minibank.webp",
                "rating": 4.2,
                "version": "2.8.0",
                "size": "85 МБ",
                "price": "Бесплатно",
                "last_update": date.today(),
                "screenshots_prefix": "minibank"
            },
            {
                "name": "Mail.ru",
                "developer": "VK",
                "category": "Общение",
                "age_rating": "12+",
                "description": "Почтовый клиент Mail.ru. Удобное управление электронной почтой, календарем и контактами.",
                "icon_url": "/icons/mail.webp",
                "rating": 4.8,
                "version": "14.5.1",
                "size": "165 МБ",
                "price": "Бесплатно",
                "last_update": date.today(),
                "screenshots_prefix": "mail"
            },
            {
                "name": "ВКонтакте: чаты, видео, музыка",
                "developer": "VK",
                "category": "Общение",
                "age_rating": "12+",
                "description": "ВКонтакте — это общение, бесплатные звонки, мессенджер и чат, музыка и видео, игры и мини-приложения для любых задач, десятки миллионов людей и безграничные возможности для развлечений, бизнеса и обмена новостями из любой точки мира.",
                "icon_url": "/icons/VK.webp",
                "rating": 5.0,
                "version": "8.154",
                "size": "165 МБ",
                "price": "Бесплатно",
                "last_update": date.today(),
                "screenshots_prefix": "VK"
            },
            {
                "name": "MAX:общение, звонки, сервисы",
                "developer": "Коммуникационная Платформа",
                "category": "Общение",
                "age_rating": "6+",
                "description": "MAX — новая цифровая платформа, которая объединяет в себе сервисы для решения повседневных задач и мессенджер для комфортного общения. Это быстрое и легкое приложение, где можно переписываться, звонить, отправлять стикеры, голосовые сообщения и пользоваться разными полезными сервисами. ",
                "icon_url": "/icons/MAX.webp",
                "rating": 5.0,
                "version": "25.16.0",
                "size": "90 МБ",
                "price": "Бесплатно",
                "last_update": date.today(),
                "screenshots_prefix": "MAX"
            },
            {
                "name": "VK Видео: кино, сериалы, ТВ и мультфильмы",
                "developer": "VK",
                "category": "Общение",
                "age_rating": "12+",
                "description": "Смотри кино, мультики, сериалы, ТВ онлайн, спортивные трансляции и фильмы бесплатно на всех устройствах: от смартфона до телевизора. Премьеры и блокбастеры из кинотеатров и онлайн-платформ на твоем девайсе!",
                "icon_url": "/icons/VK_Video.webp",
                "rating": 5.0,
                "version": "1.121",
                "size": "120 МБ",
                "price": "Бесплатно",
                "last_update": date.today(),
                "screenshots_prefix": "VK_Video"
            },

        ]

        # Добавляем приложения
        for app_data in sample_apps:
            screenshots_prefix = app_data.pop("screenshots_prefix")
            db_app = AppDB(**app_data)
            db.add(db_app)
            db.flush()  # Получаем ID без коммита

            # Добавляем скриншоты
            screenshots = [
                f"/screenshots/{screenshots_prefix}_1.webp",
                f"/screenshots/{screenshots_prefix}_2.webp",
                f"/screenshots/{screenshots_prefix}_3.webp"
            ]

            for screenshot_url in screenshots:
                db_screenshot = ScreenshotDB(image_url=screenshot_url, app_id=db_app.id)
                db.add(db_screenshot)

        db.commit()
        logger.info("✅ Sample data inserted")

    except Exception as e:
        db.rollback()
        logger.error(f"❌ Data seeding failed: {e}")
        raise

