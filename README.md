# MyFee - Zero-Interest EMI Platform

This is a [T3 Stack](https://create.t3.gg/) project for managing zero-interest EMI solutions for educational fees, featuring multi-tenant organization support with Better Auth.

## 🚀 Features

- **Multi-tenant Organization System** - Support for multiple institutions
- **Role-based Access Control** - Institution admins and parents with different permissions
- **Zero-Interest EMI Plans** - Flexible payment options for educational fees
- **Real-time Dashboard** - Separate dashboards for institutions and parents
- **Fee Management** - Complete fee structure and application tracking

## 🔐 Demo Credentials

### Institution Admin Dashboard
- **Email**: `admin@school.edu`
- **Password**: `admin123`
- **Access**: Manage fee applications, approve/reject EMI plans, view all students

### Parent Dashboard  
- **Email**: `parent@example.com`
- **Password**: `parent123`
- **Access**: Apply for EMI plans, track applications, manage student fees

## 🛠️ Tech Stack

- **Frontend**: [Next.js](https://nextjs.org) 15 with App Router
- **Authentication**: [Better Auth](https://better-auth.com) with Organizations plugin
- **Database**: [Drizzle ORM](https://orm.drizzle.team) with PostgreSQL
- **Styling**: [Tailwind CSS](https://tailwindcss.com)
- **API**: [tRPC](https://trpc.io)
- **UI Components**: Custom components with Radix UI

## 🚦 Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd t3_stack_better_auth-main
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Fill in your database URL and other required environment variables.

4. **Set up the database**
   ```bash
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Visit the application**
   Open [http://localhost:3002](http://localhost:3002) and use the demo credentials above.
   (Note: The port may vary if 3000 is already in use)

## 📱 Usage

### For Institution Admins
1. Sign in with admin credentials
2. View all pending fee applications from parents
3. Approve or reject EMI plans
4. Track student payment status
5. Manage fee structures and EMI options

### For Parents
1. Sign in with parent credentials  
2. View your students and their fees
3. Apply for EMI plans (3, 6, or 12 months)
4. Track application status
5. View approved EMI schedules

## Learn More

To learn more about the [T3 Stack](https://create.t3.gg/), take a look at the following resources:

- [Documentation](https://create.t3.gg/)
- [Learn the T3 Stack](https://create.t3.gg/en/faq#what-learning-resources-are-currently-available) — Check out these awesome tutorials

You can check out the [create-t3-app GitHub repository](https://github.com/t3-oss/create-t3-app) — your feedback and contributions are welcome!

## How do I deploy this?

Follow our deployment guides for [Vercel](https://create.t3.gg/en/deployment/vercel), [Netlify](https://create.t3.gg/en/deployment/netlify) and [Docker](https://create.t3.gg/en/deployment/docker) for more information.
