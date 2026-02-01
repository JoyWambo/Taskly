# Taskly – Task Management Application

> A full-stack task management platform built with the MERN stack (MongoDB, Express.js, React, Node.js).

Taskly is designed to help users organize, track, and manage their daily tasks efficiently. Users can create secure accounts, manage personal task lists, and monitor productivity through an intuitive and responsive interface.

---

## Features

- **User Authentication** – Secure registration and login using JWT
- **Task Management** – Create, read, update, and delete tasks
- **Deadline Tracking** – Set and monitor task deadlines
- **Progress Tracking** – Track task status (Pending, In Progress, Completed)
- **Search & Filter** – Filter tasks by status and search by title or description
- **Task Sorting** – Sort tasks by deadline, priority, or status
- **Personalized Lists** – Each user has a private and secure task list
- **Responsive Design** – Optimized for desktop, tablet, and mobile devices
- **Secure API** – Protected endpoints using authentication middleware

---

## Technology Stack

### Frontend

- **React** – User interface library
- **React Router** – Client-side routing
- **Axios** – HTTP client for API requests
- **CSS3 / Tailwind** – Styling and responsive layout

### Backend

- **Node.js** – JavaScript runtime
- **Express.js** – Web application framework
- **MongoDB** – NoSQL database
- **Mongoose** – MongoDB object modeling
- **JWT** – Authentication and authorization
- **bcryptjs** – Password hashing
- **dotenv** – Environment variable management

### Development Tools

- **Nodemon** – Auto-restart development server
- **Concurrently** – Run frontend and backend together
- **Multer** – File upload handling

---

## Project Structure

```
task-management-app/
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── config/
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── utils/
│   │   └── App.js
│   └── public/
├── package.json
└── README.md
```

---

## Installation & Setup

### Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account or local MongoDB installation
- Git

### Environment Variables

Create a `.env` file in the root directory:

```env
NODE_ENV=development
PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

### Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

---

## Usage

### Development Mode

```bash
# Run frontend and backend concurrently
npm run dev

# Run backend only
npm run server

# Run frontend only
npm run client
```

### Production Build

```bash
# Build frontend
npm run build

# Start production server
npm start
```

### Database Seeding

```bash
# Import sample data
npm run data:import

# Remove all data
npm run data:destroy
```

---

## API Endpoints

### Authentication

- `POST /api/auth/register` – Register a new user
- `POST /api/auth/login` – User login
- `POST /api/auth/logout` – User logout

### Tasks

- `GET /api/tasks` – Get all user tasks
- `POST /api/tasks` – Create a new task
- `GET /api/tasks/:id` – Get a specific task
- `PUT /api/tasks/:id` – Update a task
- `DELETE /api/tasks/:id` – Delete a task

### Users

- `GET /api/users/profile` – Get user profile
- `PUT /api/users/profile` – Update user profile

---

## Development Phases

### Phase 1: Project Setup & Backend Configuration

- Initialize Node.js project
- Set up Express.js server
- Configure MongoDB connection
- Create base project structure

### Phase 2: Authentication & Authorization

- Implement user registration and login
- JWT token generation and verification
- Password hashing with bcryptjs
- Protected route middleware

### Phase 3: Task Creation & Listing

- Create task schema and model
- Implement CRUD operations
- Build task listing UI
- Connect frontend to backend APIs

### Phase 4: Task Update & Deletion

- Task editing functionality
- Task deletion with confirmation
- Real-time UI updates
- Error handling and validation

### Phase 5: Filtering & Sorting

- Status-based filtering
- Search functionality
- Sorting by date and priority
- UI improvements

### Phase 6: Deployment & Finalization

- Production environment setup
- Application deployment
- Performance optimization
- Final testing and bug fixes

---

## Sample Task Object

```javascript
{
  title: "Complete project documentation",
  description: "Write comprehensive README and API documentation",
  deadline: "2024-01-30",
  status: "in-progress",
  priority: "high",
  user: "user_id_here"
}
```

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## Future Enhancements

- Calendar view for tasks
- Task categories and tags
- Team collaboration features
- Email notifications for deadlines
- Productivity analytics
- Dark mode support
- Mobile application

---

## License

This project is licensed under the ISC License. See the `LICENSE` file for details.

---

## Acknowledgments

- Built as part of MERN stack development coursework
- Inspired by popular task management tools
- Thanks to the open-source community

---

**Last updated: January 2026**

---

If you want, I can also:

- Rename it to **Taskly** (to match your earlier project name)
- Make it **ATS / instructor-friendly**
- Shorten it for **GitHub submission**
- Convert it into a **project proposal format**

Just tell me.
