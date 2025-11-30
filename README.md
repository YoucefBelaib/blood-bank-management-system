# Blood Bank Management System

A modern, full-stack web application for managing blood bank operations, donor registrations, and blood requests. Built with React, Express, TypeScript, and PostgreSQL.

## 🩸 Features

### For Donors
- **User Registration & Login**: Secure authentication with role-based access control
- **Donor Profile Management**: Register and manage donor information including blood type, location, and contact details
- **Donation Dashboard**: Track donation history and upcoming donation opportunities
- **Blood Request Access**: View and respond to blood requests from hospitals

### For Admins
- **Comprehensive Dashboard**: Real-time overview of blood inventory, active donors, and partner hospitals
- **Blood Inventory Management**: Track blood units by type, update stock levels, and manage inventory status
- **Donor Approvals**: Review and approve pending donor registrations
- **Request Management**: Monitor and manage blood requests from hospitals with urgency levels
- **Statistical Insights**: View key metrics including total donors, blood units, and partner hospitals
- **Activity Logging**: Track all inventory changes and administrative actions

### For Hospitals
- **Blood Request Submission**: Submit urgent blood requests with specific blood types and quantities
- **Real-time Status Updates**: Monitor request status and processing time
- **Hospital Registration**: Register as a partner hospital in the system

## 📋 Tech Stack

### Frontend
- **React 18** - UI library with hooks
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool
- **TailwindCSS** - Utility-first styling
- **Shadcn/ui** - Accessible component library
- **React Query (TanStack Query)** - Data fetching and caching
- **Framer Motion** - Smooth animations
- **Wouter** - Client-side routing
- **React Hook Form** - Efficient form handling

### Backend
- **Express.js** - Node.js web framework
- **TypeScript** - Type-safe backend
- **Drizzle ORM** - Type-safe database ORM
- **PostgreSQL** - Relational database
- **Zod** - Schema validation
- **bcrypt** - Password hashing
- **Cookie Parser** - Session management

### Database
- **PostgreSQL** with Neon serverless
- **Drizzle Kit** - Database migrations and management

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- PostgreSQL database (or Neon account for serverless)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YoucefBelaib/blood-bank-management-system.git
   cd blood-bank-management-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   # Database
   DATABASE_URL=your_postgresql_connection_string

   # Server
   NODE_ENV=development
   PORT=5000
   ```

4. **Push database schema**
   ```bash
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5173`

## 📁 Project Structure

```
blood-bank-management-system/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable React components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utilities and helpers
│   │   └── index.css      # Global styles
│   └── index.html         # Entry HTML
├── server/                # Express backend
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Database operations
│   └── seed.ts            # Database seeding
├── shared/                # Shared types and schemas
│   └── schema.ts          # Drizzle schemas and Zod validators
├── package.json           # Project dependencies
├── vite.config.ts         # Vite configuration
├── tsconfig.json          # TypeScript configuration
└── drizzle.config.ts      # Drizzle ORM configuration
```

## 🗂️ Database Schema

### Core Tables
- **users**: User authentication and roles (admin, donor)
- **donors**: Donor profile information and approval status
- **blood_inventory**: Blood stock levels by type
- **blood_requests**: Blood requests from hospitals
- **hospitals**: Hospital partner information
- **sessions**: User session tokens
- **inventory_logs**: Audit trail of inventory changes
- **statistics**: System-wide metrics

## 🔐 Authentication & Authorization

The application uses cookie-based session authentication with role-based access control:

- **Donor**: Can view their profile, donate blood, and submit requests
- **Admin**: Full access to inventory management, approvals, and statistics
- **Authentication Token**: Stored securely in HTTP-only cookies

## 🛠️ Available Scripts

```bash
# Development
npm run dev          # Start development server with hot reload

# Building
npm run build        # Build for production (client + server)
npm run check        # Type check with TypeScript

# Production
npm start            # Start production server

# Database
npm run db:push      # Push schema changes to database
```

## 📱 Key Pages

| Page | Route | Role | Description |
|------|-------|------|-------------|
| Home | `/` | Public | Landing page with statistics |
| Login | `/login` | Public | User authentication |
| Signup | `/signup` | Public | New user registration |
| Donor Dashboard | `/donor-dashboard` | Donor | Donor profile and activities |
| Admin Dashboard | `/admin` | Admin | Complete system management |
| Donate Blood | `/donate` | Donor | Submit donation |
| Request Blood | `/request` | Public | Submit blood request |
| About | `/about` | Public | About the organization |

## 🎨 UI Components

The application uses customizable Shadcn/ui components including:
- Buttons, Cards, Dialogs
- Forms with React Hook Form integration
- Tables for data display
- Alerts and Notifications
- Navigation components
- And many more accessible components

## 🔄 Data Flow

1. **Client** sends requests via React Query
2. **Express Server** validates requests with Zod schemas
3. **Drizzle ORM** handles database operations
4. **PostgreSQL** stores and retrieves data
5. **Response** is returned to client and cached by React Query

## 🔒 Security Features

- Password hashing with bcrypt
- Secure session management with tokens
- Role-based access control (RBAC)
- Input validation with Zod schemas
- HTTP-only cookies for session storage
- TypeScript for type safety

## 🚢 Deployment

### Building for Production
```bash
npm run build
```

This creates:
- Client build in `dist/` directory
- Server bundle for Node.js execution

### Running Production Build
```bash
npm start
```

## 📝 Environment Variables

### Required
- `DATABASE_URL` - PostgreSQL connection string

### Optional
- `NODE_ENV` - Set to `production` for production deployments
- `PORT` - Server port (default: 5000)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Author

**Youcef Belaib**

## 📞 Support

For issues, questions, or suggestions, please open an issue on the GitHub repository.

---

**Made with ❤️ to save lives through better blood bank management**
