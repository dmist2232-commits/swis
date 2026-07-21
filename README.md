# Deployment on Hostinger VPS using Dokploy

1. Go to your Dokploy panel.
2. Create a new PostgreSQL Database in Dokploy. Note the database connection string.
3. Create a new Application in Dokploy connected to your Git repository (or using Docker).
4. In the Application's Environment settings, add the following environment variable:
   `DATABASE_URL=postgresql://dmist2232%40gmail.com:200732503140@sisaranew-sisara-en5m2b:5432/SISARA` 
   (or use the connection string provided by Dokploy).
5. Build and Deploy!

## Important Note About Preview Errors

If you see errors like **"Database connection failed: getaddrinfo EAI_AGAIN sisaranew-sisara-en5m2b"** in the AI Studio preview, **this is expected and normal.**

*   `sisaranew-sisara-en5m2b` is an **internal hostname** that only exists inside your Hostinger VPS / Dokploy network.
*   The AI Studio preview environment runs on the public internet and cannot connect to your VPS's internal private network.
*   **Once you deploy this code to your Dokploy application**, it will be running inside the same network as your database and will connect smoothly without these errors.

The code is fully ready for deployment!
