# Bumi Niaga Agrochem — Website E-Commerce Pertanian

Website penjualan produk pertanian (pupuk, pestisida, benih) untuk petani Indonesia.

## Tech Stack

| Layer | Teknologi |
|---|---|
| Frontend | React + TypeScript + Vite + TailwindCSS |
| Backend | Java Spring Boot 3.3 (Microservices) |
| Database | PostgreSQL 15 |
| Payment | Midtrans (QRIS, GoPay, VA Bank, dll) |
| Storage | AWS S3 + CloudFront |
| Deployment | Docker + k3s (Kubernetes) di AWS EC2 |

## Struktur Project

```
buminiagaargo/
├── backend/
│   ├── api-gateway/      # Port 8080 - Routing + JWT validation
│   ├── user-service/     # Port 8081 - Auth, register, login
│   ├── product-service/  # Port 8082 - Katalog produk + S3 upload
│   ├── order-service/    # Port 8083 - Pesanan + dashboard admin
│   └── payment-service/  # Port 8084 - Midtrans integration
├── frontend/             # React SPA
└── infrastructure/
    ├── k8s/              # Kubernetes manifests
    └── scripts/          # Setup & deploy scripts
```

## Menjalankan Secara Lokal

### Prasyarat
- Java 21+, Maven 3.9+
- Node.js 20+
- Docker + Docker Compose
- (Opsional) AWS credentials untuk S3

### 1. Setup environment variables

```bash
cp .env.production.example .env
# Edit .env dengan nilai yang sesuai
```

### 2. Jalankan semua service

```bash
# Build dan jalankan PostgreSQL + semua backend service
docker compose up --build

# Atau jalankan hanya database dulu, lalu backend satu per satu
docker compose up postgres -d
cd backend/user-service && mvn spring-boot:run
```

### 3. Jalankan frontend

### 4. Inisialisasi database

Database otomatis diinisialisasi saat container postgres pertama kali berjalan via `db-init.sql`.

**Akun admin default:**
- Email: `admin@buminiagaagrochem.id`
- Password: `Admin@12345`
- ⚠️ Ganti password ini setelah pertama kali login!

## API Endpoints

Semua request melalui api-gateway di `http://localhost:8080`:

```
POST /api/auth/register      - Daftar
POST /api/auth/login         - Login
GET  /api/products           - Daftar produk (publik)
GET  /api/products/:slug     - Detail produk (publik)
GET  /api/categories         - Daftar kategori (publik)
POST /api/orders             - Buat pesanan (login required)
POST /api/payments           - Buat pembayaran Midtrans
POST /api/payments/webhook   - Midtrans webhook callback
GET  /api/admin/dashboard/summary - Dashboard admin
```

## Deployment ke AWS

### Prerequisites
- AWS account dengan Free Tier aktif
- Domain (contoh: buminiagaagrochem.id)
- Akun Midtrans (sandbox untuk testing, production untuk live)

### Langkah-langkah

1. **Setup AWS:** Launch EC2 t2.micro (Ubuntu 22.04), RDS db.t3.micro PostgreSQL, S3 bucket
2. **Install k3s:** `bash infrastructure/scripts/setup-ec2.sh`
3. **Setup secrets:** `kubectl create secret generic app-secrets --from-env-file=.env -n buminiaga`
4. **Apply manifests:** `kubectl apply -f infrastructure/k8s/ -n buminiaga`
5. **Deploy frontend:** Build dan upload ke S3, konfigurasikan CloudFront
6. **Setup DNS:** Arahkan `api.buminiagaagrochem.id` ke Elastic IP EC2

### Deploy backend service

```bash
./infrastructure/scripts/deploy.sh user-service
./infrastructure/scripts/deploy.sh product-service
./infrastructure/scripts/deploy.sh order-service
./infrastructure/scripts/deploy.sh payment-service
./infrastructure/scripts/deploy.sh api-gateway
```

## Warna Brand

| Warna | Hex | Penggunaan |
|---|---|---|
| Hijau (Primary) | `#16a34a` | Tombol utama, aksen |
| Biru (Secondary) | `#2563eb` | Tombol sekunder, link |
| Putih | `#ffffff` | Background |

## Pembayaran (Midtrans)

- **Sandbox testing:** Daftar di https://sandbox.midtrans.com
- **Test card:** `4811 1111 1111 1114` (Visa)
- **Production:** Daftar KYC di https://dashboard.midtrans.com (butuh NPWP + NIB)
- **Webhook URL:** `https://api.buminiagaagrochem.id/api/payments/webhook`
