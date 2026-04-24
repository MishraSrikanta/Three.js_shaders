export class LoginModalService {
  constructor() {}
  static runLogInModal() {
    // LOGIN MODAL ELEMENTS
    const loginBtn = document.getElementById("loginBtn");
    const loginModal = document.getElementById("loginModal");
    const registerModal = document.getElementById("registerModal");

    const closeLogin = document.getElementById("closeLogin");
    const closeRegister = document.getElementById("closeRegister");

    const showRegister = document.getElementById("showRegister");

    // OPEN LOGIN
    loginBtn.addEventListener("click", () => {
      loginModal.classList.remove("hidden");
    });

    // CLOSE LOGIN
    closeLogin.addEventListener("click", () => {
      loginModal.classList.add("hidden");
    });

    // OPEN REGISTER
    showRegister.addEventListener("click", () => {
      // Clear all register inputs
      document.getElementById("regUserId").value = "";
      document.getElementById("regName").value = "";
      document.getElementById("regEmail").value = "";
      document.getElementById("regPhone").value = "";
      document.getElementById("regPassword").value = "";

      loginModal.classList.add("hidden");
      registerModal.classList.remove("hidden");
    });

    // CLOSE REGISTER
    closeRegister.addEventListener("click", () => {
      registerModal.classList.add("hidden");
    });

    // LOGIN SUBMIT

    document
      .getElementById("submitLogin")
      .addEventListener("click", async () => {
        const userId = document.getElementById("loginUserId").value.trim();
        const password = document.getElementById("loginPassword").value.trim();
        const response = await fetch("http://localhost:5000/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, password }),
        });

        const result = await response.json();
        console.log(result);

        if (result.token) {
          // Save token
          localStorage.setItem("token", result.token);

          // Show Welcome Message
          const welcomeDiv = document.getElementById("welcomeUser");
          welcomeDiv.innerText = `Welcome, ${result.user.name}`;
          welcomeDiv.classList.remove("hidden");

          // Hide login button
          document.getElementById("loginBtn").style.display = "none";

          // Close modal
          loginModal.classList.add("hidden");
        } else {
          alert(result.message);
        }
      });

    // REGISTER SUBMIT
    document
      .getElementById("submitRegister")
      .addEventListener("click", async () => {
        const data = {
          userId: document.getElementById("regUserId").value,
          name: document.getElementById("regName").value,
          email: document.getElementById("regEmail").value,
          phone: document.getElementById("regPhone").value,
          password: document.getElementById("regPassword").value,
        };

        const response = await fetch(
          "http://localhost:5000/api/auth/register",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          },
        );

        const result = await response.json();

        alert(result.message);
      });
  }
}
