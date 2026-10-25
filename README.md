# Oliveira Turismo - Gestão de Poltronas e Viagens 🚌

Sistema web moderno e responsivo para gestão e consulta de poltronas de ônibus para viagens e turismo.

Desenvolvido para **Oliveira Turismo** com interface intuitiva e sincronização em tempo real utilizando **Firebase Firestore**.

---

## 🚀 Funcionalidades

### 👤 Área do Passageiro
- **Consulta Rápida por Nome:** O passageiro digita seu nome completo e localiza instantaneamente o número da sua poltrona reservada.
- **Cartão Visual de Embarque:** Exibição clara e destacada com confirmação visual.

### 🛡️ Área do Administrador
- **Acesso Seguro por Senha:** Protegido por autenticação (senha padrão: `admin123`).
- **Mapa do Ônibus (48 Lugares):** Layout visual realista (12 fileiras com 4 poltronas cada, corredor central e indicação de motorista / porta).
- **Cadastro e Liberação de Poltronas:** Clique em qualquer assento para registrar nome completo e RG/documento do passageiro ou liberar o assento.
- **Contador de Ocupação:** Acompanhe em tempo real quantos lugares estão ocupados de 48.

---

## 🛠️ Tecnologias Utilizadas

- **HTML5 & CSS3**
- **Tailwind CSS** (design moderno, responsivo e limpo)
- **React 18** (gerenciamento de estado reativo)
- **Babel Standalone**
- **Firebase Firestore** (banco de dados NoSQL em tempo real na nuvem)

---

## ⚙️ Configuração do Firebase

O projeto já está configurado para se conectar à coleção `bus_seats` no Firebase Firestore.

Caso utilize outro projeto ou precise ajustar as regras de segurança no console do Firebase:
1. Acesse o [Firebase Console](https://console.firebase.google.com/).
2. Vá em **Firestore Database** > **Regras (Rules)**.
3. Permita leitura e escrita para testes:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

---

## 🌐 Como Executar

Por ser uma aplicação baseada em HTML único e CDN:
1. Dê um duplo clique no arquivo `index.html` para abrir diretamente no navegador (Chrome, Edge, Firefox).
2. Ou abra a pasta no **VS Code** e utilize a extensão **Live Server** ("Open with Live Server").
3. Pode ser hospedado gratuitamente no **GitHub Pages**, **Vercel** ou **Netlify**.
