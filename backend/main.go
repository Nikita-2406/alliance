package main

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"strings"

	_ "github.com/go-sql-driver/mysql"
)

// Database connection
var DB *sql.DB

// App struct
type App struct {
	ID          int      `json:"id"`
	Name        string   `json:"name"`
	Developer   string   `json:"developer"`
	Category    string   `json:"category"`
	AgeRating   string   `json:"age_rating"`
	Description string   `json:"description"`
	IconURL     string   `json:"icon_url"`
	Rating      float64  `json:"rating"`
	Version     string   `json:"version"`
	Size        string   `json:"size"`
	Price       string   `json:"price"`
	Screenshots []string `json:"screenshots"`
	LastUpdate  string   `json:"last_update"`
}

// CORS middleware
func enableCORS(w *http.ResponseWriter, r *http.Request) bool {
	// Разрешаем запросы с localhost:3000 (React)
	(*w).Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
	(*w).Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
	(*w).Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
	(*w).Header().Set("Access-Control-Allow-Credentials", "true")

	// Обрабатываем preflight OPTIONS запрос
	if r.Method == "OPTIONS" {
		(*w).WriteHeader(http.StatusOK)
		return true
	}
	return false
}

// Initialize database
func initDB() error {
	connStr := "root:SQLpassforCon5@tcp(127.0.0.1:3306)/rustore?parseTime=true"
	var err error
	DB, err = sql.Open("mysql", connStr)
	if err != nil {
		return err
	}

	err = DB.Ping()
	if err != nil {
		return err
	}

	log.Println("✅ Connected to MySQL database")
	return nil
}

// Create tables
func createTables() error {
	// Первая таблица - apps
	query1 := `
	CREATE TABLE IF NOT EXISTS apps (
		id INT AUTO_INCREMENT PRIMARY KEY,
		name VARCHAR(100) NOT NULL,
		developer VARCHAR(100) NOT NULL,
		category VARCHAR(50) NOT NULL,
		age_rating VARCHAR(10) NOT NULL,
		description TEXT NOT NULL,
		icon_url VARCHAR(255),
		rating DECIMAL(3,1) DEFAULT 0.0,
		version VARCHAR(20),
		size VARCHAR(20),
		price VARCHAR(50) DEFAULT 'Бесплатно',
		last_update DATE
	)`

	_, err := DB.Exec(query1)
	if err != nil {
		return err
	}

	// Вторая таблица - screenshots
	query2 := `
	CREATE TABLE IF NOT EXISTS screenshots (
		id INT AUTO_INCREMENT PRIMARY KEY,
		app_id INT,
		image_url VARCHAR(255) NOT NULL,
		FOREIGN KEY (app_id) REFERENCES apps(id) ON DELETE CASCADE
	)`

	_, err = DB.Exec(query2)
	if err != nil {
		return err
	}

	log.Println("✅ Database tables created")
	return nil
}

// Insert sample data
func seedData() error {
	// Check if data exists
	var count int
	err := DB.QueryRow("SELECT COUNT(*) FROM apps").Scan(&count)
	if err != nil {
		return err
	}

	if count > 0 {
		log.Println("✅ Database already has data")
		return nil
	}

	// Insert apps
	apps := []struct {
		name, developer, category, ageRating, description, iconURL, version, size, price string
		rating                                                                           float64
	}{
		{"Сбербанк Онлайн", "ПАО Сбербанк", "Финансы", "6+", "Банковское приложение для управления счетами", "/icons/sber.png", "12.24.0", "185 МБ", "Бесплатно", 4.5},
		{"Тинькофф", "Тинькофф Банк", "Финансы", "6+", "Мобильный банк для платежей и переводов", "/icons/tinkoff.png", "5.31.0", "210 МБ", "Бесплатно", 4.7},
		{"Clash Royale", "Supercell", "Игры", "0+", "Карточная стратегия в реальном времени", "/icons/clash_royale.png", "1.5.3", "285 МБ", "Бесплатно", 4.8},
		{"Госуслуги", "Энвижн Груп", "Государственные", "16+", "Портал государственных услуг", "/icons/gosuslugi.png", "4.15.2", "320 МБ", "Бесплатно", 4.3},
		{"Яндекс Go", "Яндекс", "Транспорт", "6+", "Заказ такси и доставки еды", "/icons/yandex_go.png", "7.45.0", "275 МБ", "Бесплатно", 4.6},
		{"Калькулятор+", "Tools Pro", "Инструменты", "0+", "Научный калькулятор", "/icons/calculator.png", "3.2.1", "35 МБ", "Бесплатно", 4.4},
	}

	for _, app := range apps {
		result, err := DB.Exec(
			"INSERT INTO apps (name, developer, category, age_rating, description, icon_url, rating, version, size, price, last_update) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE())",
			app.name, app.developer, app.category, app.ageRating, app.description, app.iconURL, app.rating, app.version, app.size, app.price,
		)

		if err != nil {
			return err
		}

		appID, err := result.LastInsertId()
		if err != nil {
			return err
		}

		// Insert screenshots
		screenshots := []string{"/screenshots/screenshot1.jpg", "/screenshots/screenshot2.jpg", "/screenshots/screenshot3.jpg"}
		for _, screenshot := range screenshots {
			_, err = DB.Exec("INSERT INTO screenshots (app_id, image_url) VALUES (?, ?)", appID, screenshot)
			if err != nil {
				return err
			}
		}
	}

	log.Println("✅ Sample data inserted")
	return nil
}

// Fix screenshot paths to be unique for each app
func fixScreenshotPaths() error {
	// Удаляем все текущие скриншоты
	_, err := DB.Exec("DELETE FROM screenshots")
	if err != nil {
		return err
	}

	// Добавляем уникальные пути для каждого приложения
	screenshotPaths := map[int][]string{
		1: {"/screenshots/sber_1.jpg", "/screenshots/sber_2.jpg", "/screenshots/sber_3.jpg"},
		2: {"/screenshots/tinkoff_1.jpg", "/screenshots/tinkoff_2.jpg", "/screenshots/tinkoff_3.jpg"},
		3: {"/screenshots/clash_1.jpg", "/screenshots/clash_2.jpg", "/screenshots/clash_3.jpg"},
		4: {"/screenshots/gosuslugi_1.jpg", "/screenshots/gosuslugi_2.jpg", "/screenshots/gosuslugi_3.jpg"},
		5: {"/screenshots/yandex_go_1.jpg", "/screenshots/yandex_go_2.jpg", "/screenshots/yandex_go_3.jpg"},
		6: {"/screenshots/calculator_1.jpg", "/screenshots/calculator_2.jpg", "/screenshots/calculator_3.jpg"},
	}

	for appID, paths := range screenshotPaths {
		for _, path := range paths {
			_, err = DB.Exec("INSERT INTO screenshots (app_id, image_url) VALUES (?, ?)", appID, path)
			if err != nil {
				return err
			}
		}
	}

	log.Println("✅ Screenshot paths fixed in database")
	return nil
}

// API Handlers
func getApps(w http.ResponseWriter, r *http.Request) {
	if enableCORS(&w, r) {
		return
	}
	w.Header().Set("Content-Type", "application/json")

	category := r.URL.Query().Get("category")
	var query string
	var args []interface{}

	if category != "" {
		query = "SELECT id, name, developer, category, age_rating, description, icon_url, rating, version, size, price, last_update FROM apps WHERE category = ?"
		args = append(args, category)
	} else {
		query = "SELECT id, name, developer, category, age_rating, description, icon_url, rating, version, size, price, last_update FROM apps"
	}

	rows, err := DB.Query(query, args...)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var apps []App
	for rows.Next() {
		var app App
		err := rows.Scan(&app.ID, &app.Name, &app.Developer, &app.Category, &app.AgeRating, &app.Description, &app.IconURL, &app.Rating, &app.Version, &app.Size, &app.Price, &app.LastUpdate)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		// Get screenshots
		screenshotRows, err := DB.Query("SELECT image_url FROM screenshots WHERE app_id = ?", app.ID)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		var screenshots []string
		for screenshotRows.Next() {
			var screenshot string
			err := screenshotRows.Scan(&screenshot)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			screenshots = append(screenshots, screenshot)
		}
		screenshotRows.Close()

		app.Screenshots = screenshots
		apps = append(apps, app)
	}

	json.NewEncoder(w).Encode(apps)
}

func getAppByID(w http.ResponseWriter, r *http.Request) {
	if enableCORS(&w, r) {
		return
	}
	w.Header().Set("Content-Type", "application/json")

	idStr := strings.TrimPrefix(r.URL.Path, "/api/apps/")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Invalid app ID", http.StatusBadRequest)
		return
	}

	var app App
	err = DB.QueryRow(
		"SELECT id, name, developer, category, age_rating, description, icon_url, rating, version, size, price, last_update FROM apps WHERE id = ?",
		id,
	).Scan(&app.ID, &app.Name, &app.Developer, &app.Category, &app.AgeRating, &app.Description, &app.IconURL, &app.Rating, &app.Version, &app.Size, &app.Price, &app.LastUpdate)

	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "App not found", http.StatusNotFound)
		} else {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		return
	}

	// Get screenshots
	rows, err := DB.Query("SELECT image_url FROM screenshots WHERE app_id = ?", id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var screenshots []string
	for rows.Next() {
		var screenshot string
		err := rows.Scan(&screenshot)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		screenshots = append(screenshots, screenshot)
	}

	app.Screenshots = screenshots
	json.NewEncoder(w).Encode(app)
}

func getCategories(w http.ResponseWriter, r *http.Request) {
	if enableCORS(&w, r) {
		return
	}
	w.Header().Set("Content-Type", "application/json")

	rows, err := DB.Query("SELECT DISTINCT category FROM apps")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var categories []string
	for rows.Next() {
		var category string
		err := rows.Scan(&category)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		categories = append(categories, category)
	}

	json.NewEncoder(w).Encode(categories)
}

func searchApps(w http.ResponseWriter, r *http.Request) {
	if enableCORS(&w, r) {
		return
	}
	w.Header().Set("Content-Type", "application/json")

	query := r.URL.Query().Get("q")
	var results []App

	if query != "" {
		searchQuery := "%" + strings.ToLower(query) + "%"
		rows, err := DB.Query(`
			SELECT id, name, developer, category, age_rating, description, icon_url, rating, version, size, price, last_update 
			FROM apps 
			WHERE LOWER(name) LIKE ? OR LOWER(description) LIKE ?`,
			searchQuery, searchQuery)

		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		for rows.Next() {
			var app App
			err := rows.Scan(&app.ID, &app.Name, &app.Developer, &app.Category, &app.AgeRating, &app.Description, &app.IconURL, &app.Rating, &app.Version, &app.Size, &app.Price, &app.LastUpdate)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			// Get screenshots
			screenshotRows, err := DB.Query("SELECT image_url FROM screenshots WHERE app_id = ?", app.ID)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			var screenshots []string
			for screenshotRows.Next() {
				var screenshot string
				err := screenshotRows.Scan(&screenshot)
				if err != nil {
					http.Error(w, err.Error(), http.StatusInternalServerError)
					return
				}
				screenshots = append(screenshots, screenshot)
			}
			screenshotRows.Close()

			app.Screenshots = screenshots
			results = append(results, app)
		}
	} else {
		getApps(w, r)
		return
	}

	json.NewEncoder(w).Encode(results)
}

func getFeaturedApps(w http.ResponseWriter, r *http.Request) {
	if enableCORS(&w, r) {
		return
	}
	w.Header().Set("Content-Type", "application/json")

	rows, err := DB.Query(`
		SELECT id, name, developer, category, age_rating, description, icon_url, rating, version, size, price, last_update 
		FROM apps 
		ORDER BY rating DESC 
		LIMIT 3`)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var featuredApps []App
	for rows.Next() {
		var app App
		err := rows.Scan(&app.ID, &app.Name, &app.Developer, &app.Category, &app.AgeRating, &app.Description, &app.IconURL, &app.Rating, &app.Version, &app.Size, &app.Price, &app.LastUpdate)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		// Get screenshots
		screenshotRows, err := DB.Query("SELECT image_url FROM screenshots WHERE app_id = ?", app.ID)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		var screenshots []string
		for screenshotRows.Next() {
			var screenshot string
			err := screenshotRows.Scan(&screenshot)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			screenshots = append(screenshots, screenshot)
		}
		screenshotRows.Close()

		app.Screenshots = screenshots
		featuredApps = append(featuredApps, app)
	}

	json.NewEncoder(w).Encode(featuredApps)
}

func main() {
	// Initialize database
	err := initDB()
	if err != nil {
		log.Fatal("❌ Database connection failed:", err)
	}
	defer DB.Close()

	// Create tables and seed data
	err = createTables()
	if err != nil {
		log.Fatal("❌ Table creation failed:", err)
	}

	err = seedData()
	if err != nil {
		log.Fatal("❌ Data seeding failed:", err)
	}

	// Fix screenshot paths
	err = fixScreenshotPaths()
	if err != nil {
		log.Fatal("❌ Screenshot paths fix failed:", err)
	}

	// Routes
	http.HandleFunc("/api/apps", getApps)
	http.HandleFunc("/api/apps/", getAppByID)
	http.HandleFunc("/api/categories", getCategories)
	http.HandleFunc("/api/search", searchApps)
	http.HandleFunc("/api/featured", getFeaturedApps)

	// Static files
	http.Handle("/screenshots/", http.StripPrefix("/screenshots/", http.FileServer(http.Dir("./static/screenshots"))))
	http.Handle("/icons/", http.StripPrefix("/icons/", http.FileServer(http.Dir("./static/icons"))))

	// Health check endpoint
	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		if enableCORS(&w, r) {
			return
		}
		json.NewEncoder(w).Encode(map[string]string{"status": "ok", "service": "appstore-api"})
	})

	log.Println("🚀 Server started on http://localhost:8080")
	log.Println("📱 API available:")
	log.Println("   GET /api/apps - list all apps")
	log.Println("   GET /api/apps/{id} - get app details")
	log.Println("   GET /api/categories - list categories")
	log.Println("   GET /api/apps?category=Финансы - filter by category")
	log.Println("   GET /api/search?q=банк - search apps")
	log.Println("   GET /api/featured - featured apps")
	log.Println("   GET /health - health check")

	log.Println("🌐 React frontend can connect from: http://localhost:3000")

	log.Fatal(http.ListenAndServe(":8080", nil))
}
