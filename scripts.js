// Firebase + Firestore
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { salvarOffline } from './indexedDB.js';

const firebaseConfig = {
  apiKey: "AIzaSyB8J2VWN_dObjf4-K4nj2Hfm3S73NATlXI",
  authDomain: "censo-saude-ro-2025.firebaseapp.com",
  projectId: "censo-saude-ro-2025",
  storageBucket: "censo-saude-ro-2025.appspot.com",
  messagingSenderId: "870337322130",
  appId: "1:870337322130:web:92f5b8b5e32f9d2361ab4b",
  measurementId: "G-1FN8JK5FXN"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", () => {
  Inputmask("999.999.999-99").mask(document.querySelectorAll('input[name^="cpf"]'));
  Inputmask("999999999999999").mask(document.querySelectorAll('input[name^="cns"]'));
  Inputmask({ mask: "(99) 99999-9999", clearIncomplete: true }).mask(document.querySelectorAll('input[name^="telefone"]'));
  Inputmask("99/99/9999").mask(document.querySelectorAll('input[name*="dataNascimento"]'));

  document.querySelector('input[name="numeroMoradores"]').addEventListener('input', gerarMembros);
});

document.getElementById("censoForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.target;
  const inputs = form.querySelectorAll("input, select, textarea");
  let valido = true;

  inputs.forEach(input => {
    if (input.hasAttribute("required") && !input.value.trim()) {
      input.classList.add("erro");
      if (!input.nextElementSibling || !input.nextElementSibling.classList.contains("mensagem-erro")) {
        const msg = document.createElement("span");
        msg.className = "mensagem-erro";
        msg.textContent = "Este campo é obrigatório";
        input.insertAdjacentElement("afterend", msg);
      }
      valido = false;
    } else {
      input.classList.remove("erro");
      if (input.nextElementSibling && input.nextElementSibling.classList.contains("mensagem-erro")) {
        input.nextElementSibling.remove();
      }
    }
  });

  if (!valido) return;

  const formData = new FormData(form);
  const dados = {};
  formData.forEach((valor, chave) => {
    if (dados.hasOwnProperty(chave)) {
      if (!Array.isArray(dados[chave])) dados[chave] = [dados[chave]];
      dados[chave].push(valor);
    } else {
      dados[chave] = valor;
    }
  });
  for (let chave in dados) {
    if (Array.isArray(dados[chave])) dados[chave] = dados[chave].join('; ');
  }

  try {
  await addDoc(collection(db, "respostasCenso"), dados);
  alert("Formulário enviado com sucesso!");
  form.reset();
  document.getElementById("membrosContainer").innerHTML = "";
} catch (e) {
  console.error("Erro ao enviar:", e);
  alert("Sem conexão. Salvando localmente...");
  salvarOffline(dados);
}
});

function gerarMembros() {
  const total = parseInt(this.value);
  const container = document.getElementById("membrosContainer");
  container.innerHTML = "";
  if (total && total > 1) {
    for (let i = 1; i < total; i++) {
      const membro = document.createElement("fieldset");
      membro.innerHTML = `
        <legend>Membro ${i}</legend>
        <label>Nome completo</label>
        <input type="text" name="membro_${i}_nome">

        <label>Grau de parentesco</label>
        <select name="membro_${i}_parentesco">
          <option value="">Selecione</option>
          <option value="Cônjuge">Cônjuge</option>
          <option value="Filho(a)">Filho(a)</option>
          <option value="Pai/Mãe">Pai/Mãe</option>
          <option value="Avô/Avó">Avô/Avó</option>
          <option value="Sogro(a)">Sogro(a)</option>
          <option value="Enteado(a)">Enteado(a)</option>
          <option value="Outro">Outro</option>
        </select>

        <label>CPF</label>
        <input type="text" name="membro_${i}_cpf">

        <label>CNS</label>
        <input type="text" name="membro_${i}_cns">

        <label>Data de nascimento</label>
        <input type="text" name="membro_${i}_dataNascimento">

        <label>Idade (anos)</label>
        <input type="number" name="membro_${i}_idade" min="0">

        <label>Sexo</label>
        <select name="membro_${i}_sexo">
          <option value="">Selecione</option>
          <option value="Masculino">Masculino</option>
          <option value="Feminino">Feminino</option>
          
        </select>

        <label>Estado civil</label>
        <select name="membro_${i}_estadoCivil">
          <option value="">Selecione</option>
          <option value="Solteiro(a)">Solteiro(a)</option>
          <option value="Casado(a)">Casado(a)</option>
          <option value="Divorciado(a)">Divorciado(a)</option>
          <option value="Viúvo(a)">Viúvo(a)</option>
          <option value="União Estável">União Estável</option>
        </select>

        <label>Escolaridade</label>
        <select name="membro_${i}_escolaridade">
          <option value="">Selecione</option>
          <option value="Não alfabetizado">Não alfabetizado</option>
          <option value="Ensino Fundamental Incompleto">Ensino Fundamental Incompleto</option>
          <option value="Ensino Fundamental Completo">Ensino Fundamental Completo</option>
          <option value="Ensino Médio Incompleto">Ensino Médio Incompleto</option>
          <option value="Ensino Médio Completo">Ensino Médio Completo</option>
          <option value="Superior Incompleto">Superior Incompleto</option>
          <option value="Superior Completo">Superior Completo</option>
          <option value="Pós-graduação">Pós-graduação</option>
        </select>

        <label>Ocupação</label>
        <input type="text" name="membro_${i}_ocupacao">

        <label>Telefone</label>
        <input type="tel" name="membro_${i}_telefone">

        <label>E-mail</label>
        <input type="email" name="membro_${i}_email">

        <label>Possui alguma deficiência?</label>
        <select name="membro_${i}_deficienciaPresente">
          <option value="">Selecione</option>
          <option value="Sim">Sim</option>
          <option value="Não">Não</option>
        </select>

        <label>Possui doenças crônicas?</label>
<select name="membro_${i}_doencaCronica" onchange="this.nextElementSibling.style.display = this.value === 'Sim' ? 'block' : 'none'">
  <option value="">Selecione</option>
  <option value="Sim">Sim</option>
  <option value="Não">Não</option>
</select>
<div style="display:none">
  <label>Quais?</label>
  <div class="checkbox-group">
    <label><input type="checkbox" name="membro_${i}_doencas[]" value="Hipertensão"> Hipertensão</label><br>
    <label><input type="checkbox" name="membro_${i}_doencas[]" value="Diabetes"> Diabetes</label><br>
    <label><input type="checkbox" name="membro_${i}_doencas[]" value="Asma"> Asma</label><br>
    <label><input type="checkbox" name="membro_${i}_doencas[]" value="Outras"> Outras</label>
  </div>
</div>

        <label>Usa medicamento contínuo?</label>
<select name="membro_${i}_usoMedicamento" onchange="this.nextElementSibling.style.display = this.value === 'Sim' ? 'block' : 'none'">
  <option value="">Selecione</option>
  <option value="Sim">Sim</option>
  <option value="Não">Não</option>
</select>

<div style="display:none">
  <label>Quais?</label>
  <div class="checkbox-group">
    <label><input type="checkbox" name="membro_${i}_medicamentos[]" value="Losartana"> Losartana</label><br>
    <label><input type="checkbox" name="membro_${i}_medicamentos[]" value="Metformina"> Metformina</label><br>
    <label><input type="checkbox" name="membro_${i}_medicamentos[]" value="Insulina"> Insulina</label><br>
    <label><input type="checkbox" name="membro_${i}_medicamentos[]" value="Sinvastatina"> Sinvastatina</label><br>
    <label><input type="checkbox" name="membro_${i}_medicamentos[]" value="Levotiroxina"> Levotiroxina</label><br>
    <label><input type="checkbox" name="membro_${i}_medicamentos[]" value="Omeprazol"> Omeprazol</label><br>
    <label><input type="checkbox" name="membro_${i}_medicamentos[]" value="Outro"> Outro</label>
  </div>
</div>


        <label>Possui plano de saúde privado?</label>
        <select name="membro_${i}_planoSaude">
          <option value="">Selecione</option>
          <option value="Sim">Sim</option>
          <option value="Não">Não</option>
        </select>

        <label>Está gestante?</label>
        <select name="membro_${i}_gestante">
          <option value="">Selecione</option>
          <option value="Sim">Sim</option>
          <option value="Não">Não</option>
        </select>

        <label>Tempo de gestação (semanas)</label>
        <input type="number" name="membro_${i}_tempoGestacao" min="1">

        <label>Já possui filhos?</label>
        <select name="membro_${i}_possuiFilhos">
          <option value="">Selecione</option>
          <option value="Sim">Sim</option>
          <option value="Não">Não</option>
        </select>

        <label>Quantos filhos?</label>
        <input type="number" name="membro_${i}_quantosFilhos" min="0">
      `;

      container.appendChild(membro);

      Inputmask("999.999.999-99").mask(membro.querySelector(`input[name="membro_${i}_cpf"]`));
      Inputmask("999999999999999").mask(membro.querySelector(`input[name="membro_${i}_cns"]`));
      Inputmask("99/99/9999").mask(membro.querySelector(`input[name="membro_${i}_dataNascimento"]`));
    }
  }
}
window.addEventListener('online', sincronizarOffline);

function sincronizarOffline() {
  const request = indexedDB.open("censoDB", 1);

  request.onsuccess = function (event) {
    const db = event.target.result;
    const tx = db.transaction("respostas", "readwrite");
    const store = tx.objectStore("respostas");
    const getAll = store.getAll();

    getAll.onsuccess = async function () {
      for (const dados of getAll.result) {
        try {
          await addDoc(collection(db, "respostasCenso"), dados);
        } catch (e) {
          console.error("Erro ao sincronizar:", e);
        }
      }
      store.clear();
    };
  };
}
