import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { firebaseConfig } from "./config.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
import { getDatabase, ref, set, push, onValue, remove } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-database.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

let currentUser = null;

onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        show.innerHTML = `
        <!---------------   <h3>Welcome ${user.displayName}</h3> --------------->
            <img src="${user.photoURL}" alt="Profile Picture" style="width: 30px; height: 30px; border-radius: 100%;" />
        `;
        loadNotes();
    } else {
        setTimeout(() => {
            window.location.href = 'signin.html'
        }, 500);
    }
});

// --- COLOR PICKER ---------------------------
document.getElementById('color-input').onclick = function () {
    const picker = document.getElementById('color-picker');
    picker.classList.toggle('d-none');
};
document.querySelectorAll('#color-picker > div').forEach(function (colorDiv) {
    colorDiv.addEventListener('click', function () {
        document.querySelector('.note-input').style.background = colorDiv.style.backgroundColor;
    });
});

// --- IMAGE SELECTOR --------------------
let imageData = '';
document.getElementById('image-input').onclick = function () {
    document.getElementById('note-image-file').click();
};
document.getElementById('note-image-file').onchange = function (event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            imageData = e.target.result;
            document.getElementById('showimage').innerHTML = `<img src="${imageData}" alt="Note Image" style="max-width:100%;max-height:150px;">`;
        };
        reader.readAsDataURL(file);
    }
};

// --- ADD NOTE ----------------------
const addNote = () => {
    if (!currentUser) return;
    const title = document.getElementById('note-title').value.trim();
    const content = document.getElementById('note-content').value.trim();
    const noteInput = document.querySelector('.note-input');
    const bgColor = noteInput.style.background || '#fff';
    const showImageElem = document.getElementById('showimage');
    const imgTag = showImageElem ? showImageElem.querySelector('img') : null;
    const imgSrc = imgTag ? imgTag.src : '';

    if (!title && !content && !imgSrc) {
        alert('Please enter a note.');
        return;
    }

    let time = new Date().toLocaleTimeString();
    let date = new Date().toLocaleDateString();
    const noteObj = { title, content, bgColor, imgSrc, time, date };
    const notesRef = ref(database, `notes/${currentUser.uid}`);
    push(notesRef, noteObj);
    document.getElementById('note-title').value = '';
    document.getElementById('note-content').value = '';
    if (showImageElem) showImageElem.innerHTML = '';
    noteInput.style.background = '#fff';
    imageData = '';
};
window.addNote = addNote;
const cancelNote = () => {
    document.getElementById('note-title').value = '';
    document.getElementById('note-content').value = '';
    document.querySelector('.note-input').style.background = '#fff';
    const showImageElem = document.getElementById('showimage');
    if (showImageElem) showImageElem.innerHTML = '';
    imageData = '';
};
window.cancelNote = cancelNote;

// --- DISPLAY NOTES (IN CARD) ----------------
function loadNotes() {
    if (!currentUser) return;
    const notesRef = ref(database, `notes/${currentUser.uid}`);
    onValue(notesRef, (snapshot) => {
        const data = snapshot.val();
        const notesList = document.getElementById('notes-list');
        notesList.innerHTML = '';
        if (!data) return;
        Object.entries(data).reverse().forEach(([key, note]) => {
            notesList.innerHTML += `
            <div class="note-card animate__animated animate__fadeInUp shadow-sm mb-3" style="background:${note.bgColor};border-radius:12px;padding:16px;">
                <div class="card-body">
                ${note.title ? `<h5 class="card-title">${note.title}</h5>` : ''}
                ${note.content ? `<p class="card-text">${note.content}</p>` : ''}
                ${note.imgSrc ? `<img src="${note.imgSrc}" alt="Note Image" class="img-fluid rounded mb-2" style="max-width:100%;max-height:150px;">` : ''}
                <div class="d-flex gap-2 mt-2 align-items-center">
                    <small>${note.time} ${note.date}</small>
                    <button class="btn btn-outline-secondary btn-sm edit-btn" data-key="${key}">Edit</button>
                    <button class="btn btn-outline-danger btn-sm delete-btn" data-key="${key}">Delete</button>
                </div>
                </div>
            </div>
            `;
        });

        // -------------------  Edit and Delete -------------------
        notesList.querySelectorAll('.delete-btn').forEach(btn => {
            btn.onclick = function() {
                const key = btn.getAttribute('data-key');
                if (confirm('Delete this note?')) {
                    remove(ref(database, `notes/${currentUser.uid}/${key}`));
                }
            };
        });
        notesList.querySelectorAll('.edit-btn').forEach(btn => {
            btn.onclick = function() {
                const key = btn.getAttribute('data-key');
                const noteToEdit = data[key];
                document.getElementById('note-title').value = noteToEdit.title;
                document.getElementById('note-content').value = noteToEdit.content;
                document.querySelector('.note-input').style.background = noteToEdit.bgColor || '#fff';
                if (noteToEdit.imgSrc) {
                    document.getElementById('showimage').innerHTML = `<img src="${noteToEdit.imgSrc}" alt="Note Image" style="max-width:100%;max-height:150px;">`;
                } else {
                    document.getElementById('showimage').innerHTML = '';
                }
                remove(ref(database, `notes/${currentUser.uid}/${key}`));
            };
        });
    });
}
// --- ADD NOTE WHEN I CLICK ENTER KEY ----------------------
document.getElementById('note-content').addEventListener('keydown', function(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        addNote();
    }
});
// --- LOGOUT ----------------------
document.getElementById('logout-btn').onclick = function() {
    if (currentUser) {
        auth.signOut().then(() => {
            window.location.href = 'signin.html';
        }).catch((error) => {
            console.error('Sign out error:', error);
        });
    }
}