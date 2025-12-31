# Angular Chat Application

A real-time chat application built with Angular 19 and .NET 10, featuring instant messaging, video chat, voice calls, and comprehensive call history.

## Features

- 🔐 **User Authentication**: Secure registration and login with JWT tokens
- 💬 **Real-time Messaging**: Instant messaging using SignalR
- 📹 **Video Calls**: High-quality video calling with peer-to-peer WebRTC
- 📞 **Voice Calls**: Audio-only calling for when video isn't needed
- 📋 **Call History**: Complete history of all calls with status, duration, and timestamps
- 👥 **Online Users**: See who's online in real-time
- 📸 **Profile Images**: Upload and display user profile pictures
- ✍️ **Typing Indicators**: See when someone is typing
- 📱 **Progressive Web App**: PWA support with service workers
- 🎨 **Modern UI**: Built with Angular Material and Tailwind CSS
- 📊 **Message History**: Persistent message storage with pagination
- 🔔 **Notifications**: Audio notifications for new messages and incoming calls

## Tech Stack

### Frontend
- **Angular 19** - Frontend framework
- **Angular Material** - UI component library
- **Tailwind CSS** - Utility-first CSS framework
- **SignalR Client** - Real-time communication
- **WebRTC** - Peer-to-peer video/voice communication
- **RxJS** - Reactive programming
- **TypeScript** - Type-safe JavaScript

### Backend
- **.NET 10** - Backend framework
- **ASP.NET Core SignalR** - Real-time communication hub
- **Entity Framework Core** - ORM
- **SQLite** - Database (can be configured for SQL Server)
- **JWT Bearer Authentication** - Secure authentication
- **ASP.NET Core Identity** - User management

### Infrastructure
- **Docker** - Containerization (for SQL Server option)
- **Docker Compose** - Multi-container orchestration

## Prerequisites

Before you begin, ensure you have the following installed:

- [.NET 10 SDK](https://dotnet.microsoft.com/download/dotnet/10.0)
- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/) (optional, for SQL Server)
- [Angular CLI](https://angular.io/cli) (v19 or higher)

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd angular-chat-app
```

### 2. Set Up the Database

The application uses SQLite by default, which requires no additional setup. If you prefer SQL Server, you can use Docker Compose:

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

#### Configure Database Connection (Optional - for SQL Server)

If using SQL Server, update the connection string in `appsettings.json` or `appsettings.Development.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost,1433;Database=ChatAppDb;User Id=sa;Password=YourStrong@Password123;TrustServerCertificate=True;"
  }
}
```

**Note**: Make sure the password matches the one in your `docker-compose.yml` file.

### 4. Apply Database Migrations

Run the database migrations to create all necessary tables:

```bash
cd API
dotnet ef database update
```

This will create the following tables:
- `AspNetUsers` - User accounts
- `Messages` - Chat messages
- `CallHistories` - Call history records

### 5. Set Up Frontend

Navigate to the client directory:

```bash
cd ../client
```

Install dependencies:

```bash
npm install
```

## Running the Application

### Start the Database (Optional - only if using SQL Server)

Make sure Docker is running, then start the database:

```bash
docker-compose up -d
```

### Start the Backend

In the `API` directory:

```bash
dotnet run
```

Or with hot reload:

```bash
dotnet watch run
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
│   │   ├── AccountEndpoint.cs    # Authentication endpoints
│   │   └── CallHistoryEndpoint.cs # Call history endpoints
│   ├── Hubs/                     # SignalR hubs
│   │   ├── ChatHub.cs            # Chat messaging hub
│   │   └── VideoChatHub.cs       # Video/voice call hub
│   ├── Models/                   # Entity models
│   │   ├── AppUser.cs
│   │   ├── Message.cs
│   │   └── CallHistory.cs
│   ├── Services/                 # Business logic services
│   │   ├── TokenService.cs
│   │   ├── FileUpload.cs
│   │   └── CallHistoryService.cs
│   ├── Migrations/               # Database migrations
│   └── wwwroot/uploads/         # Uploaded files
├── client/                       # Angular Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── chat/             # Chat component
│   │   │   ├── components/       # Reusable components
│   │   │   │   ├── chat-box/     # Message display
│   │   │   │   ├── chat-sidebar/ # User list
│   │   │   │   ├── chat-window/  # Chat interface
│   │   │   │   └── call-history/ # Call history component
│   │   │   ├── guards/           # Route guards
│   │   │   ├── login/            # Login component
│   │   │   ├── register/         # Registration component
│   │   │   ├── services/         # Angular services
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── chat.service.ts
│   │   │   │   ├── video-chat.service.ts
│   │   │   │   └── call-history.service.ts
│   │   │   └── video-chat/       # Video/voice call component
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

### Call History

- `GET /api/call-history` - Get all call history for current user
  - Returns: List of call history records
  - Requires: Authentication header

- `GET /api/call-history/{userId}` - Get call history with specific user
  - Returns: List of call history records between current user and specified user
  - Requires: Authentication header

### SignalR Hubs

- `/hubs/chat` - Chat hub for messaging
  - Events: `ReceiveMessage`, `RecieveMessageList`, `OnlineUsers`, `NotifyTypingToUser`
  
- `/hubs/video` - Video/voice chat hub
  - Events: `ReceiveOffer`, `ReceiveAnswer`, `ReceiveIceCandidate`, `CallEnded`, `CallDeclined`

## Features in Detail

### Real-time Messaging
- Send and receive messages instantly
- Message history with pagination (loads 10 messages at a time)
- Read receipts
- Typing indicators
- Unread message counts

### Video Calls
- High-quality peer-to-peer video calling
- Local and remote video streams
- WebRTC-based communication
- Automatic connection management
- Call controls (start, end)

### Voice Calls
- Audio-only calling option
- Lower bandwidth usage
- Same WebRTC infrastructure as video calls
- Call controls (start, end)
- Visual call interface with phone icon

### Call History
- Complete record of all calls (video and voice)
- Call status tracking:
  - **Completed**: Successfully connected calls
  - **Declined**: Calls that were declined
  - **Missed**: Calls that weren't answered
  - **Cancelled**: Calls that were cancelled
- Call duration tracking
- Incoming/outgoing call indicators
- Filter by user
- Accessible from sidebar menu (three dots → Call History)

### User Management
- User registration with profile image upload
- Secure login with JWT authentication
- Online/offline status tracking
- Unread message counts
- User search functionality

### Progressive Web App
- Installable on mobile and desktop
- Offline support with service workers
- Push notifications support
- App-like experience

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

### Hot Reload

The backend supports hot reload with `dotnet watch run`, which automatically restarts the server when code changes are detected.

## Configuration

### CORS

The backend is configured to accept requests from `http://localhost:4200` and `https://localhost:4200`. To change this, update the CORS configuration in `API/Program.cs`.

### File Uploads

Uploaded files are stored in `API/wwwroot/uploads/` and are served as static files. The maximum file size and allowed file types can be configured in the `FileUpload` service.

### WebRTC Configuration

The application uses STUN servers for NAT traversal:
- `stun:stun.l.google.com:19302`
- `stun:stun.services.mozilla.com`

For production, you may want to configure TURN servers for better connectivity behind restrictive firewalls.

## Usage Guide

### Making a Call

1. Open a chat with the user you want to call
2. Click the **phone icon** (📞) for a voice call or **video icon** (📹) for a video call
3. Wait for the other user to accept
4. Once connected, use the controls to manage the call

### Receiving a Call

1. When a call comes in, a dialog will appear with Accept/Decline buttons
2. Click **Accept** to answer or **Decline** to reject
3. The ringing tone will play (if browser allows)

### Viewing Call History

1. Click the three dots (⋮) in the sidebar
2. Select **Call History**
3. View all your past calls with details:
   - Call type (video/voice)
   - Call status
   - Duration
   - Timestamp
   - Incoming/outgoing indicator

### Sending Messages

1. Select a user from the sidebar
2. Type your message in the input field
3. Press Enter or click the send icon
4. Messages are delivered instantly

## Troubleshooting

### Database Connection Issues

- Ensure SQLite database file exists (created automatically on first run)
- For SQL Server: Verify Docker is running
- Check connection string matches your configuration
- Ensure port 1433 is not blocked (for SQL Server)

### JWT Authentication Errors

- Verify JWT secret key is set correctly
- Check token expiration settings
- Ensure token is included in Authorization header: `Bearer <token>`
- Verify token format in SignalR query string for hubs

### SignalR Connection Issues

- Verify CORS settings allow credentials
- Check that token is passed in query string for SignalR connections
- Ensure both frontend and backend are running
- Check browser console for connection errors

### WebRTC/Call Issues

- Ensure microphone and camera permissions are granted
- Check browser console for WebRTC errors
- Verify STUN servers are accessible
- For voice calls, ensure audio permissions are granted
- If calls don't connect, check firewall/NAT settings

### Call History Not Saving

- Verify database migrations are applied
- Check that `CallHistories` table exists
- Ensure user IDs are valid
- Check backend logs for database errors

## License

This project is open source and available under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Future Enhancements

Potential features for future development:
- Group calls (multiple participants)
- Screen sharing
- File sharing in chat
- Message reactions
- Message search
- Call recording
- Push notifications for calls
- Mobile app versions

