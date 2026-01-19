# CookMind AI

**Transform your pantry into perfect recipes with AI**

CookMind AI is a revolutionary recipe management application that helps you reduce food waste by intelligently matching recipes to your available ingredients. Powered by AI, it adapts recipes to your preferences and guides you through cooking with step-by-step instructions.

## 🎯 Overview

CookMind AI solves the common problem of not knowing what to cook with the ingredients you have. The app allows you to:

- **Track your inventory** - Keep track of what's in your pantry and fridge
- **Find matching recipes** - Discover recipes based on your available ingredients
- **AI-powered adaptations** - Customize recipes to be vegetarian, healthier, faster, or adjusted for more servings
- **Guided cooking mode** - Follow step-by-step instructions with built-in timers
- **Barcode scanning** - Quickly add products by scanning barcodes
- **Basic inventory** - Mark common items (salt, pepper, etc.) as always available

## ✨ Features

### Inventory Management
- Add products manually or via barcode scanning
- Track quantities, units, and expiry dates
- Search and sort inventory items
- Set up a basic inventory of always-available items (salt, pepper, oil, etc.)
- Product tagging with ingredient tags for smart matching

### Recipe Discovery
- Browse a curated collection of recipes
- View recipe details with ingredients and instructions
- Adjust serving sizes dynamically
- See which ingredients you have and which are missing
- Match percentage showing how well recipes match your inventory

### AI Recipe Adaptation
- Request recipe modifications (e.g., "make it vegetarian", "make it healthier")
- AI adapts the complete recipe including ingredients and instructions
- Save adapted recipes for future use
- Visual indicator for AI-adapted recipes

### Cooking Mode
- Step-by-step cooking instructions
- Built-in timers for cooking steps
- Progress tracking
- Easy navigation between steps

### User Management
- Email-based authentication
- Email verification
- Password reset functionality
- User profiles with statistics
- Account management (name change, password change, account deletion)

## 🛠️ Tech Stack

### Frontend
- **Next.js 16.1.2** - React framework with App Router
- **React 19.2.3** - UI library
- **TypeScript 5** - Type safety
- **Tailwind CSS 4** - Styling
- **Framer Motion** - Animations

### Backend
- **Supabase** - Backend as a Service
  - Authentication
  - PostgreSQL database
  - Row Level Security (RLS)
- **Anthropic Claude API** - AI recipe adaptation
- **Open Food Facts API** - Product data via barcode

### Libraries
- **html5-qrcode** - Barcode scanning
- **@supabase/ssr** - Supabase server-side rendering support

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** 18+ installed
- **npm** or **yarn** package manager
- A **Supabase** account and project
- An **Anthropic API key** (for AI features)
- A modern web browser with camera access (for barcode scanning)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/cookmind.git
cd cookmind
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Wait for the project to be fully set up
3. Go to **Settings** → **API** in your Supabase dashboard
4. Copy your **Project URL** and **anon/public key**

### 4. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Anthropic API Key (for AI recipe adaptation)
ANTHROPIC_API_KEY=your-anthropic-api-key-here
```

**Important:** Never commit `.env.local` to version control. It's already in `.gitignore`.

### 5. Set Up the Database

Run the SQL setup scripts in your Supabase SQL Editor in the following order:

1. **Basic Setup** - `supabase_setup.sql`
   - Creates profiles table
   - Sets up Row Level Security
   - Creates triggers for automatic profile creation

2. **Inventory Setup** - `supabase_inventory_setup.sql`
   - Creates inventory table
   - Sets up RLS policies

3. **Basic Inventory Setup** - `supabase_basic_inventory_setup.sql`
   - Creates basic_inventory table for always-available items

4. **Inventory Tag Migration** - `supabase_inventory_tag_migration.sql`
   - Adds ingredient_tag column to inventory

5. **Custom Tags Setup** - `supabase_custom_tags_setup.sql`
   - Creates user_custom_tags table

6. **Recipes Setup** - `supabase_recipes_setup.sql`
   - Creates recipes table

7. **Recipe Data** - `supabase_recipes_data.sql`
   - Inserts initial recipe data (optional)

8. **Recipe Adaptations Setup** - `supabase_recipe_adaptations_setup.sql`
   - Creates user_recipe_adaptations table for AI-adapted recipes

9. **Email Verification Setup** - `supabase_email_verification_setup.sql`
   - Sets up email verification flow

10. **Demo Data** (Optional) - `supabase_demo_data.sql`
    - Adds demo data for testing with `demo@cookmind.ai` account

### 6. Configure Authentication

1. Go to **Authentication** → **Settings** in Supabase
2. Ensure **Email** provider is enabled
3. Configure email templates if needed
4. Set up redirect URLs for email verification and password reset

### 7. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
cookmind/
├── app/                          # Next.js App Router pages
│   ├── (home)/                   # Home route group
│   ├── api/                      # API routes
│   │   ├── claude/               # Anthropic Claude API routes
│   │   │   ├── recipe-adaptation/
│   │   │   └── tag-suggestion/
│   │   └── openfoodfacts/        # Open Food Facts API routes
│   ├── basisvoorraad/            # Basic inventory page
│   ├── check-email/              # Email verification check
│   ├── forgot-password/          # Password reset
│   ├── login/                    # Login page
│   ├── onboarding/               # Onboarding flow
│   ├── profiel/                  # User profile page
│   ├── product/                  # Product detail pages
│   ├── recepten/                 # Recipe pages
│   │   └── [id]/                 # Recipe detail page
│   │       └── kookmodus/        # Cooking mode page
│   ├── signup/                   # Sign up page
│   ├── verify-email/             # Email verification page
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home/inventory page
│   └── globals.css               # Global styles
├── components/                   # React components
│   ├── auth/                     # Authentication components
│   ├── barcode/                  # Barcode scanning components
│   ├── basisvoorraad/            # Basic inventory components
│   ├── navigation/               # Navigation components
│   ├── onboarding/               # Onboarding components
│   ├── product/                  # Product management components
│   ├── profiel/                  # Profile components
│   ├── recepten/                 # Recipe components
│   └── voorraad/                 # Inventory components
├── lib/                          # Utility libraries
│   ├── constants/                # Constants (ingredients, etc.)
│   ├── supabase/                 # Supabase client setup
│   └── utils/                    # Utility functions
├── public/                       # Static assets
├── supabase_*.sql                # Database setup scripts
├── .env.local                    # Environment variables (not in git)
├── next.config.ts                # Next.js configuration
├── package.json                  # Dependencies
└── tsconfig.json                 # TypeScript configuration
```

## 🔌 API Endpoints

### Recipe Adaptation
- **POST** `/api/claude/recipe-adaptation`
  - Adapts a recipe based on user request
  - Body: `{ recipe: RecipeData, prompt: string, missingIngredients?: string[] }`
  - Returns: Adapted recipe with new ingredients and instructions

### Tag Suggestion
- **POST** `/api/claude/tag-suggestion`
  - Suggests ingredient tags for products
  - Body: `{ productName: string }`
  - Returns: Suggested ingredient tag

### Open Food Facts
- **GET** `/api/openfoodfacts?barcode={barcode}`
  - Fetches product data by barcode
  - Returns: Product information from Open Food Facts

- **GET** `/api/openfoodfacts/search?query={query}`
  - Searches for products
  - Returns: Search results from Open Food Facts

## 🎨 Key Features Explained

### Inventory Management
The inventory system allows users to track their food items with:
- Product name, image, quantity, and unit
- Expiry dates for perishable items
- Ingredient tags for smart recipe matching
- Basic inventory for always-available items (salt, pepper, etc.)

### Recipe Matching
Recipes are matched to your inventory based on:
- Available ingredients in your inventory
- Basic inventory items (always available)
- Ingredient tags for flexible matching
- Match percentage calculation

### AI Recipe Adaptation
When you request a recipe adaptation:
1. The complete recipe (title, description, ingredients, instructions) is sent to Claude AI
2. AI analyzes your request and adapts the entire recipe
3. New ingredients and instructions are generated
4. The adapted recipe is saved to your account
5. The recipe page automatically updates to show the adapted version

### Cooking Mode
The cooking mode provides:
- Step-by-step instructions
- Automatic timer detection from instructions
- Multiple active timers support
- Progress tracking
- Easy step navigation

## 🔒 Security

- **Row Level Security (RLS)** - All database tables use RLS to ensure users can only access their own data
- **Environment Variables** - Sensitive keys are stored in `.env.local` (not committed to git)
- **Supabase Auth** - Secure authentication with email verification
- **API Key Protection** - AI API keys are server-side only

## 🧪 Testing

To test the application:

1. Create a test account via the signup page
2. Add some inventory items manually or via barcode
3. Browse recipes and see match percentages
4. Try the AI adaptation feature with prompts like "make it vegetarian"
5. Test the cooking mode with step-by-step instructions

For demo data, run `supabase_demo_data.sql` after creating a `demo@cookmind.ai` account.

## 🐛 Troubleshooting

### Common Issues

**Database errors:**
- Ensure all SQL setup scripts have been run in order
- Check that RLS policies are correctly set up
- Verify your Supabase credentials in `.env.local`

**AI features not working:**
- Verify `ANTHROPIC_API_KEY` is set in `.env.local`
- Check that the API key is valid and has credits
- Ensure the API route is accessible

**Barcode scanning not working:**
- Ensure camera permissions are granted
- Use HTTPS in production (required for camera access)
- Check browser compatibility

**Authentication issues:**
- Verify email verification is set up in Supabase
- Check email templates and redirect URLs
- Ensure RLS policies allow user access

For more detailed troubleshooting, see `TROUBLESHOOTING.md`.

## 📝 Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key | Yes |
| `ANTHROPIC_API_KEY` | Anthropic Claude API key | Yes (for AI features) |

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

The app will automatically deploy on every push to main.

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- Self-hosted with Node.js

Ensure all environment variables are set in your hosting platform.

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary. All rights reserved.

## 🙏 Acknowledgments

- **Supabase** - Backend infrastructure
- **Anthropic** - AI capabilities
- **Open Food Facts** - Product database
- **Next.js** - React framework
- **Tailwind CSS** - Styling framework

## 📧 Support

For issues, questions, or suggestions, please open an issue on GitHub.

---

**CookMind AI** - Transform your pantry into perfect recipes with AI 🍳✨
