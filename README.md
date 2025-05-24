# RouteLead

**RouteLead** is a mobile-first logistics bidding platform that connects Drivers returning empty after deliveries with Customers who need to send parcels. This monorepo contains both the **frontend** (React Native) and **backend** (Spring Boot) applications.

---

## 📁 Repository Structure

```
RouteLead/
├── fe/                  # Frontend (React Native)
│   ├── App.js
│   ├── package.json
│   ├── android/
│   ├── ios/
│   └── ...
├── be/                  # Backend (Spring Boot)
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/example/be
│   │   │   │   └── BeApplication.java
│   │   │   └── resources/
│   │   │       ├── application.properties
│   │   │       └── ...
│   ├── build.gradle
│   ├── gradlew
│   ├── gradlew.bat
│   └── ...
├── .gitignore
└── README.md            # This file
```

---

## 🚀 Getting Started

Follow these instructions to get both the frontend and backend up and running on your local machine.

### Prerequisites

* **Node.js** (v14+)
* **Yarn** or **npm**
* **React Native CLI** (if using CLI workflow)
* **Java SDK** (11+)
* **Gradle** (optional, uses wrapper by default)
* **Android Studio** / **Xcode** (for mobile simulators)

---

## 🛠️ Frontend (fe)

The frontend is built with React Native.

### 1. Install dependencies

```bash
cd fe
npm install   # or yarn install
```

### 2. Run in development

```bash
# Start Metro
npm start       # or yarn start

# In a separate terminal, launch on Android
yarn android    # or npx react-native run-android

# Or launch on iOS
yarn ios        # or npx react-native run-ios
```

### 3. Environment configuration

Create a `.env` file in `fe/` with any environment variables (e.g., API endpoint):

```
API_URL=http://localhost:8080
```

---

## 🖥️ Backend (be)

The backend is a Spring Boot application using Gradle.

### 1. Build & Run with Gradle Wrapper

```bash
cd be
# Make wrapper executable (macOS/Linux)
chmod +x gradlew

# Run the app
override
./gradlew bootRun
```

On Windows:

```powershell
cd be
.\gradlew.bat bootRun
```

### 2. Build a JAR

```bash
cd be
./gradlew clean bootJar
java -jar build/libs/be-0.0.1-SNAPSHOT.jar
```

### 3. Configure application

Edit `be/src/main/resources/application.properties` to adjust:

```properties
server.port=8080
spring.datasource.url=jdbc:h2:mem:routeleddb
# or your Postgres/MySQL config
```

---

## 🧪 Testing

* **Frontend**: Run any Jest or React Native tests:

  ```bash
  cd fe
  npm test    # or yarn test
  ```

* **Backend**: Run Spring Boot tests:

  ```bash
  cd be
  ./gradlew test
  ```

---

## 📚 Resources

* [React Native Docs](https://reactnative.dev/)
* [Spring Boot Docs](https://spring.io/projects/spring-boot)

---

## 🤝 Contributing

Feel free to submit issues and pull requests. Please follow the coding standards in each module and write tests for new features.

---

## 📝 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
