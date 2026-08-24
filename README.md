# QueueCare Frontend

## Vercel deployment

In the Vercel frontend project, set the `VITE_API_URL` Environment Variable to the
actual deployed backend URL. Include `/api`, for example:

```env
VITE_API_URL=https://your-real-backend-project.vercel.app/api
```

Do not use `localhost` in Vercel. After changing this variable, redeploy the
frontend because Vite embeds environment variables during the build.

Test the backend first at:

```text
https://your-real-backend-project.vercel.app/api/health
```

It must return `{"status":"ok"}` before login and registration can work.

## Local development

```bash
npm run dev
```

The remainder of this document is the standard Vite reference.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
