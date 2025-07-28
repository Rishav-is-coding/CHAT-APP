# bakBAK - Real-Time E2EE Chat Application

![bakBAK Demo](https://i.imgur.com/your-project-demo-image.gif) <!-- It's highly recommended to add a GIF of your project in action -->

**bakBAK** is a full-stack, real-time chat application built with a primary focus on user privacy and security through **End-to-End Encryption (E2EE)**. This application ensures that only the communicating users can read the messages they send.

### 🔴 Live Demo: [https://bakbak-vlbv.onrender.com/](https://bakbak-vlbv.onrender.com/)

---

## ✨ Key Features

-   **End-to-End Encryption (E2EE):** Messages are encrypted on the client-side using RSA-2048, ensuring no one, not even the server, can read the conversation.
-   **Real-Time Messaging:** Instant message delivery and online status updates powered by **Socket.io**.
-   **Secure Key Management:** User-specific private keys are encrypted with the user's password and stored securely, with a mechanism to restore them on new devices.
-   **Dual Encryption System:** Messages are encrypted for both the sender and receiver, ensuring both parties can always access their chat history.
-   **User Authentication:** Secure user signup, login, and session management using JWT (JSON Web Tokens) stored in HTTP-only cookies.
-   **Profile Customization:** Users can update their profile pictures.
-   **Responsive Design:** A clean and modern UI that works seamlessly on both desktop and mobile devices, built with **Tailwind CSS** and **daisyUI**.

---

## 🛠️ Tech Stack

| Category      | Technology                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| :------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Frontend** | ![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB) ![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white) ![Zustand](https://img.shields.io/badge/Zustand-404040?style=for-the-badge&logo=zustand&logoColor=white) ![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white) ![DaisyUI](https://img.shields.io/badge/daisyui-5A0EF8?style=for-the-badge) |
| **Backend** | ![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white) ![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB) ![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101)                                                                                                                                                                           |
| **Database** | ![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)                                                                                                                                                                                                                                                                                                                                                                                                               |
| **Security** | ![JSEncrypt](https://img.shields.io/badge/JSEncrypt-A52A2A?style=for-the-badge) ![CryptoJS](https://img.shields.io/badge/CryptoJS-4A90E2?style=for-the-badge) ![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)                                                                                                                                                                                                                                                                          |
| **Deployment**| ![Render](https://img.shields.io/badge/Render-%46E3B7.svg?style=for-the-badge&logo=render&logoColor=white)                                                                                                                                                                                                                                                                                                                                                                                                                   |

---

## 🔐 How End-to-End Encryption Works

Security is at the core of this project. Here’s a breakdown of the encryption workflow:

1.  **User Signup & Key Generation:**
    * When a user signs up, a **2048-bit RSA key pair** (public and private) is generated in their browser.
    * The **private key** is immediately encrypted with the user's password using AES encryption.
    * The **public key** and the **encrypted private key** are stored in the database.
    * The unencrypted private key is stored in the browser's `localStorage` for the current session.

2.  **Sending a Message (Dual Encryption):**
    * The message is encrypted **twice** on the sender's device:
        1.  Once with the **recipient's public key**.
        2.  Once with the **sender's own public key**.
    * Both encrypted versions are sent to the server. This ensures both the sender and receiver can decrypt their own copies of the conversation history.

3.  **Receiving a Message:**
    * The recipient's client receives the encrypted message.
    * It uses the recipient's **private key** (from `localStorage`) to decrypt the message content locally.

4.  **Logging in on a New Device:**
    * If a user logs in and no private key is found in `localStorage`, the app fetches the `encryptedPrivateKey` from the server.
    * The user's login password is used to decrypt this key, which is then stored in the new browser's `localStorage`.

---

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

-   Node.js (v14 or higher)
-   npm
-   MongoDB account (for the database URI)
-   Cloudinary account (for image hosting)

### Installation & Setup

1.  **Clone the repository:**
    ```sh
    git clone [https://github.com/Rishav-is-coding/CHAT-APP.git](https://github.com/Rishav-is-coding/CHAT-APP.git)
    cd CHAT-APP
    ```

2.  **Install Backend Dependencies:**
    ```sh
    cd backend
    npm install
    ```

3.  **Install Frontend Dependencies:**
    ```sh
    cd ../frontend
    npm install
    ```

4.  **Set up Environment Variables:**

    Create a `.env` file in the `backend` directory and add the following variables:

    ```env
    # backend/.env
    PORT=5001
    MONGODB_URI=<Your_MongoDB_Connection_String>
    JWT_SECRET=<Your_JWT_Secret>
    NODE_ENV=development

    # Cloudinary Credentials for image uploads
    CLOUDINARY_CLOUD_NAME=<Your_Cloudinary_Cloud_Name>
    CLOUDINARY_API_KEY=<Your_Cloudinary_API_Key>
    CLOUDINARY_API_SECRET=<Your_Cloudinary_API_Secret>
    ```

### Running the Application

1.  **Start the Backend Server:**
    ```sh
    # From the /backend directory
    npm run dev
    ```
    The server will be running on `http://localhost:5001`.

2.  **Start the Frontend Development Server:**
    ```sh
    # From the /frontend directory
    npm run dev
    ```
    The React application will be available at `http://localhost:5173`.

---

## 📁 Project Structure

```
CHAT-APP/
├── backend/
│   ├── src/
│   │   ├── controllers/    # Request handling logic
│   │   ├── lib/            # DB connection, sockets, utils
│   │   ├── middleware/     # Auth middleware
│   │   ├── models/         # Mongoose schemas
│   │   └── routes/         # API routes
│   └── index.js            # Server entry point
└── frontend/
├── src/
│   ├── components/     # Reusable React components
│   ├── pages/          # Page components
│   ├── store/          # Zustand state management
│   ├── lib/            # Axios instance, utils
│   └── App.jsx         # Main App component
└── index.html          # HTML entry point
```


---

## 👤 Author

**Rishav Raj**

-   **GitHub:** [@Rishav-is-coding](https://github.com/Rishav-is-coding)
-   **LinkedIn:** [Your LinkedIn Profile](https://www.linkedin.com/in/rishavrajiitg/)
-   **Medium:** [@RishavTryToWrite](https://medium.com/@RishavTryToWrite)
