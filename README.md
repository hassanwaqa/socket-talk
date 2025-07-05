# Real-time Chat Application

A modern real-time chat application built with Next.js 14, TypeScript, Tailwind CSS, and Socket.IO. This frontend application includes JWT-based authentication and connects to a separate backend server for real-time messaging capabilities.

## 🚀 Features

### 🔐 Authentication
- **JWT-based Authentication**: Secure token-based authentication with 30-minute expiry
- **Built-in API Endpoints**: Internal Next.js API routes for login and token verification
- **Session Management**: Automatic token validation and refresh
- **Auto-redirect**: Automatic redirection based on session validity

### 💬 Chat Interface
- **Real-time Messaging**: Instant message delivery via Socket.IO
- **Room-based Chat**: Join specific chat rooms
- **Message History**: Persistent chat history during session
- **Responsive Design**: Works on desktop and mobile devices

### 🎨 User Interface
- **Modern Design**: Clean, intuitive interface matching the provided designs
- **Offline Mode**: Visual feedback when disconnected (greyed-out interface)
- **Interactive Elements**: Dropdown menus, hover effects, and smooth transitions
- **Message Bubbles**: Distinct styling for own vs. other users' messages

### 🔧 Navigation Features
- **Room Management**:
  - Copy room URL to clipboard
  - Change room (redirect to login)
- **User Management**:
  - Sign out (clear session and redirect)
  - Disconnect (maintain session but disconnect socket)

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time**: Socket.IO Client
- **Deployment**: Vercel-ready

## 📦 Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd socket-talk
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env.local` file in the root directory:
   ```env
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-make-it-long-and-random
   ```

4. **Configure Backend URL** (optional):
   Update the socket connection URL in `src/lib/socket.ts`:
   ```typescript
   connect(url: string = 'YOUR_BACKEND_URL'): Socket {
   ```

5. **Run the development server**:
   ```bash
   npm run dev
   ```

6. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── auth/
│   │       ├── login/
│   │       │   └── route.ts      # JWT login endpoint
│   │       └── verify/
│   │           └── route.ts      # JWT verification endpoint
│   ├── page.tsx                  # Login page
│   ├── chat/
│   │   └── page.tsx              # Chat room interface
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles
├── lib/
│   ├── session.ts                # JWT session management utilities
│   └── socket.ts                 # Socket.IO client management
└── components/                   # Reusable components (if any)
```

## 🔌 API Endpoints

### Authentication Endpoints

#### POST `/api/auth/login`
Authenticates a user and returns a JWT token.

**Request:**
```json
{
  "username": "string"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token_string",
  "user": {
    "username": "string"
  },
  "expiresAt": 1234567890000
}
```

#### POST `/api/auth/verify`
Verifies a JWT token and returns user information.

**Request:**
```json
{
  "token": "jwt_token_string"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "username": "string"
  },
  "expiresAt": 1234567890000
}
```

## 🔌 Backend Integration

This application expects a Socket.IO backend server with the following events:

### Client → Server Events
- `join-room`: Join a chat room
  ```typescript
  { roomId: string, username: string }
  ```
- `send-message`: Send a message
  ```typescript
  { roomId: string, message: Message }
  ```

### Server → Client Events
- `connect`: Connection established
- `disconnect`: Connection lost
- `message`: New message received
  ```typescript
  { id: string, username: string, content: string, timestamp: string }
  ```
- `user-joined`: User joined room
- `user-left`: User left room

## 🎯 Usage

### Login Flow
1. Enter a username on the login page
2. Click "Enter" to authenticate and receive JWT token
3. Token is stored securely and validated on each request
4. Automatically redirected to chat room

### Chat Features
1. **Send Messages**: Type in the input field and press Enter or click Send
2. **Copy Room URL**: Click the three dots → "Copy Room URL"
3. **Change Room**: Click the three dots → "Change Room"
4. **Sign Out**: Click user icon → "Sign Out"
5. **Disconnect**: Click user icon → "Disconnect"

### Session Management
- JWT tokens automatically expire after 30 minutes
- Tokens are verified on each page load
- Expired or invalid tokens redirect to login page
- Manual sign out clears token immediately

## 🔒 Security Features

### JWT Implementation
- **Secure Token Generation**: Uses industry-standard JWT with configurable secret
- **Automatic Expiration**: 30-minute token expiry with server-side validation
- **Token Verification**: Server-side verification on each request
- **Error Handling**: Proper error handling for expired/invalid tokens

### Best Practices
- Environment variables for sensitive data
- Client-side and server-side token validation
- Automatic session cleanup on expiration
- Secure token storage in localStorage

## 🎨 Design Features

### Visual States
- **Connected**: Full color interface
- **Disconnected**: Greyed-out interface with "Disconnected" indicator
- **Loading States**: Visual feedback during authentication
- **Error Handling**: User-friendly error messages

### Responsive Design
- Mobile-friendly interface
- Adaptive layout for different screen sizes
- Touch-friendly interactive elements

## 🚀 Deployment

### Vercel Deployment
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard:
   - `JWT_SECRET`: Your secure JWT signing key
4. Deploy automatically

### Environment Variables
Required environment variables:
- `JWT_SECRET`: Strong secret key for JWT signing (required)

## 🔧 Customization

### Authentication
- Modify token expiration in `src/app/api/auth/login/route.ts`
- Add additional user fields to JWT payload
- Implement password-based authentication if needed
- Add refresh token functionality

### Styling
- Modify `src/app/globals.css` for global styles
- Update Tailwind classes in components for design changes
- Customize color scheme by updating CSS classes

### Socket Events
- Add new event handlers in `src/lib/socket.ts`
- Extend the `SocketEvents` interface for type safety
- Update message handling in chat component

### Session Configuration
- Modify session duration in API routes
- Add additional session data fields as needed
- Implement different storage strategies (cookies, etc.)

## 📝 Notes

- This is a frontend application with built-in authentication API
- External backend server still needed for Socket.IO functionality
- JWT tokens are stored in localStorage (consider httpOnly cookies for production)
- Demo messages are included for UI demonstration
- Socket connection will fail without a proper backend server

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test authentication and session management
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
