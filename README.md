
---

### **Social Media Backend**


# Social Media Backend

Welcome to the **Social Media Backend**! This is the backend API for the **Social Media Full Stack App**. It is built with **Node.js** and **Express.js**, and uses **PostgreSQL** for storing user data, posts, and other social features.

## 🛠️ **Technologies Used**

- **Node.js** – A JavaScript runtime for the server.
- **Express.js** – A web framework for Node.js.
- **PostgreSQL** – Relational database for storing user data and posts.
- **Sequelize** – SQL ORM for Node.js with PostgreSQL support.
- **JWT (JSON Web Token)** – For user authentication and authorization.
- **Bcrypt.js** – For hashing user passwords.
- **Multer** – For handling file uploads (profile pictures, post images).
- **Helmet** – For security headers and CORS configuration.

## 🚀 **Features**

- **User Authentication**: Secure login and registration with JWT.
- **Post Management**: Create, view, update, and delete posts.
- **User Profile**: Store and update user profile information.
- **Follow/Unfollow System**: Users can follow and unfollow each other.
- **Like/Unlike Posts**: Interactive engagement with posts.
- **Timeline Feed**: View posts from followed users.
- **Image Upload**: Profile pictures, cover photos, and post images.
- **CORS Support**: Configured to accept requests from the frontend.

## 📦 **Installation & Setup**

### Prerequisites
- **Node.js** (v14 or higher)
- **PostgreSQL** (v12 or higher)
- **npm** or **yarn**

### 1. Install PostgreSQL
Download and install from: https://www.postgresql.org/download/

### 2. Create Database
```sql
psql -U postgres
CREATE DATABASE socialmedia_db;
\q
```

### 3. Install Dependencies
```bash
cd Social-Media-Backend
npm install
```

### 4. Configure Environment Variables
Create a `.env` file:
```env
DB_NAME=socialmedia_db
DB_USER=postgres
DB_PASSWORD=your_password_here
DB_HOST=localhost
DB_PORT=5432

PORT=8800
JWT_SECRET=your_jwt_secret_key
```

### 5. Run the Server
```bash
npm start
```

Expected output:
```
✅ PostgreSQL connection established successfully
✅ Database synchronized successfully
Server is running on port 8800
```

## 📚 **API Endpoints**

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users?userId=1` - Get user by ID
- `GET /api/users?username=john` - Get user by username
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `PUT /api/users/:id/follow` - Follow user
- `PUT /api/users/:id/unfollow` - Unfollow user
- `GET /api/users/friends/:userId` - Get user's friends

### Posts
- `POST /api/posts` - Create post
- `GET /api/posts/:id` - Get post by ID
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `PUT /api/posts/:id/like` - Like/unlike post
- `GET /api/posts/timeline/all/:userId` - Get timeline feed
- `GET /api/posts/profile/:username` - Get user's posts

### File Upload
- `POST /api/upload` - Upload image (profile/post)

## 🗄️ **Database Schema**

### Users Table
- `id` - INTEGER (Primary Key, Auto Increment)
- `username` - VARCHAR(20) UNIQUE
- `email` - VARCHAR(50) UNIQUE
- `password` - VARCHAR (hashed)
- `profilePicture` - VARCHAR
- `coverPicture` - VARCHAR
- `followers` - INTEGER[] (array)
- `followings` - INTEGER[] (array)
- `isAdmin` - BOOLEAN
- `desc` - VARCHAR(50)
- `createdAt` - TIMESTAMP
- `updatedAt` - TIMESTAMP

### Posts Table
- `id` - INTEGER (Primary Key, Auto Increment)
- `userId` - INTEGER (Foreign Key → users.id)
- `desc` - TEXT
- `img` - VARCHAR
- `likes` - INTEGER[] (array)
- `dislikes` - INTEGER[] (array)
- `comments` - JSON[] (array)
- `createdAt` - TIMESTAMP
- `updatedAt` - TIMESTAMP

## 📖 **Documentation**

For detailed migration and setup information, see:
- `POSTGRES_MIGRATION_GUIDE.md` - Complete migration guide
- `POSTGRESQL_SETUP_INSTRUCTIONS.md` - Setup and troubleshooting
- `SEQUELIZE_QUICK_REFERENCE.md` - Query reference
- `BEFORE_AFTER_COMPARISON.md` - Code comparisons
- `MIGRATION_COMPLETE.md` - Migration summary

## 🌐 **Live Demo**

Frontend: https://social-med-007.netlify.app

## 🔒 **Security Features**

- Password hashing with bcrypt (10 salt rounds)
- JWT token-based authentication
- Helmet security headers
- CORS configuration
- SQL injection prevention via Sequelize
- Foreign key constraints

## 🚀 **Deployment**

### Render / Heroku
1. Add PostgreSQL database service
2. Set environment variables (DATABASE_URL)
3. Deploy from GitHub repository

### Environment Variables for Production
```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
PORT=8800
JWT_SECRET=secure_random_string
```

## 📝 **Migration from MongoDB**

This project was recently migrated from MongoDB to PostgreSQL for:
- ✅ Better performance on complex queries
- ✅ ACID compliance and data integrity
- ✅ Foreign key relationships
- ✅ Industry-standard SQL database

See `POSTGRES_MIGRATION_GUIDE.md` for details.

## 🤝 **Contributing**

Feel free to fork this repository and submit pull requests!

## 📄 **License**

MIT License

---

**Built with ❤️ using Node.js, Express, and PostgreSQL**
