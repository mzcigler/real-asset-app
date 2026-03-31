# BENi — Real Asset Management App

A cross-platform property, task, and document management app built with **Expo (React Native)** and **Supabase**.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Expo](https://expo.dev) (React Native) with [expo-router](https://expo.github.io/router) file-based routing |
| Language | TypeScript |
| Styling | Inline styles + [NativeWind](https://www.nativewind.dev) (Tailwind for React Native) |
| Backend / Auth | [Supabase](https://supabase.com) (PostgreSQL + Auth + Storage + Edge Functions) |
| AI Extraction | OpenAI GPT-4o-mini via Supabase Edge Function |
| Date Picker | `react-native-paper-dates` |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project

### Environment Setup

Create a `.env` file in the project root:

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Install & Run

```bash
npm install

# Web
npx expo start --web

# iOS simulator
npx expo start --ios

# Android emulator
npx expo start --android
```

---

## Project Structure

```
real-asset-app/
│
├── app/                        # Expo Router screens (file = route)
│   ├── _layout.tsx             # Root layout — wraps app in ThemeProvider
│   ├── index.tsx               # Entry point — redirects based on auth state
│   ├── (auth)/
│   │   ├── login.tsx
│   │   └── register.tsx
│   └── (tabs)/                 # Authenticated area (AppHeader always visible)
│       ├── _layout.tsx         # Auth guard + AppHeader + Slot
│       ├── dashboard.tsx       # Main screen: properties + tasks
│       ├── profile.tsx         # User profile editing
│       └── property/
│           └── [id].tsx        # Property detail: tasks & files tabs
│
├── components/                 # Reusable UI components
│   ├── AppHeader.tsx           # Top nav bar (BENi logo, nav links, dark mode toggle)
│   ├── Button.tsx              # ★ Primary button — use this for all buttons
│   ├── ConfirmDeleteModal.tsx  # Reusable delete confirmation dialog
│   ├── RenameModal.tsx         # Reusable rename / text-input dialog
│   ├── PageContainer.tsx       # Centered max-width scroll wrapper for screens
│   ├── TaskItem.tsx            # Task row (view + inline edit)
│   ├── FileItem.tsx            # File row (download + delete)
│   ├── PropertySquareCard.tsx  # Square property card (130×130)
│   ├── PropertyScrollRow.tsx   # Horizontal scroll row with draggable scrollbar
│   ├── AddPropertyPopup.tsx    # New property modal
│   ├── AddTaskModal.tsx        # New task modal
│   ├── UploadExtractPopup.tsx  # File upload + AI task extraction modal
│   ├── TaskConfirmationPopup.tsx # Review extracted tasks before saving
│   ├── InfoPopup.tsx           # Success / error / warning toast modal
│   ├── LoadingModal.tsx        # Full-screen loading overlay
│   ├── DateInput.tsx           # Date picker input
│   ├── Inputs.tsx              # SingleLineInput, MultiLineInput
│   ├── PhoneInput.tsx          # Phone + area code input
│   ├── ScreenWrapper.tsx       # Keyboard-aware wrapper for auth screens
│   ├── FileUploadZone.tsx      # File picker drag zone
│   └── PropertiesDropdown.tsx  # Property selector picker
│
├── services/                   # Supabase data access — all DB calls live here
│   ├── propertyService.ts      # fetchProperties, createProperty, renameProperty, deleteProperties
│   ├── taskService.ts          # fetchAllTasksForUser, createTask, updateTask, deleteTasks, …
│   └── fileService.ts          # fetchFilesForProperty, deleteFiles, downloadFile
│
├── functions/                  # Edge function callers
│   └── ExtractTasksFromText.tsx # Calls the ExtractTasksUsingLLM Supabase edge function
│
├── hooks/
│   └── useSelectionMode.ts     # Long-press multi-select state hook
│
├── types/
│   └── index.ts                # All shared TypeScript types (Property, TaskType, DBTask, …)
│
├── utils/
│   └── taskUtils.ts            # sortByDueDate, dbTaskToTaskType, toDateString
│
├── theme/
│   ├── colors.ts               # ★ Light & dark color palettes — edit here to restyle the app
│   └── ThemeContext.tsx        # ThemeProvider + useTheme() hook
│
├── constants/
│   └── layout.ts               # ★ MAX_WIDTH, SCREEN_PADDING, BREAKPOINT
│
├── lib/
│   └── supabase.ts             # Supabase client singleton
│
└── supabase/
    └── functions/
        └── ExtractTasksUsingLLM/
            └── index.ts        # Deno edge function — calls OpenAI to extract tasks
```

---

## Key Customisation Points

### Change the max content width
Edit `constants/layout.ts` → `MAX_WIDTH`. One change affects all screens uniformly.

### Change button styles / colors
Edit `theme/colors.ts` to remap action colors, or edit `components/Button.tsx` to change shape/padding.

**Button variants:**

| Variant | Use for |
|---|---|
| `primary` | Default navigation / confirm |
| `success` | Add, save, create |
| `danger` | Delete, destructive |
| `info` | Upload, links, info |
| `secondary` | Cancel, neutral |
| `outline` | Secondary call-to-action |

### Change app colors (light / dark)
Edit `theme/colors.ts`. Both `lightColors` and `darkColors` are fully typed.

Access colors in any component:
```tsx
const { colors } = useTheme();
```

---

## Backend (Supabase)

### Accessing the Dashboard
Log in at **https://supabase.com** and open your project.  
Tables, auth users, storage buckets, and edge functions are all managed there.

### Database Tables

| Table | Key Columns | Notes |
|---|---|---|
| `profiles` | `id`, `first_name`, `surname`, `phone` | `id` = auth user UUID |
| `properties` | `id`, `name`, `user_id`, `created_at` | One user → many properties |
| `files` | `id`, `property_id`, `file_name`, `file_path` | `file_name = '__manual__'` = virtual file for manually-added tasks |
| `tasks` | `id`, `file_id`, `title`, `description`, `due_date` | Linked to a file; cascade-delete when file deleted |

### Storage

- Bucket: `user_files`
- Path format: `{propertyId}/{timestamp}-{filename}`

### Edge Functions

**`ExtractTasksUsingLLM`** — extracts tasks from uploaded documents using AI.

- Source: `supabase/functions/ExtractTasksUsingLLM/index.ts`
- Runtime: Deno
- Requires `OPENAI_API_KEY` secret set in the Supabase dashboard → Project Settings → Edge Functions

Deploy:
```bash
supabase functions deploy ExtractTasksUsingLLM
```

---

## Auth Flow

1. User registers → Supabase creates auth user + `profiles` row is inserted
2. On login, session is persisted via AsyncStorage / SecureStore
3. All tab screens are protected by the auth guard in `app/(tabs)/_layout.tsx`
4. Sign out clears the session and redirects to login

---

## Dark Mode

Toggle via the sun/moon icon in the header (or on the login screen).  
The mode is in-memory only and resets on restart.  
To persist it: save the value to the `profiles` table and load it on app start.
