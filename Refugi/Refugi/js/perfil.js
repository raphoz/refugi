import { getAuth, onAuthStateChanged, updatePassword } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { signOut } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyDUToDSB76WC06XnEMmgzGNUm8iS1_30J0",
    authDomain: "refugi-app.firebaseapp.com",
    projectId: "refugi-app",
    storageBucket: "refugi-app.firebasestorage.app",
    messagingSenderId: "676055353642",
    appId: "1:676055353642:web:534a0f234dd32acbc4b653"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUser;

onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        const docRef = doc(db, "Profiles", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            const profileName = document.querySelector('.profile-name');
            if (profileName) profileName.textContent = data.nome || user.email;
            document.getElementById('perfil-nome').value = data.nome || '';
            document.getElementById('perfil-abrigo').value = data.nomeAbrigo || '';
            document.getElementById('perfil-capacidade').value = data.capacidadeMaxima || '';
            document.getElementById('perfil-contato').value = data.contato || '';
        }
    }
});

// Salvar alterações
document.getElementById('btnSalvarPerfil').addEventListener('click', async (e) => {
    e.preventDefault();

    if (!currentUser) {
        alert("Usuário não autenticado.");
        return;
    }

    const nome = document.getElementById('perfil-nome').value;
    const nomeAbrigo = document.getElementById('perfil-abrigo').value;
    const capacidadeMaxima = document.getElementById('perfil-capacidade').value;
    const contato = document.getElementById('perfil-contato').value;
    const senha = document.getElementById('perfil-senha').value;

    try {
        // Atualiza dados no Firestore
        const docRef = doc(db, "Profiles", currentUser.uid);
        await updateDoc(docRef, {
            nome,
            nomeAbrigo,
            capacidadeMaxima: Number(capacidadeMaxima),
            contato
        });

        // Atualiza senha se foi alterada
        if (senha && senha !== "********") {
            await updatePassword(currentUser, senha);
            alert("Senha alterada com sucesso!");
        }

        alert("Perfil atualizado com sucesso!");
    } catch (error) {
        alert("Erro ao atualizar perfil: " + error.message);
        console.error(error);
    }
});

document.getElementById('btnLogout').addEventListener('click', async (e) => {
    e.preventDefault();
    await signOut(auth);
    window.location.href = "./refugi-auth/index.html"; // ajuste o caminho se necessário
});