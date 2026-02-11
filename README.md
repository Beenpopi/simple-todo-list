# Simple Todo List

A simple and elegant to-do list web application built with Node.js, Express, and vanilla JavaScript. The application stores todos in a JSON file and can be easily deployed on Vercel.

![Todo List App](https://github.com/user-attachments/assets/9847f4aa-1978-43d6-98c7-ee3e1e43ae8c)

## Features

- ✅ Add new todos
- ✅ Mark todos as complete/incomplete
- ✅ Delete todos
- ✅ Persistent storage using JSON file
- ✅ Beautiful gradient UI design
- ✅ Real-time statistics (total and completed counts)
- ✅ Responsive design

## Tech Stack

- **Backend**: Node.js with Express
- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **Storage**: JSON file
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/cragkhit/simple-todo-list.git
cd simple-todo-list
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

4. Open your browser and navigate to:
```
http://localhost:3000
```

Or simply connect your GitHub repository to Vercel and it will automatically deploy.

## API Endpoints

- `GET /api/todos` - Get all todos
- `POST /api/todos` - Create a new todo
  - Body: `{ "text": "Todo text" }`
- `PUT /api/todos/:id` - Toggle todo completion status
- `DELETE /api/todos/:id` - Delete a todo

## Project Structure

```
simple-todo-list/
├── index.js           # Express server and API routes
├── package.json       # Project dependencies
├── todos.json         # JSON file for storing todos (auto-generated)
└── public/
    ├── index.html     # Main HTML file
    ├── style.css      # Styles
    └── app.js         # Frontend JavaScript
```

## License

MIT
