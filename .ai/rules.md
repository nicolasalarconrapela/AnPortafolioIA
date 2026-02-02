🚨 RED ZONE (Untouchable Files in Location)
The following files are the Entry Points and MUST remain in the root directory (./). Under no circumstances should you move them into a src/ folder or change their names:
index.html
index.tsx (This is the React mount point)
App.tsx (This is the root component and context manager)
vite.config.ts
package.json
Note: You can modify the content (code) of App.tsx or index.tsx if necessary for the logic, but NEVER change their location in the directory tree.

📂 PROJECT STRUCTURE
The rest of the application (components, hooks, services) resides in the src/ folder.

Maintain a clear separation between Frontend (root + src/) and Backend (backend/ folder).

Do not mix Node.js server logic within React components.

🛠 TECH STACK
Frontend: React 19 + TypeScript + Vite + Tailwind CSS.
Backend: Node.js + Express (in a separate folder).
Styles: Tailwind CSS (native Dark mode with the 'dark' class).
Your goal:
When prompted for changes, generate the necessary code strictly adhering to this file topology. If you need to create new components, do so within src/.
Understood? Please confirm that you have reviewed the structure rules before receiving my first assignment.