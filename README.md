# Angular Chat Application

A real-time chat application built with Angular 19 and .NET 10, featuring instant messaging, video chat capabilities, and user authentication.

## Features

- 🔐 **User Authentication**: Secure registration and login with JWT tokens
- 💬 **Real-time Messaging**: Instant messaging using SignalR
- 📹 **Video Chat**: Video calling functionality
- 👥 **Online Users**: See who's online in real-time
- 📸 **Profile Images**: Upload and display user profile pictures
- ✍️ **Typing Indicators**: See when someone is typing
- 📱 **Progressive Web App**: PWA support with service workers
- 🎨 **Modern UI**: Built with Angular Material and Tailwind CSS
- 📊 **Message History**: Persistent message storage with pagination
- 🔔 **Notifications**: Audio notifications for new messages

## Tech Stack

### Frontend
- **Angular 19** - Frontend framework
- **Angular Material** - UI component library
- **Tailwind CSS** - Utility-first CSS framework
- **SignalR Client** - Real-time communication
- **RxJS** - Reactive programming
- **TypeScript** - Type-safe JavaScript

### Backend
- **.NET 10** - Backend framework
- **ASP.NET Core SignalR** - Real-time communication hub
- **Entity Framework Core** - ORM
- **SQL Server** - Database
- **JWT Bearer Authentication** - Secure authentication
- **ASP.NET Core Identity** - User management

### Infrastructure
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration

## Prerequisites

Before you begin, ensure you have the following installed:

- [.NET 10 SDK](https://dotnet.microsoft.com/download/dotnet/10.0)
- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/) (for database)
- [Angular CLI](https://angular.io/cli) (v19 or higher)

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd angular-chat-app
```

### 2. Set Up the Database

Start the SQL Server database using Docker Compose:

```bash
docker-compose up -d
```

This will start a SQL Server container on port 1433.

### 3. Configure Backend

Navigate to the API directory:

```bash
cd API
```

#### Set JWT Secret Key

You need to configure a JWT secret key. You can do this in one of two ways:

**Option 1: Using .NET User Secrets (Recommended for Development)**

```bash
dotnet user-secrets set "JWTSettings:SecretKey" "your-super-secret-key-here-minimum-32-characters"
```

**Option 2: Using Environment Variable**

Create a `.env` file in the `API` directory:

```env
JWT_SECRET_KEY=your-super-secret-key-here-minimum-32-characters
```

#### Configure Database Connection

Update the connection string in `appsettings.json` or `appsettings.Development.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost,1433;Database=ChatAppDb;User Id=sa;Password=YourStrong@Password123;TrustServerCertificate=True;"
  }
}
```

**Note**: Make sure the password matches the one in your `docker-compose.yml` file.

### 4. Set Up Frontend

Navigate to the client directory:

```bash
cd ../client
```

Install dependencies:

```bash
npm install
```

## Running the Application

### Start the Database

Make sure Docker is running, then start the database:

```bash
docker-compose up -d
```

### Start the Backend

In the `API` directory:

```bash
dotnet run
```

The API will be available at `https://localhost:5001` or `http://localhost:5000` (check `launchSettings.json` for exact ports).

### Start the Frontend

In the `client` directory:

```bash
npm start
```

Or:

```bash
ng serve
```

The application will be available at `http://localhost:4200`.

## Project Structure

```
angular-chat-app/
├── API/                          # .NET Backend
│   ├── Data/                     # Database context
│   ├── DTOs/                     # Data Transfer Objects
│   ├── Endpoints/                # API endpoints
│   ├── Hubs/                     # SignalR hubs (ChatHub, VideoChatHub)
│   ├── Models/                   # Entity models
│   ├── Services/                 # Business logic services
│   ├── Migrations/               # Database migrations
│   └── wwwroot/uploads/          # Uploaded files
├── client/                        # Angular Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── chat/             # Chat component
│   │   │   ├── components/       # Reusable components
│   │   │   ├── guards/           # Route guards
│   │   │   ├── login/            # Login component
│   │   │   ├── register/         # Registration component
│   │   │   ├── services/         # Angular services
│   │   │   └── video-chat/       # Video chat component
│   │   └── styles.css            # Global styles
│   └── public/                   # Static assets
└── docker-compose.yml            # Docker configuration
```

## API Endpoints

### Authentication

- `POST /api/account/register` - Register a new user
  - Form data: `FullName`, `Email`, `Password`, `UserName`, `ProfileImage`
  
- `POST /api/account/login` - Login user
  - Body: `{ "email": "string", "password": "string" }`
  - Returns: JWT token

- `GET /api/account/profile` - Get current user profile
  - Requires: Authentication header

### SignalR Hubs

- `/hubs/chat` - Chat hub for messaging
- `/hubs/video` - Video chat hub

## Features in Detail

### Real-time Messaging
- Send and receive messages instantly
- Message history with pagination
- Read receipts
- Typing indicators

### User Management
- User registration with profile image upload
- Secure login with JWT authentication
- Online/offline status tracking
- Unread message counts

### Video Chat
- Peer-to-peer video calling
- Real-time video communication

### Progressive Web App
- Installable on mobile and desktop
- Offline support with service workers
- Push notifications support

## Development

### Running Tests

Frontend tests:
```bash
cd client
npm test
```

### Code Formatting

Format frontend code:
```bash
cd client
npm run format
```

Check formatting:
```bash
cd client
npm run format:check
```

### Database Migrations

Create a new migration:
```bash
cd API
dotnet ef migrations add MigrationName
```

Apply migrations:
```bash
dotnet ef database update
```

Migrations are automatically applied on application startup.

## Configuration

### CORS

The backend is configured to accept requests from `http://localhost:4200` and `https://localhost:4200`. To change this, update the CORS configuration in `API/Program.cs`.

### File Uploads

Uploaded files are stored in `API/wwwroot/uploads/` and are served as static files. The maximum file size and allowed file types can be configured in the `FileUpload` service.

## Troubleshooting

### Database Connection Issues

- Ensure Docker is running
- Verify SQL Server container is up: `docker ps`
- Check connection string matches docker-compose.yml settings
- Ensure port 1433 is not blocked

### JWT Authentication Errors

- Verify JWT secret key is set correctly
- Check token expiration settings
- Ensure token is included in Authorization header: `Bearer <token>`

### SignalR Connection Issues

- Verify CORS settings allow credentials
- Check that token is passed in query string for SignalR connections
- Ensure both frontend and backend are running

## License

This project is open source and available under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

