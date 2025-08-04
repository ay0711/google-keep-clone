import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getAuth, signInWithPopup, createUserWithEmailAndPassword, GoogleAuthProvider, GithubAuthProvider, updateProfile } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
import { firebaseConfig } from "./config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

const signUpBut = () => {
    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

    if (!emailRegex.test(email)) {
        alert("Please enter a valid email address");
        return;
    }
    // if (!passwordRegex.test(password)) {
    //     alert("Password must be at least 8 characters long and contain at least one letter and one number");
    //     return;
    // }
    if (email === "" || password === "" || username === "") {
        alert("Please fill in all fields");
        return;
    }
    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            updateProfile(user, { displayName: username }).then(() => {
                console.log("Profile updated");
            });
            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 1500);
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorCode);
            console.log(errorMessage);
        });
}

const signInWithGoogle = () => {
    signInWithPopup(auth, provider)
        .then((result) => {
            console.log(result);
            window.location.href = "dashboard.html";
        }).catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorCode);
            console.log(errorMessage);
        });
}

const signInWithGithub = () => {
    signInWithPopup(auth, githubProvider)
        .then((result) => {
            console.log(result);
            window.location.href = "dashboard.html";
        }).catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorCode);
            console.log(errorMessage);
        });
}
document.getElementById("signup-form")?.addEventListener("submit", e => {
    e.preventDefault();
    signUpBut();
});

window.signUpBut = signUpBut;
window.signInWithGoogle = signInWithGoogle;
window.signInWithGithub = signInWithGithub;