# Render Deployment Guide

This repository is configured for easy deployment on [Render](https://render.com) using the `render.yaml` Blueprint specification.

## Prerequisites

1.  A [Render](https://render.com) account.
2.  A [GitHub](https://github.com) account connected to Render.
3.  The necessary environment variables (Firebase credentials and Gemini API Key).

## Deployment Steps

1.  **Fork/Clone** this repository to your GitHub account if you haven't already.
2.  Log in to the **Render Dashboard**.
3.  Click on **New +** and select **Blueprint**.
4.  Connect your GitHub repository.
5.  Render will automatically detect the `render.yaml` file.
6.  You will be prompted to provide the following environment variables:

    ### Backend Service (`an-portafolio-ia-backend`)
    *   `FIREBASE_PROJECT_ID`: Your Firebase Project ID.
    *   `FIREBASE_CLIENT_EMAIL`: Your Firebase Client Email (service account).
    *   `FIREBASE_PRIVATE_KEY`: Your Firebase Private Key.
        *   *Note:* Copy the entire private key including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`. Render handles the newlines correctly.
    *   `FIREBASE_DATABASE_URL`: (Optional) Your Firebase Database URL if needed.

    ### Frontend Static Site (`an-portafolio-ia-frontend`)
    *   `GEMINI_API_KEY`: Your Google Gemini API Key.
    *   `VITE_BACKEND_API_URL`: This is automatically linked to the backend service URL by the Blueprint. You usually don't need to set this manually unless you want to override it.

7.  Click **Apply**.
8.  Render will deploy both the backend and the frontend.

## Verification

*   Once deployed, the frontend should be accessible at the URL provided by Render (e.g., `https://an-portafolio-ia-frontend.onrender.com`).
*   The frontend should successfully communicate with the backend.
